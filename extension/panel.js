/*
 * In-page definition panel. Injected only after the person asks for a lookup.
 * Rendered inside a closed Shadow DOM so page styles can't leak in (or out).
 * All API text is inserted with textContent — never as HTML.
 */
(() => {
  if (window.__agkPanelReady) return;
  window.__agkPanelReady = true;

  const CSS = `
    :host { all: initial; }
    .wrap { position: fixed; z-index: 2147483647; width: 340px; max-width: calc(100vw - 24px);
      font: 14px/1.5 "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif; color: #263A38;
      background: #F7F4EF; border: 1px solid #E4E9E5; border-radius: 18px; box-shadow: 0 18px 50px rgba(38,58,56,.18);
      padding: 16px 18px 14px; animation: in .22s cubic-bezier(.16,1,.3,1); }
    @keyframes in { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none } }
    @media (prefers-reduced-motion: reduce) { .wrap { animation: none } }
    .top { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #8C9B97; }
    .dot { width: 14px; height: 14px; border-radius: 50%; background: linear-gradient(135deg,#4FA8A0,#8EC5E8); }
    .x { margin-left: auto; border: 0; background: none; font-size: 18px; line-height: 1; color: #8C9B97; cursor: pointer; padding: 4px 6px; border-radius: 8px; }
    .x:hover { background: rgba(38,58,56,.06); color: #263A38; }
    .word { font-family: Newsreader, Georgia, Cambria, serif; font-size: 30px; line-height: 1.1; margin: 10px 0 2px; letter-spacing: -.01em; }
    .type { font-family: Newsreader, Georgia, serif; font-style: italic; font-size: 14px; }
    .type.clinical { color: #B9472B } .type.psychological { color: #2F6688 } .type.everyday { color: #3F6B3B }
    .def { margin: 8px 0 0; font-size: 15px; }
    .simple { margin: 10px 0 0; padding-left: 12px; border-left: 2px solid #8EC5E8; color: #5F716D; font-style: italic; }
    .label { margin: 14px 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #8C9B97; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { font-family: Newsreader, Georgia, serif; font-style: italic; font-size: 14px; color: #2B6F69; background: #E3F1EF;
      border-radius: 999px; padding: 2px 10px; text-decoration: none; }
    .chip:hover { background: #cfe8e5; }
    .row { display: block; padding: 8px 0; border-top: 1px solid #E4E9E5; text-decoration: none; color: inherit; }
    .row:first-of-type { border-top: 0; }
    .row b { font-family: Newsreader, Georgia, serif; font-weight: 500; font-size: 18px; }
    .row span { display: block; color: #5F716D; font-size: 13px; }
    .note { margin-top: 12px; font-size: 12px; color: #8C9B97; }
    .actions { display: flex; gap: 8px; margin-top: 14px; }
    .btn { flex: 1; text-align: center; text-decoration: none; font-weight: 700; font-size: 13px; padding: 9px 12px; border-radius: 999px; }
    .primary { background: #2B6F69; color: #fff; } .primary:hover { background: #245d58; }
    .ghost { color: #263A38; box-shadow: inset 0 0 0 1px #E4E9E5; } .ghost:hover { background: #fff; }
    .err { margin-top: 10px; color: #B9472B; }
  `;

  let host = null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const link = (cls, text, href) => { const a = el('a', cls, text); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; };

  function close() { host?.remove(); host = null; document.removeEventListener('keydown', onKey, true); document.removeEventListener('mousedown', onDown, true); }
  function onKey(e) { if (e.key === 'Escape') close(); }
  function onDown(e) { if (host && !e.composedPath().includes(host)) close(); }

  function position(box, anchor) {
    const sel = window.getSelection();
    let r = anchor || (sel && sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null);
    if (!r || (!r.width && !r.height)) r = { left: innerWidth / 2 - 170, bottom: 80, top: 80 };
    const w = Math.min(340, innerWidth - 24);
    box.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left)) + 'px';
    const below = r.bottom + 10, h = box.offsetHeight || 320;
    box.style.top = (below + h < innerHeight - 12 ? below : Math.max(12, r.top - h - 10)) + 'px';
  }

  function render({ site, text, data, error }, anchor) {
    close();
    host = document.createElement('agk-panel');
    const root = host.attachShadow({ mode: 'closed' });
    const style = el('style'); style.textContent = CSS; root.appendChild(style);
    const box = el('div', 'wrap'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'agkAInakem definition');
    const top = el('div', 'top'); top.append(el('span', 'dot'), el('span', null, 'agkAInakem'));
    const x = el('button', 'x', '×'); x.setAttribute('aria-label', 'Close'); x.onclick = close; top.append(x);
    box.append(top);

    if (error) {
      box.append(el('div', 'word', text.length > 40 ? text.slice(0, 40) + '…' : text), el('p', 'err', error));
    } else if (data.match) {
      const m = data.match;
      box.append(el('div', 'word', m.term), el('span', `type ${m.term_type}`, m.term_type));
      box.append(el('p', 'def', m.short_definition));
      if (m.in_simpler_terms) box.append(el('p', 'simple', m.in_simpler_terms));
      if (m.related?.length) {
        box.append(el('div', 'label', 'Related words'));
        const chips = el('div', 'chips');
        m.related.forEach((r) => { const c = link('chip', r.term, `${site}/dictionary/${r.slug}`); c.title = `${r.label}: ${r.explanation}`; chips.append(c); });
        box.append(chips);
      }
      if (m.term_type === 'clinical') box.append(el('p', 'note', 'Clinical term — only a qualified professional can assess or diagnose this.'));
      const actions = el('div', 'actions');
      actions.append(link('btn primary', 'Open full entry', `${site}/dictionary/${m.slug}`));
      box.append(actions);
    } else {
      box.append(el('div', 'word', text.length > 40 ? text.slice(0, 40) + '…' : text));
      if (data.suggestions?.length) {
        box.append(el('div', 'label', 'Words that might fit'));
        data.suggestions.slice(0, 3).forEach((s) => {
          const row = link('row', null, `${site}/dictionary/${s.slug}`);
          row.append(el('b', null, s.term), el('span', null, s.reasons?.[0]?.text || s.short_definition));
          box.append(row);
        });
        box.append(el('p', 'note', 'Possibilities, not a diagnosis. You decide what fits.'));
      } else {
        box.append(el('p', 'def', 'This isn’t in the dictionary yet.'));
      }
      const actions = el('div', 'actions');
      actions.append(link('btn ghost', 'Explore this feeling', `${site}/explore?q=${encodeURIComponent(text)}`));
      box.append(actions);
    }
    root.append(box);
    document.documentElement.append(host);
    position(box, anchor);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onDown, true);
  }

  chrome.runtime.onMessage.addListener((msg) => { if (msg?.type === 'agk-show') render(msg); });

  // Used by hover.js (same extension world).
  window.__agkPanel = { render, close, isOpen: () => !!host, owns: (node) => !!host && (node === host || host.contains(node)) };
})();
