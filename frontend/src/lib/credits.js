// "How it's made" — kept in one place so the website and README say the same thing.
export const CREDITS = [
  {
    title: 'Made with AI tools', logos: true,
    note: 'AI helped build the project. The live website does not use any AI: no chatbot, no generated advice, no diagnosis.',
    items: [
      ['ChatGPT (OpenAI)', 'Brainstorming, product discovery and the first product & development blueprint.'],
      ['Google Antigravity', 'Agentic IDE used for the first coding pass (Django project scaffold and early pages).'],
      ['Claude (Anthropic), in Cowork', 'Most of the code, design and testing: React frontend, Django API, discovery engine, journal, browser extension; and first drafts of dictionary entries and help-screen wording, all marked for expert review.', 'claude'],
    ],
  },
  {
    title: 'Frontend', logos: true,
    items: [
      ['React 18.3', 'User interface', 'react'],
      ['Vite 5.4', 'Development server and build', 'vite'],
      ['React Router 6.30', 'Page routing', 'reactrouter'],
      ['Tailwind CSS 3.4', 'Styling and design tokens', 'tailwindcss'],
      ['Framer Motion 11.18', 'Animations and page transitions', 'framer'],
      ['Three.js 0.169 · React Three Fiber 8.18 · drei 9.122', 'The 3D heart on the homepage (WebGL)', 'threedotjs'],
      ['D3.js 7.9', 'Force-directed word maps', 'd3'],
      ['qrcode 1.5', 'QR code on the “Open on a phone” page'],
      ['Plus Jakarta Sans · Newsreader (Fontsource)', 'Typefaces, self-hosted so no font requests leave the site'],
      ['Illustrations and icons', 'Drawn for this project as inline SVG'],
    ],
  },
  {
    title: 'Backend', logos: true,
    items: [
      ['Python · Django 5.1', 'Web server, data models, admin for editors', 'django'],
      ['Django REST Framework 3.17', 'JSON API shared by the website and the extension'],
      ['SQLite (local) · PostgreSQL (deployment)', 'Database', 'sqlite'],
      ['WhiteNoise · django-cors-headers · dj-database-url · python-dotenv', 'Static files, development CORS, database URL and settings'],
      ['Django sessions + CSRF', 'Optional accounts; passwords hashed with Django’s PBKDF2'],
      ['Consent records + data export/erasure', 'RA 10173 (Data Privacy Act): consent stored with notice version; download and delete in Account'],
      ['Django password-reset tokens + email', 'One-time reset links (printed in the server window unless an email server is configured)'],
    ],
  },
  {
    title: 'Browser extension', logos: true,
    items: [
      ['Chrome Manifest V3', 'Service worker, content script, context menu, keyboard shortcut, storage', 'googlechrome'],
      ['CSS Custom Highlight API', 'Highlights the hovered word without changing the page'],
      ['caretPositionFromPoint / caretRangeFromPoint', 'Finds the text under the mouse'],
      ['Shadow DOM', 'Keeps the definition panel separate from page styles'],
    ],
  },
  {
    title: 'Browser features used by the site',
    items: [
      ['Service Worker + Cache Storage', 'Help screens and hotline numbers work offline'],
      ['Web Speech API (speechSynthesis)', 'Read-aloud, using voices installed on the device'],
      ['Geolocation API', 'Optional “share my location” — only after you confirm'],
      ['tel: and sms: links', 'Calls and texts open your own phone apps'],
      ['localStorage', 'Journal (without an account), safety plan, contacts, settings'],
      ['Web App Manifest', 'Install to the home screen like an app (on https or localhost)', 'pwa'],
      ['Notifications API', 'Optional daily check-in reminder while the site is open'],
      ['prefers-color-scheme + CSS variables', 'Light, dark or automatic theme'],
      ['Print styles', 'Print or save the safety plan as a PDF'],
    ],
  },
  {
    title: 'Our API',
    items: [
      ['/api/dictionary/…', 'categories, search, terms/{slug}, terms/{slug}/related, graph, lookup, index'],
      ['/api/discovery/explore/', 'Sentence → possible words (text is never stored)'],
      ['/api/support/…', 'resources (hotlines and clinics)'],
      ['/api/auth/…', 'me, register, login, logout, password-reset, password-reset/confirm, export, delete'],
      ['/api/journal/…', 'entries, entries/{date}, import'],
      ['/api/events/ · /api/stats/', 'Anonymous usage counters (POST); staff-only dashboard data and CSV export'],
      ['/api/meta/share/', 'This computer’s Wi-Fi address, when Wi-Fi sharing is on'],
      ['Anonymous usage counts', '/api/events/ adds 1 to a daily counter per event (fixed list, no IDs, IP, cookies or text). Staff dashboard /dashboard with hand-built SVG charts; journal research charts only from opt-ins, groups under 5 hidden.'],
      ['External APIs', 'None. No ads or third-party analytics or data services. Technology logos on this page load from the jsDelivr CDN (Simple Icons, CC0).'],
    ],
  },
  {
    title: 'Algorithms',
    items: [
      ['Sentence-to-word discovery', 'Text normalisation and contraction expansion → curated phrase cues (exact phrase, or all key words within a 7-word window with simple suffix stemming) → direct term/alias mentions → bonus for several independent signals → small, explained credit along curated “similar to / associated with” links → top 6 labelled “closer” or “possible”. Deterministic and explainable.'],
      ['Crisis-word check', 'Fixed phrase list (English and Tagalog). Shows the fixed emergency message; never labels the person.'],
      ['Dictionary search ranking', 'Exact name or alias → starts with → contains → found in definitions.'],
      ['Extension hover lookup', 'Longest match first (up to 5 words) against a locally stored word list, with suffix stemming. Hovered text stays on the device unless it is a dictionary word.'],
      ['Word maps', 'D3 force simulation: link, many-body, centring and collision forces.'],
      ['Suggested actions', 'Fixed rules over recent check-ins: several hard days close together; the last 14 days vs the 14 before; a weekday that tends to be harder (last 8 weeks); a feeling that keeps coming up; no safety plan or contacts yet; a gap in check-ins; steady streaks; bouncing back; ups and downs; weekday vs weekend; feelings tied to steadier days; feelings that often come together (e.g. stressed + tired → burnout). At most four suggestions, each linking to one action.'],
      ['Professional-help nudge', 'Shown on the homepage and journal when check-ins stay heavy: 4+ hard days in a row (one missed day doesn’t break a streak), hard days on half or more of 6+ check-ins in 14 days, 3 of the last 4 weeks heavy, each week heavier than the last, 10+ days without a steady day, or “hopeless”/“numb” more than once. Gentle wording, “Not now” hides it for 5 days. Thresholds need clinician review.'],
      ['30-day patterns', 'Colour counts, week-by-week shape, longest steady and hard stretches, bounce-backs after hard days, weekday vs weekend, feelings linked to lighter or heavier days, and feelings that come together.'],
      ['Weekly summary', 'Counts per colour, repeated feeling words, comparison with the previous week, and fixed, pre-written observations. No scores shown, no diagnosis.'],
    ],
  },
  {
    title: 'Content sources',
    note: 'Dictionary entries and help-screen wording are editorial drafts awaiting review by qualified professionals.',
    items: [
      ['References for dictionary entries', '97 entries, including positive and neutral words (joy, gratitude, hope, calm, mood, mental health…). Each lists its own linked references: WHO fact sheets, ICD-11, mhGAP and Psychological First Aid; APA Dictionary of Psychology and APA topic pages; peer-reviewed papers by DOI (e.g. Fredrickson 2001, Emmons & McCullough 2003, Snyder 2002, Maslach & Jackson 1981, Neff 2003, Holt-Lunstad 2015); RA 11036 and RA 10029. Definitions are written in our own words.'],
      ['Filipino version', 'Every entry has a Tagalog headword, meaning, explanation, examples and questions. Filipino references are listed first: Diksiyonaryo.ph entries for each root word, Church et al. (1998) on Filipino emotion concepts, and Sikolohiyang Pilipino (Pe-Pua & Protacio-Marcelino, 2000). Needs native-speaker and clinician review.'],
      ['Grounding and breathing', 'Based on widely used techniques, including WHO’s guidance on simple stress-management skills.'],
      ['Hotlines', 'NCMH Crisis Hotline (1553), Hopeline Philippines, DOH Center for Health Development I (as listed by the Provincial Government of La Union), 911. Numbers should be re-checked regularly.'],
    ],
  },
  {
    title: 'Testing', logos: true,
    items: [
      ['Django test runner', 'API, discovery, accounts, journal privacy'],
      ['Playwright (Chromium)', 'End-to-end checks of the website, offline mode and the extension'],
      ['Node.js · npm', 'Build tooling and packages', 'nodedotjs'],
    ],
  },
]
