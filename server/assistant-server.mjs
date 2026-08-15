import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    const rawValue = trimmed.slice(index + 1).trim()
    const value = rawValue.replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadDotEnv()

const PORT = Number(process.env.ALIMI_ASSISTANT_PORT || process.env.PORT || 4179)
const HOST = process.env.ALIMI_ASSISTANT_HOST || '0.0.0.0'
const DATA_FILE = process.env.ALIMI_ASSISTANT_DATA_FILE || path.join(__dirname, 'data', 'assistant-chat.json')
const DATABASE_URL = process.env.DATABASE_URL || ''

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    })
  : null

const defaultSettings = {
  enabled: true,
  title: {
    fa: 'دستیار هوشمند علیمی',
    ps: 'د علیمي هوښیار مرستیال',
    en: 'Alimi smart assistant',
  },
  statusText: {
    fa: 'آماده پاسخ‌گویی',
    ps: 'ځواب ورکولو ته چمتو',
    en: 'Ready to help',
  },
  adminName: 'مدیر علیمی',
  namePromptTitle: {
    fa: 'قبل از شروع، نام‌تان را بنویسید',
    ps: 'له پیل مخکې خپل نوم ولیکئ',
    en: 'Before we start, enter your name',
  },
  namePromptText: {
    fa: 'برای اینکه بتوانیم بهتر پاسخ بدهیم، لطفا نام خود را وارد کنید.',
    ps: 'د ښه ځواب لپاره مهرباني وکړئ خپل نوم ولیکئ.',
    en: 'Please enter your name so we can respond better.',
  },
  namePlaceholder: {
    fa: 'نام شما...',
    ps: 'ستاسو نوم...',
    en: 'Your name...',
  },
  welcomeMessage: {
    fa: 'سلام {name}! خوش آمدید. پیام خود را بنویسید؛ همکاران علیمی پاسخ می‌دهند.',
    ps: 'سلام {name}! ښه راغلاست. خپل پیغام ولیکئ؛ د علیمي همکاران ځواب درکوي.',
    en: 'Hello {name}! Welcome. Write your message and the Alimi team will reply.',
  },
  messagePlaceholder: {
    fa: 'پیام خود را بنویسید...',
    ps: 'خپل پیغام ولیکئ...',
    en: 'Write your message...',
  },
}

let schemaReady = null

function ensureDataFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ settings: defaultSettings, conversations: [], data: {} }, null, 2),
      'utf8',
    )
  }
}

function readFileData() {
  ensureDataFile()
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    return {
      settings: normalizeSettings(parsed?.settings || {}),
      conversations: Array.isArray(parsed?.conversations) ? parsed.conversations : [],
      data: parsed?.data && typeof parsed.data === 'object' ? parsed.data : {},
      adminAuth: parsed?.adminAuth || null,
    }
  } catch {
    return { settings: normalizeSettings(defaultSettings), conversations: [], data: {}, adminAuth: null }
  }
}

function writeFileData(data) {
  ensureDataFile()
  const temp = `${DATA_FILE}.tmp`
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(temp, DATA_FILE)
}

async function ensureSchema() {
  if (!pool) return
  if (!schemaReady) {
    schemaReady = pool.query(`
      create table if not exists app_data (
        section text primary key,
        value jsonb not null,
        updated_at timestamptz not null default now()
      );

      create table if not exists assistant_settings (
        id boolean primary key default true,
        value jsonb not null,
        updated_at timestamptz not null default now()
      );

      create table if not exists assistant_conversations (
        id text primary key,
        visitor_name text not null,
        visitor_id text not null,
        unread_by_admin integer not null default 0,
        unread_by_user integer not null default 0,
        created_at bigint not null,
        updated_at bigint not null
      );

      create table if not exists assistant_messages (
        id text primary key,
        conversation_id text not null references assistant_conversations(id) on delete cascade,
        sender text not null,
        sender_name text not null,
        text text not null,
        system boolean not null default false,
        created_at bigint not null
      );

      create table if not exists admin_auth (
        id boolean primary key default true,
        email text not null,
        password text not null,
        updated_at timestamptz not null default now()
      );
    `)
  }
  await schemaReady
}

async function getSettings() {
  if (!pool) return readFileData().settings
  await ensureSchema()
  const result = await pool.query('select value from assistant_settings where id = true')
  if (result.rows[0]?.value) return normalizeSettings(result.rows[0].value)
  await saveSettings(defaultSettings)
  return normalizeSettings(defaultSettings)
}

async function saveSettings(settings) {
  const normalized = normalizeSettings(settings)
  if (!pool) {
    const data = readFileData()
    data.settings = normalized
    writeFileData(data)
    return normalized
  }
  await ensureSchema()
  await pool.query(
    `insert into assistant_settings (id, value, updated_at)
     values (true, $1::jsonb, now())
     on conflict (id) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(normalized)],
  )
  return normalized
}

async function listConversations() {
  if (!pool) return normalizeConversations(readFileData().conversations)
  await ensureSchema()
  const { rows } = await pool.query(`
    select
      c.id,
      c.visitor_name as "visitorName",
      c.visitor_id as "visitorId",
      c.unread_by_admin as "unreadByAdmin",
      c.unread_by_user as "unreadByUser",
      c.created_at as "createdAt",
      c.updated_at as "updatedAt",
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', m.id,
            'sender', m.sender,
            'senderName', m.sender_name,
            'text', m.text,
            'system', m.system,
            'createdAt', m.created_at
          )
          order by m.created_at asc
        ) filter (where m.id is not null),
        '[]'::jsonb
      ) as messages
    from assistant_conversations c
    left join assistant_messages m on m.conversation_id = c.id
    group by c.id
    order by c.updated_at desc
  `)
  return normalizeConversations(rows)
}

async function snapshot() {
  return {
    settings: await getSettings(),
    conversations: await listConversations(),
  }
}

async function getAppData(section) {
  if (!pool) return readFileData().data?.[section] ?? null
  await ensureSchema()
  const result = await pool.query('select value from app_data where section = $1', [section])
  return result.rows[0]?.value ?? null
}

async function setAppData(section, value) {
  if (!pool) {
    const data = readFileData()
    data.data = { ...(data.data || {}), [section]: value }
    writeFileData(data)
    return value
  }
  await ensureSchema()
  await pool.query(
    `insert into app_data (section, value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (section) do update set value = excluded.value, updated_at = now()`,
    [section, JSON.stringify(value)],
  )
  return value
}

async function deleteAppData(section) {
  if (!pool) {
    const data = readFileData()
    delete data.data?.[section]
    writeFileData(data)
    return
  }
  await ensureSchema()
  await pool.query('delete from app_data where section = $1', [section])
}

async function getAdminAuth() {
  const fallback = { email: 'admin@gmail.com', password: 'mynameisadmin' }
  if (!pool) return readFileData().adminAuth || fallback
  await ensureSchema()
  const result = await pool.query('select email, password from admin_auth where id = true')
  if (result.rows[0]) return result.rows[0]
  await saveAdminAuth(fallback)
  return fallback
}

async function saveAdminAuth(auth) {
  const normalized = {
    email: cleanText(auth?.email, 200) || 'admin@gmail.com',
    password: String(auth?.password || '') || 'mynameisadmin',
  }
  if (!pool) {
    const data = readFileData()
    data.adminAuth = normalized
    writeFileData(data)
    return normalized
  }
  await ensureSchema()
  await pool.query(
    `insert into admin_auth (id, email, password, updated_at)
     values (true, $1, $2, now())
     on conflict (id) do update set email = excluded.email, password = excluded.password, updated_at = now()`,
    [normalized.email, normalized.password],
  )
  return normalized
}

function normalizeConversations(rows) {
  return Array.isArray(rows)
    ? rows
        .filter(Boolean)
        .map((row) => ({
          ...row,
          messages: Array.isArray(row?.messages) ? row.messages : [],
          unreadByAdmin: Number(row?.unreadByAdmin || 0),
          unreadByUser: Number(row?.unreadByUser || 0),
        }))
        .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    : []
}

function json(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

function noContent(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end()
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error('Payload too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!body) return resolve({})
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

const sseClients = new Set()
function broadcast(type = 'change') {
  const payload = `data: ${JSON.stringify({ type, at: Date.now() })}\n\n`
  for (const res of sseClients) {
    try {
      res.write(payload)
    } catch {
      sseClients.delete(res)
    }
  }
}

function cleanText(value, max = 5000) {
  return String(value || '').trim().slice(0, max)
}

function isLocalizedValue(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function cleanLocalizedText(value, max = 5000) {
  if (!isLocalizedValue(value)) {
    const text = cleanText(value, max)
    return { fa: text, ps: '', en: '' }
  }

  return {
    fa: cleanText(value.fa, max),
    ps: cleanText(value.ps, max),
    en: cleanText(value.en, max),
  }
}

function localizedText(value, language = 'fa') {
  if (!isLocalizedValue(value)) return cleanText(value)
  const order = [language, 'fa', 'ps', 'en']
  for (const code of order) {
    const text = cleanText(value[code])
    if (text) return text
  }
  return ''
}

function normalizeSettings(settings = {}) {
  const merged = { ...defaultSettings, ...settings }
  ;[
    'title',
    'statusText',
    'namePromptTitle',
    'namePromptText',
    'namePlaceholder',
    'welcomeMessage',
    'messagePlaceholder',
  ].forEach((field) => {
    merged[field] = cleanLocalizedText(merged[field])
  })
  merged.enabled = settings?.enabled !== false
  merged.adminName = cleanText(merged.adminName || defaultSettings.adminName, 100)
  return merged
}

async function createConversation(body) {
  const visitorName = cleanText(body?.visitorName, 80)
  const visitorId = cleanText(body?.visitorId, 120) || `visitor-${crypto.randomUUID()}`
  const language = ['fa', 'ps', 'en'].includes(body?.language) ? body.language : 'fa'
  if (!visitorName) {
    const error = new Error('نام کاربر ضروری است.')
    error.status = 400
    throw error
  }

  const settings = await getSettings()
  const now = Date.now()
  const conversation = {
    id: `chat-${crypto.randomUUID()}`,
    visitorName,
    visitorId,
    createdAt: now,
    updatedAt: now,
    unreadByAdmin: 0,
    unreadByUser: 0,
    messages: [
      {
        id: `message-${crypto.randomUUID()}`,
        sender: 'admin',
        senderName: settings.adminName,
        text: localizedText(settings.welcomeMessage, language).replaceAll('{name}', visitorName),
        createdAt: now,
        system: true,
      },
    ],
  }

  if (!pool) {
    const data = readFileData()
    data.conversations.unshift(conversation)
    writeFileData(data)
    return conversation
  }

  await ensureSchema()
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query(
      `insert into assistant_conversations
       (id, visitor_name, visitor_id, unread_by_admin, unread_by_user, created_at, updated_at)
       values ($1, $2, $3, 0, 0, $4, $4)`,
      [conversation.id, visitorName, visitorId, now],
    )
    const message = conversation.messages[0]
    await client.query(
      `insert into assistant_messages
       (id, conversation_id, sender, sender_name, text, system, created_at)
       values ($1, $2, $3, $4, $5, true, $6)`,
      [message.id, conversation.id, message.sender, message.senderName, message.text, now],
    )
    await client.query('commit')
    return conversation
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

async function addMessage(conversationId, body) {
  const text = cleanText(body?.text)
  if (!text) {
    const error = new Error('پیام خالی است.')
    error.status = 400
    throw error
  }
  const sender = body?.sender === 'admin' ? 'admin' : 'user'
  const now = Date.now()
  const settings = await getSettings()

  if (!pool) {
    const data = readFileData()
    const conversation = data.conversations.find((item) => item.id === conversationId)
    if (!conversation) {
      const error = new Error('گفتگو پیدا نشد.')
      error.status = 404
      throw error
    }
    const message = {
      id: `message-${crypto.randomUUID()}`,
      sender,
      senderName: cleanText(body?.senderName, 100) || (sender === 'admin' ? settings.adminName : conversation.visitorName),
      text,
      createdAt: now,
    }
    conversation.messages = [...(conversation.messages || []), message]
    conversation.updatedAt = now
    if (sender === 'user') conversation.unreadByAdmin = Number(conversation.unreadByAdmin || 0) + 1
    else conversation.unreadByUser = Number(conversation.unreadByUser || 0) + 1
    writeFileData(data)
    return message
  }

  await ensureSchema()
  const existing = await pool.query(
    'select visitor_name from assistant_conversations where id = $1',
    [conversationId],
  )
  if (!existing.rows[0]) {
    const error = new Error('گفتگو پیدا نشد.')
    error.status = 404
    throw error
  }
  const message = {
    id: `message-${crypto.randomUUID()}`,
    sender,
    senderName: cleanText(body?.senderName, 100) || (sender === 'admin' ? settings.adminName : existing.rows[0].visitor_name),
    text,
    createdAt: now,
  }
  await pool.query(
    `insert into assistant_messages (id, conversation_id, sender, sender_name, text, system, created_at)
     values ($1, $2, $3, $4, $5, false, $6)`,
    [message.id, conversationId, sender, message.senderName, text, now],
  )
  await pool.query(
    `update assistant_conversations
     set updated_at = $2,
       unread_by_admin = unread_by_admin + $3,
       unread_by_user = unread_by_user + $4
     where id = $1`,
    [conversationId, now, sender === 'user' ? 1 : 0, sender === 'admin' ? 1 : 0],
  )
  return message
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname

  if (req.method === 'OPTIONS') return noContent(res)

  if (pathname === '/api/assistant/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })
    res.write(`data: ${JSON.stringify({ type: 'connected', at: Date.now() })}\n\n`)
    sseClients.add(res)
    req.on('close', () => sseClients.delete(res))
    return
  }

  try {
    if (pathname === '/api/assistant/health' && req.method === 'GET') {
      return json(res, 200, { ok: true, port: PORT, database: pool ? 'postgresql' : 'file-fallback' })
    }

    if (pathname === '/api/assistant/snapshot' && req.method === 'GET') {
      return json(res, 200, await snapshot())
    }

    if (pathname === '/api/assistant/settings' && req.method === 'POST') {
      await saveSettings(await readBody(req))
      broadcast('settings')
      return json(res, 200, await snapshot())
    }

    if (pathname === '/api/assistant/conversations' && req.method === 'POST') {
      const conversation = await createConversation(await readBody(req))
      broadcast('conversation-create')
      return json(res, 201, { ...(await snapshot()), conversation })
    }

    const messageMatch = pathname.match(/^\/api\/assistant\/conversations\/([^/]+)\/messages$/)
    if (messageMatch && req.method === 'POST') {
      const conversationId = decodeURIComponent(messageMatch[1])
      const message = await addMessage(conversationId, await readBody(req))
      broadcast('message')
      return json(res, 201, { ...(await snapshot()), message })
    }

    const readMatch = pathname.match(/^\/api\/assistant\/conversations\/([^/]+)\/read$/)
    if (readMatch && req.method === 'POST') {
      const conversationId = decodeURIComponent(readMatch[1])
      const body = await readBody(req)
      if (!pool) {
        const data = readFileData()
        const conversation = data.conversations.find((item) => item.id === conversationId)
        if (!conversation) return json(res, 404, { message: 'گفتگو پیدا نشد.' })
        if (body?.reader === 'user') conversation.unreadByUser = 0
        else conversation.unreadByAdmin = 0
        writeFileData(data)
      } else {
        await ensureSchema()
        await pool.query(
          `update assistant_conversations
           set unread_by_user = case when $2 = 'user' then 0 else unread_by_user end,
               unread_by_admin = case when $2 = 'user' then unread_by_admin else 0 end
           where id = $1`,
          [conversationId, body?.reader === 'user' ? 'user' : 'admin'],
        )
      }
      broadcast('read')
      return json(res, 200, await snapshot())
    }

    const conversationMatch = pathname.match(/^\/api\/assistant\/conversations\/([^/]+)$/)
    if (conversationMatch && req.method === 'DELETE') {
      const conversationId = decodeURIComponent(conversationMatch[1])
      if (!pool) {
        const data = readFileData()
        data.conversations = data.conversations.filter((item) => item.id !== conversationId)
        writeFileData(data)
      } else {
        await ensureSchema()
        await pool.query('delete from assistant_conversations where id = $1', [conversationId])
      }
      broadcast('delete')
      return json(res, 200, await snapshot())
    }

    const dataMatch = pathname.match(/^\/api\/data\/([^/]+)$/)
    if (dataMatch && req.method === 'GET') {
      const section = decodeURIComponent(dataMatch[1])
      return json(res, 200, { section, value: await getAppData(section) })
    }

    if (dataMatch && req.method === 'POST') {
      const section = decodeURIComponent(dataMatch[1])
      const body = await readBody(req)
      const value = Object.prototype.hasOwnProperty.call(body, 'value') ? body.value : body
      await setAppData(section, value)
      broadcast(`data:${section}`)
      return json(res, 200, { section, value })
    }

    if (dataMatch && req.method === 'DELETE') {
      const section = decodeURIComponent(dataMatch[1])
      await deleteAppData(section)
      broadcast(`data:${section}`)
      return json(res, 200, { section, value: null })
    }

    if (pathname === '/api/admin-auth' && req.method === 'GET') {
      return json(res, 200, await getAdminAuth())
    }

    if (pathname === '/api/admin-auth' && req.method === 'POST') {
      return json(res, 200, await saveAdminAuth(await readBody(req)))
    }
  } catch (error) {
    return json(res, error.status || 500, { message: error.message || 'Server error' })
  }

  return json(res, 404, { message: 'Not found' })
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Alimi server already running on http://127.0.0.1:${PORT}`)
    console.log('Keeping assistant process alive so the web app can continue.')
    setInterval(() => {}, 60 * 60 * 1000)
    return
  }

  throw error
})

server.listen(PORT, HOST, async () => {
  if (pool) await ensureSchema()
  console.log(`Alimi server: http://127.0.0.1:${PORT}`)
  console.log(`Data backend: ${pool ? 'PostgreSQL' : `file fallback (${DATA_FILE})`}`)
})

process.on('SIGINT', () => server.close(() => process.exit(0)))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
