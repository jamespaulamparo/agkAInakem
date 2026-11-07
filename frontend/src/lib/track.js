/*
 * Anonymous usage counts (see /privacy §2). Sends only an event name and, sometimes, a label from a
 * fixed list — never text you typed, journal content, contacts, phone numbers, location or any ID.
 * Off when the person turns it off, or when the browser sends Global Privacy Control / Do Not Track.
 */
const KEY = 'agk_no_stats'
let queue = []
let timer = null

export function statsEnabled() {
  try {
    if (localStorage.getItem(KEY) === '1') return false
  } catch { /* storage unavailable: fall through */ }
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1') return false
  return true
}
export function setStatsEnabled(on) {
  try { on ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, '1') } catch { /* ignore */ }
  if (!on) queue = []
}
export const browserOptedOut = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1'

function flush(beacon = false) {
  clearTimeout(timer); timer = null
  if (!queue.length) return
  const body = JSON.stringify({ events: queue.splice(0, 25) })
  try {
    if (beacon && navigator.sendBeacon) navigator.sendBeacon('/api/events/', new Blob([body], { type: 'application/json' }))
    else fetch('/api/events/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true, credentials: 'omit' }).catch(() => {})
  } catch { /* ignore */ }
  if (queue.length) flush(beacon)
}

export function track(e, l) {
  if (!statsEnabled()) return
  queue.push(l ? { e, l } : { e })
  if (!timer) timer = setTimeout(() => flush(), 4000)
}

const PAGES = { '': 'home', help: 'help', dictionary: 'dictionary', explore: 'explore', journal: 'journal', saved: 'saved', about: 'about',
  privacy: 'privacy', credits: 'credits', share: 'share', extension: 'extension', account: 'account', login: 'login', register: 'register' }
const HELP = ['calm', 'talk', 'emergency', 'plan', 'someone', 'professional', 'check-in']
export function trackPage(pathname) {
  const [, a = '', b] = pathname.split('/')
  if (a === 'help' && HELP.includes(b)) return track('page', b)
  if (a === 'dictionary' && b) return track('page', 'word')
  track('page', PAGES[a] || 'other')
}

const HOTLINES = /^(911|1553|18001888|0917899|0908639|0288044|0917558|0961815|0945491)/
// One listener for every call / text link on the site, so individual buttons don't need wiring.
export function installTracking() {
  try {
    if (!sessionStorage.getItem('agk_v')) {
      sessionStorage.setItem('agk_v', '1')
      const w = window.innerWidth
      track('visit', w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
      try {
        track('lang', localStorage.getItem('agk_lang')?.includes('fil') ? 'fil' : 'en')
        const th = JSON.parse(localStorage.getItem('agk_theme') || '"system"')
        track('theme', th === 'system' ? 'auto' : th)
        if (localStorage.getItem('agk_simple') === 'true') track('simple_view')
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest?.('a[href^="tel:"], a[href^="sms:"], [data-track]')
    if (!a) return
    if (a.dataset.track) { const [e, l] = a.dataset.track.split(':'); return track(e, l) }
    const href = a.getAttribute('href')
    if (href.startsWith('sms:')) return track('text_contact')
    const n = href.slice(4).replace(/\D/g, '')
    if (n === '911') track('call', 'emergency')
    else if (HOTLINES.test(n)) track('call', 'crisis_line')
    else if (n.startsWith('072')) track('call', 'hospital')
    else track('call', 'contact')
  }, { capture: true })
  window.addEventListener('pagehide', () => flush(true))
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true) })
  window.addEventListener('appinstalled', () => track('pwa_install'))
}
