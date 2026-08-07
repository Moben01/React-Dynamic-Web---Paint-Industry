import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PORT = Number(process.env.ALIMI_ASSISTANT_PORT || 4179)
const HOST = process.env.ALIMI_ASSISTANT_HOST || '0.0.0.0'
const DATA_FILE = process.env.ALIMI_ASSISTANT_DATA_FILE || path.join(__dirname, 'data', 'assistant-chat.json')

const defaultSettings = {
  enabled: true,
  title: 'دستیار هوشمند علیمی',
  statusText: 'آماده پاسخ‌گویی',
  adminName: 'مدیر علیمی',
  namePromptTitle: 'قبل از شروع، نام‌تان را بنویسید',
  namePromptText: 'برای اینکه بتوانیم بهتر پاسخ بدهیم، لطفاً نام خود را وارد کنید.',
  namePlaceholder: 'نام شما...',
  welcomeMessage: 'سلام {name}! خوش آمدید. پیام خود را بنویسید؛ همکاران علیمی پاسخ می‌دهند.',
  messagePlaceholder: 'پیام خود را بنویسید...',
}

function ensureDataFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ settings: defaultSettings, conversations: [] }, null, 2),
      'utf8',
    )
  }
}

function readData() {
  ensureDataFile()
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    return {
      settings: { ...defaultSettings, ...(parsed?.settings || {}) },
      conversations: Array.isArray(parsed?.conversations) ? parsed.conversations : [],
    }
  } catch {
    return { settings: { ...defaultSettings }, conversations: [] }
  }
}

function writeData(data) {
  ensureDataFile()
  const temp = `${DATA_FILE}.tmp`
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(temp, DATA_FILE)
}

function snapshot(data = readData()) {
  return {
    settings: data.settings,
    conversations: [...data.conversations].sort(
      (a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0),
    ),
  }
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
      if (body.length > 1024 * 1024) {
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

  if (pathname === '/api/assistant/health' && req.method === 'GET') {
    return json(res, 200, { ok: true, port: PORT })
  }

  if (pathname === '/api/assistant/snapshot' && req.method === 'GET') {
    return json(res, 200, snapshot())
  }

  try {
    if (pathname === '/api/assistant/settings' && req.method === 'POST') {
      const body = await readBody(req)
      const data = readData()
      data.settings = {
        ...defaultSettings,
        ...body,
        enabled: body?.enabled !== false,
        adminName: cleanText(body?.adminName || defaultSettings.adminName, 100),
      }
      writeData(data)
      broadcast('settings')
      return json(res, 200, snapshot(data))
    }

    if (pathname === '/api/assistant/conversations' && req.method === 'POST') {
      const body = await readBody(req)
      const visitorName = cleanText(body?.visitorName, 80)
      const visitorId = cleanText(body?.visitorId, 120) || `visitor-${crypto.randomUUID()}`
      if (!visitorName) return json(res, 400, { message: 'نام کاربر ضروری است.' })

      const data = readData()
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
            senderName: data.settings.adminName,
            text: data.settings.welcomeMessage.replaceAll('{name}', visitorName),
            createdAt: now,
            system: true,
          },
        ],
      }
      data.conversations.unshift(conversation)
      writeData(data)
      broadcast('conversation-create')
      return json(res, 201, { ...snapshot(data), conversation })
    }

    const messageMatch = pathname.match(/^\/api\/assistant\/conversations\/([^/]+)\/messages$/)
    if (messageMatch && req.method === 'POST') {
      const conversationId = decodeURIComponent(messageMatch[1])
      const body = await readBody(req)
      const text = cleanText(body?.text)
      if (!text) return json(res, 400, { message: 'پیام خالی است.' })

      const sender = body?.sender === 'admin' ? 'admin' : 'user'
      const data = readData()
      const conversation = data.conversations.find((item) => item.id === conversationId)
      if (!conversation) return json(res, 404, { message: 'گفتگو پیدا نشد.' })

      const now = Date.now()
      const message = {
        id: `message-${crypto.randomUUID()}`,
        sender,
        senderName:
          cleanText(body?.senderName, 100) ||
          (sender === 'admin' ? data.settings.adminName : conversation.visitorName),
        text,
        createdAt: now,
      }

      conversation.messages = Array.isArray(conversation.messages)
        ? [...conversation.messages, message]
        : [message]
      conversation.updatedAt = now
      if (sender === 'user') {
        conversation.unreadByAdmin = Number(conversation.unreadByAdmin || 0) + 1
      } else {
        conversation.unreadByUser = Number(conversation.unreadByUser || 0) + 1
      }

      writeData(data)
      broadcast('message')
      return json(res, 201, { ...snapshot(data), message })
    }

    const readMatch = pathname.match(/^\/api\/assistant\/conversations\/([^/]+)\/read$/)
    if (readMatch && req.method === 'POST') {
      const conversationId = decodeURIComponent(readMatch[1])
      const body = await readBody(req)
      const data = readData()
      const conversation = data.conversations.find((item) => item.id === conversationId)
      if (!conversation) return json(res, 404, { message: 'گفتگو پیدا نشد.' })
      if (body?.reader === 'user') conversation.unreadByUser = 0
      else conversation.unreadByAdmin = 0
      writeData(data)
      broadcast('read')
      return json(res, 200, snapshot(data))
    }

    const conversationMatch = pathname.match(/^\/api\/assistant\/conversations\/([^/]+)$/)
    if (conversationMatch && req.method === 'DELETE') {
      const conversationId = decodeURIComponent(conversationMatch[1])
      const data = readData()
      data.conversations = data.conversations.filter((item) => item.id !== conversationId)
      writeData(data)
      broadcast('delete')
      return json(res, 200, snapshot(data))
    }
  } catch (error) {
    return json(res, 500, { message: error.message || 'Server error' })
  }

  return json(res, 404, { message: 'Not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`Alimi assistant server: http://127.0.0.1:${PORT}`)
  console.log(`Assistant data file: ${DATA_FILE}`)
})

process.on('SIGINT', () => server.close(() => process.exit(0)))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
