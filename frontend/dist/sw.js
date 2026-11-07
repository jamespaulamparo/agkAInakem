// Generated at build time. Network-first for pages and API, cache-first for hashed assets.
const CACHE = 'agk-mw64d7vt'
const PRECACHE = ['/', ...["/static/assets/plus-jakarta-sans-latin-600-normal-DLTa1BUW.woff2","/static/assets/plus-jakarta-sans-latin-700-normal-CfpNZvy6.woff2","/static/assets/plus-jakarta-sans-latin-400-normal-Dhut76fR.woff2","/static/assets/newsreader-latin-500-normal-B66TYsaK.woff2","/static/assets/plus-jakarta-sans-latin-500-normal-Bf-nb4oT.woff2","/static/assets/plus-jakarta-sans-latin-800-normal-CusIZhrK.woff2","/static/assets/newsreader-latin-400-italic-CEihAR-f.woff2","/static/assets/newsreader-latin-500-italic-Bsgye1qA.woff2","/static/assets/newsreader-latin-400-normal-BFBkh4jY.woff2","/static/assets/newsreader-latin-600-normal-30OJ_TG_.woff2","/static/assets/plus-jakarta-sans-latin-700-normal-DqEcQeE5.woff","/static/assets/plus-jakarta-sans-latin-600-normal-BR_Ojra4.woff","/static/assets/plus-jakarta-sans-latin-500-normal-DYtqi0QS.woff","/static/assets/plus-jakarta-sans-latin-400-normal-BDKaGhyp.woff","/static/assets/newsreader-latin-500-normal-DFwuUcdu.woff","/static/assets/newsreader-latin-400-italic-CNZoH1hn.woff","/static/assets/newsreader-latin-500-italic-m-xI0GeS.woff","/static/assets/plus-jakarta-sans-latin-800-normal-BRNHt2w0.woff","/static/assets/newsreader-latin-600-normal-DUnT2r2g.woff","/static/assets/newsreader-latin-400-normal-gRTjlS2D.woff","/static/assets/index-U0hYSegE.css","/static/assets/three-Dyn6OeXR.js","/static/assets/d3-3f6k_toD.js","/static/assets/index-Dn4f_WVe.js","/static/assets/Home-D5sPPKIW.js","/static/assets/Dictionary-DdcKm9OI.js","/static/assets/Word-BJyLCXkD.js","/static/assets/Explore-DX-r3gIf.js","/static/assets/crisis-CSuqFC9o.js","/static/assets/TypeTag-B32oNu38.js","/static/assets/Help-B7_PDgfG.js","/static/assets/HelpChoices-z63gWGQ5.js","/static/assets/About-BE7EAXK6.js","/static/assets/Saved-TMZQ1Gjk.js","/static/assets/saved-7NSO1pPi.js","/static/assets/Extension-H1p3ccC1.js","/static/assets/NotFound-CZmbPAwA.js","/static/assets/Journal-D2AjspEb.js","/static/assets/ProNudge-DwugLvjQ.js","/static/assets/Auth-BFSD9bUR.js","/static/assets/Account-C0ibB0Yq.js","/static/assets/Credits-BUFtr8Ls.js","/static/assets/Privacy-D2BoUo8i.js","/static/assets/StatsToggle-ymfb2f1a.js","/static/assets/Dashboard-CUF_PUqH.js","/static/assets/Share-DqPPMxFf.js","/static/assets/Reset-DmZ9nkBi.js","/static/assets/Heart3D-DKbf5EMi.js","/static/assets/WordMap-DL48zYOJ.js","/static/assets/Calm-Bv_6_VXX.js","/static/assets/Emergency-uIkNBzQ_.js","/static/assets/Plan-D7RpQfaE.js","/static/assets/Someone-CppFJETr.js","/static/assets/CheckIn-DgoUFmT9.js","/static/assets/EntryEditor-DIAU46wt.js","/static/assets/Professional-B74IqbMa.js","/static/assets/Patterns-BXBH6Pzd.js","/static/assets/patterns-BpAyCc7R.js","/static/assets/Talk-nSCqOUsr.js","/static/assets/Illustrations-xzF7tXxh.js","/static/assets/feelings-BeP-ajl4.js"]]
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
