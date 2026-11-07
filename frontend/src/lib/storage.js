// Per-browser conveniences only (language, saved words). Wrapped because storage can be unavailable.
export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v == null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}
export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ }
}
