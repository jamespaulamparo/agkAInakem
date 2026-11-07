/*
 * Yomichan-style hover lookup.
 * Hold the chosen key (Shift by default) and move the mouse over text. The word(s) under the
 * cursor are matched against the agkAInakem word list stored locally by the extension —
 * nothing is sent anywhere unless the text is a dictionary word, and then only its slug.
 * Nothing happens while the key is not held.
 */
(() => {
  if (window.__agkHoverReady) return;
  window.__agkHoverReady = true;

  let settings = { hover: true, modifier: 'shift' };
  let index = null;            // { map: {name: slug}, maxWords }
  let lastKey = '';            // avoid re-rendering the same hit
  let pending = 0;
  let throttle = 0;

  const loadSettings = () => chrome.storage.sync.get('settings').then(({ settings: s }) => { settings = { ...settings, ...(s || {}) }; });
  const loadIndex = () => chrome.storage.local.get('agkIndex').then(({ agkIndex }) => {
    index = agkIndex || null;
    if (!index) chrome.runtime.sendMessage({ type: 'agk-index' }, (i) => { if (i) index = i; });
  });
  loadSettings(); loadIndex();
  chrome.storage.onChanged.addListener((c, area) => {
    if (area === 'sync' && c.settings) loadSettings();
    if (area === 'local' && c.agkIndex) index = c.agkIndex.newValue;
  });

  // Highlight the matched words without touching the page's own selection.
  const HL = 'agk-hover';
  const supportsHighlight = typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';
  if (supportsHighlight) {
    const style = document.createElement('style');
    style.textContent = `::highlight(${HL}) { background-color: rgba(142, 197, 232, 0.55); color: inherit; }`;
    (document.head || document.documentElement).appendChild(style);
  }
  const highlight = (range) => { if (supportsHighlight) CSS.highlights.set(HL, new Highlight(range)); };
  const clearHighlight = () => { if (supportsHighlight) CSS.highlights.delete(HL); };

  const held = (e) => ({ shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey, alt: e.altKey }[settings.modifier]);

  const WORD = /[\p{L}\p{M}'’-]/u;
  const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{M}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim();
  const STEMS = [['ies', 'y'], ['ied', 'y'], ['ing', ''], ['ed', ''], ['es', ''], ['s', ''], ['ness', ''], ['ly', '']];

  function caretAt(x, y) {
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      return p && { node: p.offsetNode, offset: p.offset };
    }
    const r = document.caretRangeFromPoint && document.caretRangeFromPoint(x, y);
    return r && { node: r.startContainer, offset: r.startOffset };
  }

  // Collect up to ~120 characters of text starting at the word under the cursor,
  // continuing into following text nodes of the same block, remembering where each char came from.
  function textFrom(node, offset) {
    const text = node.data;
    let start = Math.min(offset, text.length);
    if (start === text.length || !WORD.test(text[start])) {
      if (start > 0 && WORD.test(text[start - 1])) start -= 1; else return null;
    }
    while (start > 0 && WORD.test(text[start - 1])) start -= 1;

    const block = node.parentElement?.closest('p,li,td,th,h1,h2,h3,h4,h5,h6,dd,dt,blockquote,div,section,article,span') || document.body;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    walker.currentNode = node;
    const segs = [{ node, from: start, to: text.length }];
    let s = text.slice(start);
    let n;
    while (s.length < 120 && (n = walker.nextNode())) {
      if (n.parentElement?.closest('script,style,textarea,input')) continue;
      segs.push({ node: n, from: 0, to: n.data.length });
      s += n.data;
    }
    return { s: s.slice(0, 160), segs };
  }

  // Map a character position in the collected string back to a DOM point.
  function point(segs, pos) {
    let acc = 0;
    for (const g of segs) {
      const len = g.to - g.from;
      if (pos <= acc + len) return { node: g.node, offset: g.from + (pos - acc) };
      acc += len;
    }
    const last = segs[segs.length - 1];
    return { node: last.node, offset: last.to };
  }

  // Longest match first: try 1..maxWords words starting at the cursor's word.
  function match(s) {
    const words = [];
    const re = /[\p{L}\p{M}'’-]+/gu;
    let m;
    while ((m = re.exec(s)) && words.length < (index.maxWords || 4)) words.push({ w: m[0], end: m.index + m[0].length });
    for (let k = words.length; k >= 1; k--) {
      const phrase = norm(s.slice(0, words[k - 1].end));
      let slug = index.map[phrase];
      if (!slug && k === 1) {
        for (const [suf, rep] of STEMS) {
          if (phrase.length > suf.length + 2 && phrase.endsWith(suf)) { slug = index.map[phrase.slice(0, -suf.length) + rep]; if (slug) break; }
        }
      }
      if (slug) return { slug, end: words[k - 1].end };
    }
    return null;
  }

  function scan(e) {
    if (!index?.map) return;
    const panel = window.__agkPanel;
    if (panel?.owns(e.target)) return;
    if (e.target.closest?.('input,textarea,select,[contenteditable=""],[contenteditable="true"]')) return;
    const c = caretAt(e.clientX, e.clientY);
    if (!c || c.node?.nodeType !== Node.TEXT_NODE) return;
    const got = textFrom(c.node, c.offset);
    if (!got) return;
    const hit = match(got.s);
    if (!hit) return;

    const range = document.createRange();
    const a = point(got.segs, 0), b = point(got.segs, hit.end);
    range.setStart(a.node, a.offset); range.setEnd(b.node, b.offset);
    const rect = range.getBoundingClientRect();
    // the caret API snaps to the nearest text; make sure the pointer is really over the word
    if (e.clientX < rect.left - 4 || e.clientX > rect.right + 4 || e.clientY < rect.top - 4 || e.clientY > rect.bottom + 4) return;

    const key = `${hit.slug}|${Math.round(rect.left)}|${Math.round(rect.top)}`;
    if (key === lastKey && panel?.isOpen()) return;
    lastKey = key;
    highlight(range);
    const ticket = ++pending;
    chrome.runtime.sendMessage({ type: 'agk-entry', slug: hit.slug }, (res) => {
      if (ticket !== pending || !res) return;
      const text = got.s.slice(0, hit.end);
      window.__agkPanel?.render(res.error ? { site: '', text, error: res.error } : { site: res.site, text, data: res.data }, rect);
    });
  }

  document.addEventListener('mousemove', (e) => {
    if (!settings.hover || !held(e)) return;
    const now = performance.now();
    if (now - throttle < 50) return;
    throttle = now;
    scan(e);
  }, { passive: true });

  // Close on Esc or a click elsewhere; the panel module handles both, we just clear our highlight.
  const reset = (e) => { if (e.type === 'keydown' && e.key !== 'Escape') return; if (!window.__agkPanel?.owns(e.target)) { clearHighlight(); lastKey = '' } };
  document.addEventListener('keydown', reset, true);
  document.addEventListener('mousedown', reset, true);
})();
