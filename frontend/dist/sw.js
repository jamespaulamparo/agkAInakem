// Generated at build time. Network-first for pages and API, cache-first for hashed assets.
const CACHE = 'agk-mw620fs4'
const PRECACHE = ['/', ...["/static/assets/plus-jakarta-sans-latin-600-normal-DLTa1BUW.woff2","/static/assets/plus-jakarta-sans-latin-500-normal-Bf-nb4oT.woff2","/static/assets/plus-jakarta-sans-latin-700-normal-CfpNZvy6.woff2","/static/assets/plus-jakarta-sans-latin-800-normal-CusIZhrK.woff2","/static/assets/newsreader-latin-400-normal-BFBkh4jY.woff2","/static/assets/newsreader-latin-400-italic-CEihAR-f.woff2","/static/assets/newsreader-latin-500-normal-B66TYsaK.woff2","/static/assets/newsreader-latin-600-normal-30OJ_TG_.woff2","/static/assets/newsreader-latin-500-italic-Bsgye1qA.woff2","/static/assets/plus-jakarta-sans-latin-400-normal-Dhut76fR.woff2","/static/assets/plus-jakarta-sans-latin-600-normal-BR_Ojra4.woff","/static/assets/plus-jakarta-sans-latin-500-normal-DYtqi0QS.woff","/static/assets/plus-jakarta-sans-latin-700-normal-DqEcQeE5.woff","/static/assets/plus-jakarta-sans-latin-800-normal-BRNHt2w0.woff","/static/assets/newsreader-latin-400-normal-gRTjlS2D.woff","/static/assets/newsreader-latin-400-italic-CNZoH1hn.woff","/static/assets/newsreader-latin-500-normal-DFwuUcdu.woff","/static/assets/newsreader-latin-600-normal-DUnT2r2g.woff","/static/assets/newsreader-latin-500-italic-m-xI0GeS.woff","/static/assets/plus-jakarta-sans-latin-400-normal-BDKaGhyp.woff","/static/assets/index-CMqowkRK.css","/static/assets/three-Dyn6OeXR.js","/static/assets/d3-3f6k_toD.js","/static/assets/index-Br8csjWy.js","/static/assets/Home-Clx6aUC6.js","/static/assets/Dictionary-CqXrY5-u.js","/static/assets/Word-DFQJpWC8.js","/static/assets/Explore-BqSB0SU0.js","/static/assets/crisis-Cl1btZbw.js","/static/assets/TypeTag-_7IojXBs.js","/static/assets/Help-C-PaJUpf.js","/static/assets/HelpChoices-DW6WrZbC.js","/static/assets/About-B_kWkR4D.js","/static/assets/Saved--7Km1eN2.js","/static/assets/saved-Dh5DgHjy.js","/static/assets/Extension-CeBknpkX.js","/static/assets/NotFound-BtAE8crh.js","/static/assets/Journal-BDJRm-7c.js","/static/assets/ProNudge-1yOUPzop.js","/static/assets/Auth-55spUI0M.js","/static/assets/Account-BQ9KzAqn.js","/static/assets/Credits-BglAHZyC.js","/static/assets/Privacy-DrmKrNT3.js","/static/assets/StatsToggle-CRPEiXay.js","/static/assets/Dashboard-CasNRnMc.js","/static/assets/Share-9Kij0mp2.js","/static/assets/Reset-CNzLaNKa.js","/static/assets/Heart3D-DKbf5EMi.js","/static/assets/WordMap-Lt10gerT.js","/static/assets/Calm-7OvH7euQ.js","/static/assets/Emergency-Bl027BVC.js","/static/assets/Plan-XbA1v21K.js","/static/assets/Someone-CMMfr3q_.js","/static/assets/CheckIn-BZ2Mh5_e.js","/static/assets/EntryEditor--9oeawJ0.js","/static/assets/Professional-ChM2wK5U.js","/static/assets/Patterns-kOapuuLV.js","/static/assets/patterns-BO9pRQ9O.js","/static/assets/Talk-BPt64gl4.js","/static/assets/Illustrations-xzF7tXxh.js","/static/assets/feelings-BeP-ajl4.js"]]
const API_CACHE = ['/api/support/resources/']
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
