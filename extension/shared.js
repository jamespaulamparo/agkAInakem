// Shared settings for the background worker and popup.
const DEFAULT_SITE = 'http://127.0.0.1:8000';
const DEFAULT_SETTINGS = { hover: true, modifier: 'shift' };   // modifier: shift | ctrl | alt

async function getSite() {
  const { site } = await chrome.storage.sync.get('site');
  return (site || DEFAULT_SITE).replace(/\/+$/, '');
}

async function getSettings() {
  const { settings } = await chrome.storage.sync.get('settings');
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

async function lookup(text) {
  const site = await getSite();
  const res = await fetch(`${site}/api/dictionary/lookup/?q=${encodeURIComponent(text)}`, { credentials: 'omit' });
  if (!res.ok) throw new Error(res.status === 429 ? 'Too many lookups — wait a moment.' : `Lookup failed (${res.status})`);
  return { site, data: await res.json() };
}
