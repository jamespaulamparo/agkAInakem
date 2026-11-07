const out = document.getElementById('out');
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const open = (url) => (e) => { e.preventDefault(); chrome.tabs.create({ url }); };

document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = document.getElementById('q').value.trim();
  if (!q) return;
  out.replaceChildren(el('p', 'def', '…'));
  try {
    const { site, data } = await lookup(q);
    out.replaceChildren();
    if (data.match) {
      const m = data.match;
      const a = el('a', 'word', m.term); a.href = '#'; a.onclick = open(`${site}/dictionary/${m.slug}`);
      out.append(a, el('span', 'type', m.term_type), el('p', 'def', m.short_definition));
      const more = el('a', 'more', 'Open full entry →'); more.href = '#'; more.onclick = open(`${site}/dictionary/${m.slug}`);
      out.append(more);
    } else if (data.suggestions?.length) {
      data.suggestions.slice(0, 4).forEach((s) => {
        const r = el('a', 'row'); r.href = '#'; r.onclick = open(`${site}/dictionary/${s.slug}`);
        r.append(el('b', null, s.term), el('span', null, s.short_definition));
        out.append(r);
      });
    } else {
      out.append(el('p', 'def', 'Not in the dictionary yet.'));
    }
  } catch (err) {
    out.replaceChildren(el('p', 'err', err.message || 'Could not reach the website. Check Settings.'));
  }
});

(async () => { document.getElementById('site').value = await getSite(); })();

document.getElementById('saveSite').addEventListener('click', async () => {
  const value = document.getElementById('site').value.trim().replace(/\/+$/, '');
  try {
    const origin = new URL(value).origin;
    // Ask for access to this one origin only (needed for a deployed site).
    const granted = await chrome.permissions.request({ origins: [`${origin}/*`] }).catch(() => true);
    if (!granted) return;
    await chrome.storage.sync.set({ site: origin });
    document.querySelector('.hint').textContent = 'Saved.';
  } catch {
    document.querySelector('.hint').textContent = 'Please enter a full address, e.g. https://example.org';
  }
});

// Hover lookup settings
(async () => {
  const s = await getSettings();
  const on = document.getElementById('hoverOn'), mod = document.getElementById('modifier');
  on.checked = s.hover; mod.value = s.modifier;
  const save = () => chrome.storage.sync.set({ settings: { hover: on.checked, modifier: mod.value } });
  on.addEventListener('change', save); mod.addEventListener('change', save);
})();
