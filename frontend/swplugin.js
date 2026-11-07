// Emits /sw.js with the list of built files so the help screens work offline.
// Django serves it from the site root (config.views.service_worker) so its scope is '/'.
export default function offlineServiceWorker() {
  return {
    name: 'agk-offline-sw',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.html')).map((f) => `/static/${f}`)
      const source = `// Generated at build time. Network-first for pages and API, cache-first for hashed assets.
const CACHE = 'agk-${Date.now().toString(36)}'
const PRECACHE = ['/', ...${JSON.stringify(files)}]
const API_CACHE = ['/api/support/resources/', '/api/support/responders/']
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all([...PRECACHE, ...API_CACHE].map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
const keep = (req, res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) } return res }
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/static/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => keep(req, res))))
  } else if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => keep('/', res)).catch(() => caches.match('/')))
  } else if (API_CACHE.includes(url.pathname)) {
    e.respondWith(fetch(req).then((res) => keep(req, res)).catch(() => caches.match(req)))
  }
})
`
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}
