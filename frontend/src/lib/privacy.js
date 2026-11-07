// Data protection contact and helpers (RA 10173 — Data Privacy Act of 2012).
export const PRIVACY_VERSION = '2026-11-07.2'
export const DPO = { handle: 'jamespaulamparo', url: 'https://github.com/jamespaulamparo' }

// Erase everything agkAInakem keeps in this browser: journal (guest), plan, contacts,
// reminders, settings, saved words, and offline copies.
export async function clearDeviceData() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith('agk_') && k !== 'agk_no_stats').forEach((k) => localStorage.removeItem(k))
  } catch { /* storage unavailable */ }
  try {
    if ('caches' in window) for (const k of await caches.keys()) if (k.startsWith('agk-')) await caches.delete(k)
  } catch { /* ignore */ }
}
