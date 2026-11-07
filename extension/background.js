/*
 * agkAInakem service worker.
 * Privacy: nothing runs on a page until the person explicitly chooses a menu item or
 * presses the shortcut. Only the selected text is sent, only to the agkAInakem API.
 */
importScripts('shared.js');

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'agk-lookup', title: 'Look up “%s” with agkAInakem', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'agk-explore', title: 'Explore this feeling on agkAInakem', contexts: ['selection'] });
  refreshIndex(true);
});
chrome.runtime.onStartup.addListener(() => refreshIndex());

/*
 * Hover lookup (Yomichan-style). The word list is downloaded once and stored locally so the
 * content script can match hovered text without sending it anywhere. Only when a hovered word
 * IS a dictionary word does the extension request that entry, by its slug.
 */
const INDEX_MAX_AGE = 12 * 60 * 60 * 1000;
async function refreshIndex(force = false) {
  const { agkIndex } = await chrome.storage.local.get('agkIndex');
  const site = await getSite();
  if (!force && agkIndex && agkIndex.site === site && Date.now() - agkIndex.fetched < INDEX_MAX_AGE) return agkIndex;
  try {
    const res = await fetch(`${site}/api/dictionary/index/`, { credentials: 'omit' });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const map = {};   // normalised name -> slug
    for (const t of data.terms) for (const n of t.names) map[n] = t.slug;
    const index = { site, fetched: Date.now(), map, maxWords: Math.max(...Object.keys(map).map((k) => k.split(' ').length)) };
    await chrome.storage.local.set({ agkIndex: index });
    return index;
  } catch {
    return agkIndex || null;
  }
}

const entryCache = new Map();
async function entryBySlug(slug) {
  const site = await getSite();
  const key = `${site}|${slug}`;
  if (!entryCache.has(key)) {
    entryCache.set(key, fetch(`${site}/api/dictionary/lookup/?slug=${encodeURIComponent(slug)}`, { credentials: 'omit' })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch((e) => { entryCache.delete(key); throw e; }));
  }
  return { site, data: await entryCache.get(key) };
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg?.type === 'agk-index') { refreshIndex(msg.force).then(reply); return true; }
  if (msg?.type === 'agk-entry') {
    entryBySlug(msg.slug).then(reply).catch(() => reply({ error: 'Could not reach agkAInakem. Is the website running?' }));
    return true;
  }
});
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'sync' && changes.site) refreshIndex(true); });

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const text = (info.selectionText || '').trim().slice(0, 300);
  if (!text) return;
  if (info.menuItemId === 'agk-explore') return openExplore(text);
  if (info.menuItemId === 'agk-lookup') return showLookup(tab, text);
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'lookup-selection' || !tab?.id) return;
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id }, func: () => String(window.getSelection() || '').trim().slice(0, 300),
    });
    if (result) showLookup(tab, result);
  } catch { /* restricted page (e.g. chrome://) */ }
});

async function openExplore(text) {
  const site = await getSite();
  chrome.tabs.create({ url: `${site}/explore?q=${encodeURIComponent(text)}` });
}

async function showLookup(tab, text) {
  let payload;
  try {
    const { site, data } = await lookup(text);
    payload = { type: 'agk-show', site, text, data };
  } catch (e) {
    payload = { type: 'agk-show', site: await getSite(), text, error: e.message || 'Could not reach agkAInakem. Is the website running?' };
  }
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['panel.js'] });
    await chrome.tabs.sendMessage(tab.id, payload);
  } catch {
    // Pages where extensions can't run (browser settings, the Web Store, PDFs): open the website instead.
    const site = payload.site;
    const slug = payload.data?.match?.slug;
    chrome.tabs.create({ url: slug ? `${site}/dictionary/${slug}` : `${site}/explore?q=${encodeURIComponent(text)}` });
  }
}
