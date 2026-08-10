import { fetchRemoteAdminAuth, saveRemoteAdminAuth } from './remoteStore'

const ADMIN_AUTH_KEY = 'alimi-admin-auth-v1'
const ADMIN_SESSION_KEY = 'alimi-admin-session-v1'

const defaultAdminAuth = {
  email: 'admin@gmail.com',
  password: 'mynameisadmin',
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value || 'null') || fallback
  } catch {
    return fallback
  }
}

export function getAdminAuth() {
  if (typeof localStorage === 'undefined') return defaultAdminAuth
  fetchRemoteAdminAuth()
    .then((auth) => {
      if (!auth?.email || !auth?.password) return
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(auth))
    })
    .catch(() => {})
  const saved = safeParse(localStorage.getItem(ADMIN_AUTH_KEY), {})
  return {
    email: String(saved.email || defaultAdminAuth.email),
    password: String(saved.password || defaultAdminAuth.password),
  }
}

export function saveAdminAuth(nextAuth) {
  const normalized = {
    email: String(nextAuth?.email || '').trim() || defaultAdminAuth.email,
    password: String(nextAuth?.password || '') || defaultAdminAuth.password,
  }
  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(normalized))
  saveRemoteAdminAuth(normalized).catch((error) => {
    console.warn('Admin credentials saved locally; PostgreSQL API unavailable:', error.message)
  })
  return normalized
}

export function verifyAdminLogin(email, password) {
  const auth = getAdminAuth()
  return (
    String(email || '').trim().toLowerCase() === auth.email.toLowerCase() &&
    String(password || '') === auth.password
  )
}

export function isAdminLoggedIn() {
  return false
}

export function setAdminLoggedIn(value) {
  if (typeof sessionStorage === 'undefined') return
  if (value) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
  } else {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  }
}
