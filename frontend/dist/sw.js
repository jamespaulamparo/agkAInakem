// Generated at build time. Network-first for pages and API, cache-first for hashed assets.
const CACHE = 'agk-mw5x7p9l'
const PRECACHE = ['/', ...["/static/assets/index-deGlTbU8.css","/static/assets/three-Dyn6OeXR.js","/static/assets/d3-3f6k_toD.js","/static/assets/index-D8mOaPfb.js","/static/assets/Home-ZuYywoZz.js","/static/assets/Dictionary--_xPJWuv.js","/static/assets/Word-c5ycGP6q.js","/static/assets/Explore-C6aTe1De.js","/static/assets/crisis-DGT_lZZe.js","/static/assets/TypeTag-DDtNnL_B.js","/static/assets/Help-C7CV4B-b.js","/static/assets/HelpChoices-CqrH4p2Z.js","/static/assets/About-BdnId0Gs.js","/static/assets/Saved-PmtRdY8T.js","/static/assets/saved-COJJlxU0.js","/static/assets/Extension-BdvcT5HR.js","/static/assets/NotFound-CVw-AuZ3.js","/static/assets/Journal-Cqg-wXMs.js","/static/assets/Auth-DnHucNRg.js","/static/assets/Account-BOdMK5YN.js","/static/assets/Credits-BuueNZnw.js","/static/assets/Heart3D-DKbf5EMi.js","/static/assets/WordMap-Bl9_Nonx.js","/static/assets/Calm-DBU4g6Vg.js","/static/assets/Talk-LW0VX7RB.js","/static/assets/Emergency-c1FW1iVP.js","/static/assets/Plan-B4QEnhRr.js","/static/assets/Someone-DMQ-aO6m.js","/static/assets/Illustrations-D0xEdLPl.js","/static/assets/CheckIn-CyM9YcYO.js","/static/assets/journal-E_V_iX1X.js"]]
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
