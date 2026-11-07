// Thin client for the Django REST API (same origin in production, proxied by Vite in dev).
const cache = new Map()

const csrf = () => document.cookie.split('; ').find((c) => c.startsWith('csrftoken='))?.split('=')[1] || ''

async function request(path, { method = 'GET', body, cacheable = method === 'GET' } = {}) {
  if (cacheable && cache.has(path)) return cache.get(path)
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') headers['X-CSRFToken'] = csrf()
  const p = fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  }).then(async (res) => {
    const data = res.status === 204 ? {} : await res.json().catch(() => ({}))
    if (!res.ok) {
      cache.delete(path)
      const err = new Error(data.detail || `Request failed (${res.status})`)
      err.status = res.status
      err.data = data
      throw err
    }
    return data
  })
  if (cacheable) cache.set(path, p)
  return p
}

export const api = {
  categories: () => request('/dictionary/categories/'),
  search: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()
    return request(`/dictionary/search/${qs ? `?${qs}` : ''}`)
  },
  term: (slug) => request(`/dictionary/terms/${slug}/`),
  related: (slug) => request(`/dictionary/terms/${slug}/related/`),
  graph: () => request('/dictionary/graph/'),
  explore: (text, lang) => request('/discovery/explore/', { method: 'POST', body: { text, lang } }),
  resources: () => request('/support/resources/'),
  responders: () => request('/support/responders/'),
  supportRequest: (body) => request('/support/requests/', { method: 'POST', body }),
  checkIn: (body) => request('/check-ins/', { method: 'POST', body }),
  // optional account
  me: () => request('/auth/me/', { cacheable: false }),
  register: (body) => request('/auth/register/', { method: 'POST', body }),
  login: (body) => request('/auth/login/', { method: 'POST', body }),
  logout: () => request('/auth/logout/', { method: 'POST', body: {} }),
  exportData: () => request('/auth/export/', { cacheable: false }),
  deleteAccount: (password) => request('/auth/delete/', { method: 'POST', body: { password } }),
  // journal (account only)
  journal: () => request('/journal/entries/', { cacheable: false }),
  saveEntry: (date, body) => request(`/journal/entries/${date}/`, { method: 'PUT', body }),
  deleteEntry: (date) => request(`/journal/entries/${date}/`, { method: 'DELETE' }),
  importEntries: (entries) => request('/journal/import/', { method: 'POST', body: { entries } }),
}

// Small hook-free helper: run an async loader inside useEffect.
import { useEffect, useState } from 'react'
export function useApi(loader, deps) {
  const [state, set] = useState({ data: null, error: null, loading: true })
  useEffect(() => {
    let alive = true
    set((s) => ({ ...s, loading: true, error: null }))
    loader()
      .then((data) => alive && set({ data, error: null, loading: false }))
      .catch((error) => alive && set({ data: null, error, loading: false }))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return state
}
