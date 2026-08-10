import { localizedText, normalizeLocalizedValue } from '../i18n/localizedContent'

const SETTINGS_KEY = 'alimi-assistant-settings-v3'
const CONVERSATIONS_KEY = 'alimi-assistant-conversations-v3'
const VISITOR_KEY = 'alimi-assistant-visitor-v3'
const CHANGE_EVENT = 'alimi-assistant-change'
const CHANNEL_NAME = 'alimi-assistant-live-v3'

export const defaultAssistantSettings = {
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

const localizedSettingFields = [
  'title',
  'statusText',
  'namePromptTitle',
  'namePromptText',
  'namePlaceholder',
  'welcomeMessage',
  'messagePlaceholder',
]

function normalizeAssistantSettings(settings = {}) {
  const merged = {
    ...defaultAssistantSettings,
    ...settings,
    enabled: settings?.enabled !== false,
  }

  localizedSettingFields.forEach((field) => {
    merged[field] = normalizeLocalizedValue(merged[field], 'fa')
  })

  merged.adminName = String(merged.adminName || defaultAssistantSettings.adminName)
  return merged
}

export function assistantSettingText(settings, field, language = 'fa') {
  return localizedText(settings?.[field], language)
}

function safeParse(value, fallback) {
  try {
    const parsed = JSON.parse(value)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function normalizeConversation(row) {
  return {
    ...row,
    messages: Array.isArray(row?.messages) ? row.messages : [],
    unreadByAdmin: Number(row?.unreadByAdmin || 0),
    unreadByUser: Number(row?.unreadByUser || 0),
  }
}

function normalizeConversations(rows) {
  return Array.isArray(rows)
    ? rows
        .filter(Boolean)
        .map(normalizeConversation)
        .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    : []
}

function apiBase() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:4179/api/assistant'
  const configured = import.meta?.env?.VITE_ASSISTANT_API_ROOT
  if (configured) return String(configured).replace(/\/$/, '')
  const host = window.location.hostname || '127.0.0.1'
  return `http://${host}:4179/api/assistant`
}

function emitLocalChange(detail = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail }))
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ at: Date.now(), ...detail })
    channel.close()
  } catch {
    // BroadcastChannel is optional.
  }
}

function writeCache(snapshot, detail = {}) {
  if (typeof window === 'undefined') return
  if (snapshot?.settings) {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(normalizeAssistantSettings(snapshot.settings)),
    )
  }
  if (snapshot?.conversations) {
    localStorage.setItem(
      CONVERSATIONS_KEY,
      JSON.stringify(normalizeConversations(snapshot.conversations)),
    )
  }
  emitLocalChange(detail)
}

async function request(path = '', options = {}) {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload?.message || `Assistant server error (${response.status})`)
  }

  if (response.status === 204) return null
  return response.json()
}

export function getAssistantSettings() {
  if (typeof window === 'undefined') return normalizeAssistantSettings(defaultAssistantSettings)
  const saved = safeParse(localStorage.getItem(SETTINGS_KEY), {})
  return normalizeAssistantSettings(saved)
}

export function getAssistantConversations() {
  if (typeof window === 'undefined') return []
  return normalizeConversations(
    safeParse(localStorage.getItem(CONVERSATIONS_KEY), []),
  )
}

export async function syncAssistantFromServer({ silent = false } = {}) {
  try {
    const snapshot = await request('/snapshot', { method: 'GET' })
    writeCache(snapshot, { type: 'server-sync' })
    return snapshot
  } catch (error) {
    if (!silent) console.warn('Assistant server is not reachable:', error.message)
    return null
  }
}

export async function saveAssistantSettings(nextSettings) {
  const normalized = normalizeAssistantSettings(nextSettings)

  // Optimistic local update.
  writeCache({ settings: normalized }, { type: 'settings' })

  try {
    const snapshot = await request('/settings', {
      method: 'POST',
      body: JSON.stringify(normalized),
    })
    writeCache(snapshot, { type: 'settings-server' })
  } catch (error) {
    console.warn('Settings saved locally; server unavailable:', error.message)
  }

  return normalized
}

function createVisitorId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `visitor-${crypto.randomUUID()}`
  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export async function createAssistantConversation(visitorName, language = 'fa') {
  const name = String(visitorName || '').trim()
  if (!name) return null
  const currentVisitor = getAssistantVisitor()
  const visitorId = currentVisitor?.visitorId || createVisitorId()

  try {
    const payload = await request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ visitorName: name, visitorId, language }),
    })
    writeCache(payload, { type: 'conversation-create' })
    const conversation = payload?.conversation || null
    if (conversation) {
      setAssistantVisitor({ name, visitorId, activeConversationId: conversation.id })
    }
    return conversation
  } catch (error) {
    // Local fallback keeps the UI usable if the server has not been started yet.
    const now = Date.now()
    const settings = getAssistantSettings()
    const conversation = {
      id: `local-chat-${now}-${Math.random().toString(36).slice(2, 8)}`,
      visitorName: name,
      visitorId,
      createdAt: now,
      updatedAt: now,
      unreadByAdmin: 0,
      unreadByUser: 0,
      messages: [
        {
          id: `local-welcome-${now}`,
          sender: 'admin',
          senderName: settings.adminName,
          text: assistantSettingText(settings, 'welcomeMessage', language).replaceAll('{name}', name),
          createdAt: now,
          system: true,
        },
      ],
    }
    writeCache(
      { conversations: [conversation, ...getAssistantConversations()] },
      { type: 'conversation-local' },
    )
    setAssistantVisitor({ name, visitorId, activeConversationId: conversation.id })
    return conversation
  }
}

export async function addAssistantMessage(conversationId, message) {
  const text = String(message?.text || '').trim()
  if (!conversationId || !text) return null

  try {
    const payload = await request(
      `/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          sender: message?.sender === 'admin' ? 'admin' : 'user',
          senderName: String(message?.senderName || '').trim(),
          text,
        }),
      },
    )
    writeCache(payload, { type: 'message-server', conversationId })
    return payload?.message || null
  } catch (error) {
    const now = Date.now()
    const sender = message?.sender === 'admin' ? 'admin' : 'user'
    const settings = getAssistantSettings()
    let createdMessage = null
    const next = getAssistantConversations().map((conversation) => {
      if (conversation.id !== conversationId) return conversation
      createdMessage = {
        id: `local-${sender}-${now}-${Math.random().toString(36).slice(2, 7)}`,
        sender,
        senderName:
          String(message?.senderName || '').trim() ||
          (sender === 'admin' ? settings.adminName : conversation.visitorName),
        text,
        createdAt: now,
      }
      return {
        ...conversation,
        updatedAt: now,
        unreadByAdmin:
          sender === 'user' ? Number(conversation.unreadByAdmin || 0) + 1 : conversation.unreadByAdmin,
        unreadByUser:
          sender === 'admin' ? Number(conversation.unreadByUser || 0) + 1 : conversation.unreadByUser,
        messages: [...conversation.messages, createdMessage],
      }
    })
    writeCache({ conversations: next }, { type: 'message-local', conversationId })
    return createdMessage
  }
}

export async function markAssistantConversationRead(
  conversationId,
  reader = 'admin',
) {
  if (!conversationId) return
  try {
    const payload = await request(
      `/conversations/${encodeURIComponent(conversationId)}/read`,
      {
        method: 'POST',
        body: JSON.stringify({ reader }),
      },
    )
    writeCache(payload, { type: 'read-server', conversationId })
  } catch {
    const field = reader === 'user' ? 'unreadByUser' : 'unreadByAdmin'
    const next = getAssistantConversations().map((conversation) =>
      conversation.id === conversationId
        ? { ...conversation, [field]: 0 }
        : conversation,
    )
    writeCache({ conversations: next }, { type: 'read-local', conversationId })
  }
}

export async function deleteAssistantConversation(conversationId) {
  if (!conversationId) return
  try {
    const payload = await request(
      `/conversations/${encodeURIComponent(conversationId)}`,
      { method: 'DELETE' },
    )
    writeCache(payload, { type: 'delete-server', conversationId })
  } catch {
    const next = getAssistantConversations().filter(
      (conversation) => conversation.id !== conversationId,
    )
    writeCache({ conversations: next }, { type: 'delete-local', conversationId })
  }
}

export function getAssistantVisitor() {
  if (typeof window === 'undefined') return null
  const saved = safeParse(localStorage.getItem(VISITOR_KEY), null)
  if (!saved || typeof saved !== 'object') return null
  return saved
}

export function setAssistantVisitor(visitor) {
  if (typeof window === 'undefined') return null
  if (!visitor) {
    localStorage.removeItem(VISITOR_KEY)
    emitLocalChange({ type: 'visitor' })
    return null
  }
  const normalized = {
    name: String(visitor.name || '').trim(),
    visitorId: visitor.visitorId || createVisitorId(),
    activeConversationId: visitor.activeConversationId || null,
  }
  localStorage.setItem(VISITOR_KEY, JSON.stringify(normalized))
  emitLocalChange({ type: 'visitor' })
  return normalized
}

export function subscribeAssistantStore(callback) {
  if (typeof window === 'undefined') return () => {}

  let disposed = false
  let eventSource = null
  let pollTimer = null
  let syncInFlight = false

  const notify = () => {
    if (!disposed) callback()
  }

  const sync = async () => {
    if (disposed || syncInFlight) return
    syncInFlight = true
    try {
      await syncAssistantFromServer({ silent: true })
    } finally {
      syncInFlight = false
    }
  }

  const onCustom = () => notify()
  const onStorage = (event) => {
    if ([SETTINGS_KEY, CONVERSATIONS_KEY, VISITOR_KEY].includes(event.key)) {
      notify()
    }
  }

  let channel = null
  try {
    channel = new BroadcastChannel(CHANNEL_NAME)
    channel.addEventListener('message', onCustom)
  } catch {
    channel = null
  }

  window.addEventListener(CHANGE_EVENT, onCustom)
  window.addEventListener('storage', onStorage)

  // Server-Sent Events keeps Chrome/Firefox/Edge and other clients in sync.
  try {
    eventSource = new EventSource(`${apiBase()}/events`)
    eventSource.onmessage = () => sync()
    eventSource.onerror = () => {
      // Keep polling as a fallback when SSE reconnects or the server restarts.
    }
  } catch {
    eventSource = null
  }

  sync()
  pollTimer = window.setInterval(sync, 2500)

  return () => {
    disposed = true
    window.removeEventListener(CHANGE_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
    if (channel) {
      channel.removeEventListener('message', onCustom)
      channel.close()
    }
    if (eventSource) eventSource.close()
    if (pollTimer) window.clearInterval(pollTimer)
  }
}
