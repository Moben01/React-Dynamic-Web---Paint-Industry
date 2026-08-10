export function apiRoot() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:4179/api'
  const configured = import.meta?.env?.VITE_API_ROOT
  if (configured) return String(configured).replace(/\/$/, '')
  const assistantRoot = import.meta?.env?.VITE_ASSISTANT_API_ROOT
  if (assistantRoot) return String(assistantRoot).replace(/\/assistant\/?$/, '')
  const host = window.location.hostname || '127.0.0.1'
  return `http://${host}:4179/api`
}

async function request(path, options = {}) {
  const response = await fetch(`${apiRoot()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload?.message || `Server error (${response.status})`)
  }
  return response.json()
}

export async function fetchRemoteSection(section) {
  const payload = await request(`/data/${encodeURIComponent(section)}`)
  return payload?.value ?? null
}

export async function saveRemoteSection(section, value) {
  const payload = await request(`/data/${encodeURIComponent(section)}`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  })
  return payload?.value ?? value
}

export async function resetRemoteSection(section) {
  const payload = await request(`/data/${encodeURIComponent(section)}`, {
    method: 'DELETE',
  })
  return payload?.value ?? null
}

export async function fetchRemoteAdminAuth() {
  return request('/admin-auth')
}

export async function saveRemoteAdminAuth(value) {
  return request('/admin-auth', {
    method: 'POST',
    body: JSON.stringify(value),
  })
}

export function hydrateRemoteSection(section, normalize, localKey, eventName) {
  if (typeof window === 'undefined') return
  fetchRemoteSection(section)
    .then((value) => {
      if (value === null || value === undefined) return
      const normalized = normalize ? normalize(value) : value
      localStorage.setItem(localKey, JSON.stringify(normalized))
      window.dispatchEvent(new CustomEvent(eventName, { detail: normalized }))
    })
    .catch(() => {
      // Offline/local development keeps using the local cache.
    })
}
