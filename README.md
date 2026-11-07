# agkAInakem

**Find the words for what you feel — and reach out.**
A browser-based mental health literacy and early-support platform for San Fernando, La Union, with a companion browser extension.

- **Find words** — a curated mental health dictionary (57 entries, 68 explained relationships) and sentence-to-word discovery that suggests possible vocabulary with a human-written reason for each.
- **Get help (the homepage)** — one question, three big choices: *Calm down* (breathing circle, grounding, read-aloud, English/Tagalog, works offline), *Talk to someone* (your own contacts — any number, with roles you define → hotlines: NCMH 1553, Hopeline, DOH CHD I → local clinic), and *I'm in danger* (911 / 1553, fixed message, DOH CHD I line, optional location share with one of your contacts). Also a safety plan, gentle follow-up check-ins, Notice → Ask → Listen → Connect, and an anonymous check-in. A red Emergency button is on every screen.
- **Journal** — daily check-ins (colour, feeling words, private note) on any day, shown on a week / month / year calendar with an archive and an optional weekly summary (patterns, never a diagnosis). Works without an account (saved in the browser); an optional account keeps it across devices, with data download and full deletion.
- **Extension** — highlight a word on any page → right-click → see its meaning and related words.

It does **not** diagnose, score risk, or replace professional care. Text typed into discovery is processed in memory and never stored. Journal entries are private to their owner and deliberately not shown in the Django admin.

---

## How it’s made

The same information is on the website at **/credits** (footer → “How it’s made”). Logos are [Simple Icons](https://simpleicons.org) (CC0) loaded from jsDelivr, not stored in the repo.

### Made with AI tools

AI helped build the project. The live website does not use any AI: no chatbot, no generated advice, no diagnosis.

| | |
|---|---|
| ChatGPT (OpenAI) | Brainstorming, product discovery and the first product & development blueprint. |
| Google Antigravity | Agentic IDE used for the first coding pass (Django project scaffold and early pages). |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/claude.svg" width="16" height="16" alt=""> Claude (Anthropic), in Cowork | Most of the code, design and testing: React frontend, Django API, discovery engine, journal, browser extension; and first drafts of dictionary entries and help-screen wording, all marked for expert review. |

### Frontend

| | |
|---|---|
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/react.svg" width="16" height="16" alt=""> React 18.3 | User interface |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/vite.svg" width="16" height="16" alt=""> Vite 5.4 | Development server and build |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/reactrouter.svg" width="16" height="16" alt=""> React Router 6.30 | Page routing |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/tailwindcss.svg" width="16" height="16" alt=""> Tailwind CSS 3.4 | Styling and design tokens |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/framer.svg" width="16" height="16" alt=""> Framer Motion 11.18 | Animations and page transitions |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/threedotjs.svg" width="16" height="16" alt=""> Three.js 0.169 · React Three Fiber 8.18 · drei 9.122 | The 3D heart on the homepage (WebGL) |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/d3.svg" width="16" height="16" alt=""> D3.js 7.9 | Force-directed word maps |
| qrcode 1.5 | QR code on the “Open on a phone” page |
| Plus Jakarta Sans · Newsreader (Fontsource) | Typefaces, self-hosted so no font requests leave the site |
| Illustrations and icons | Drawn for this project as inline SVG |

### Backend

| | |
|---|---|
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/django.svg" width="16" height="16" alt=""> Python · Django 5.1 | Web server, data models, admin for editors |
| Django REST Framework 3.17 | JSON API shared by the website and the extension |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/sqlite.svg" width="16" height="16" alt=""> SQLite (local) · PostgreSQL (deployment) | Database |
| WhiteNoise · django-cors-headers · dj-database-url · python-dotenv | Static files, development CORS, database URL and settings |
| Django sessions + CSRF | Optional accounts; passwords hashed with Django’s PBKDF2 |
| Consent records + data export/erasure | RA 10173 (Data Privacy Act): consent stored with notice version; download and delete in Account |
| Django password-reset tokens + email | One-time reset links (printed in the server window unless an email server is configured) |

### Browser extension

| | |
|---|---|
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/googlechrome.svg" width="16" height="16" alt=""> Chrome Manifest V3 | Service worker, content script, context menu, keyboard shortcut, storage |
| CSS Custom Highlight API | Highlights the hovered word without changing the page |
| caretPositionFromPoint / caretRangeFromPoint | Finds the text under the mouse |
| Shadow DOM | Keeps the definition panel separate from page styles |

### Browser features used by the site

| | |
|---|---|
| Service Worker + Cache Storage | Help screens and hotline numbers work offline |
| Web Speech API (speechSynthesis) | Read-aloud, using voices installed on the device |
| Geolocation API | Optional “share my location” — only after you confirm |
| tel: and sms: links | Calls and texts open your own phone apps |
| localStorage | Journal (without an account), safety plan, contacts, settings |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/pwa.svg" width="16" height="16" alt=""> Web App Manifest | Install to the home screen like an app (on https or localhost) |
| Notifications API | Optional daily check-in reminder while the site is open |
| prefers-color-scheme + CSS variables | Light, dark or automatic theme |
| Print styles | Print or save the safety plan as a PDF |

### Our API

| | |
|---|---|
| /api/dictionary/… | categories, search, terms/{slug}, terms/{slug}/related, graph, lookup, index |
| /api/discovery/explore/ | Sentence → possible words (text is never stored) |
| /api/support/… | resources (hotlines and clinics) |
| /api/auth/… | me, register, login, logout, password-reset, password-reset/confirm, export, delete |
| /api/journal/… | entries, entries/{date}, import |
| /api/events/ · /api/stats/ | Anonymous usage counters (POST); staff-only dashboard data and CSV export |
| /api/meta/share/ | This computer’s Wi-Fi address, when Wi-Fi sharing is on |
| Anonymous usage counts | /api/events/ adds 1 to a daily counter per event (fixed list, no IDs, IP, cookies or text). Staff dashboard /dashboard with hand-built SVG charts; journal research charts only from opt-ins, groups under 5 hidden. |
| External APIs | None. No ads or third-party analytics or data services. Technology logos on this page load from the jsDelivr CDN (Simple Icons, CC0). |

### Algorithms

| | |
|---|---|
| Sentence-to-word discovery | Text normalisation and contraction expansion → curated phrase cues (exact phrase, or all key words within a 7-word window with simple suffix stemming) → direct term/alias mentions → bonus for several independent signals → small, explained credit along curated “similar to / associated with” links → top 6 labelled “closer” or “possible”. Deterministic and explainable. |
| Crisis-word check | Fixed phrase list (English and Tagalog). Shows the fixed emergency message; never labels the person. |
| Dictionary search ranking | Exact name or alias → starts with → contains → found in definitions. |
| Extension hover lookup | Longest match first (up to 5 words) against a locally stored word list, with suffix stemming. Hovered text stays on the device unless it is a dictionary word. |
| Word maps | D3 force simulation: link, many-body, centring and collision forces. |
| Suggested actions | Fixed rules over recent check-ins: several hard days close together; the last 14 days vs the 14 before; a weekday that tends to be harder (last 8 weeks); a feeling that keeps coming up; no safety plan or contacts yet; a gap in check-ins; steady streaks; bouncing back; ups and downs; weekday vs weekend; feelings tied to steadier days; feelings that often come together (e.g. stressed + tired → burnout). At most four suggestions, each linking to one action. |
| Professional-help nudge | Shown on the homepage and journal when check-ins stay heavy: 4+ hard days in a row (one missed day doesn’t break a streak), hard days on half or more of 6+ check-ins in 14 days, 3 of the last 4 weeks heavy, each week heavier than the last, 10+ days without a steady day, or “hopeless”/“numb” more than once. Gentle wording, “Not now” hides it for 5 days. Thresholds need clinician review. |
| 30-day patterns | Colour counts, week-by-week shape, longest steady and hard stretches, bounce-backs after hard days, weekday vs weekend, feelings linked to lighter or heavier days, and feelings that come together. |
| Weekly summary | Counts per colour, repeated feeling words, comparison with the previous week, and fixed, pre-written observations. No scores shown, no diagnosis. |

### Content sources

Dictionary entries and help-screen wording are editorial drafts awaiting review by qualified professionals.

| | |
|---|---|
| References for dictionary entries | 97 entries, including positive and neutral words (joy, gratitude, hope, calm, mood, mental health…). Each lists its own linked references: WHO fact sheets, ICD-11, mhGAP and Psychological First Aid; APA Dictionary of Psychology and APA topic pages; peer-reviewed papers by DOI (e.g. Fredrickson 2001, Emmons & McCullough 2003, Snyder 2002, Maslach & Jackson 1981, Neff 2003, Holt-Lunstad 2015); RA 11036 and RA 10029. Definitions are written in our own words. |
| Filipino version | Every entry has a Tagalog headword, meaning, explanation, examples and questions. Filipino references are listed first: Diksiyonaryo.ph entries for each root word, Church et al. (1998) on Filipino emotion concepts, and Sikolohiyang Pilipino (Pe-Pua & Protacio-Marcelino, 2000). Needs native-speaker and clinician review. |
| Grounding and breathing | Based on widely used techniques, including WHO’s guidance on simple stress-management skills. |
| Hotlines | NCMH Crisis Hotline (1553), Hopeline Philippines, DOH Center for Health Development I (as listed by the Provincial Government of La Union), 911. Numbers should be re-checked regularly. |

### Testing

| | |
|---|---|
| Django test runner | API, discovery, accounts, journal privacy |
| Playwright (Chromium) | End-to-end checks of the website, offline mode and the extension |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/nodedotjs.svg" width="16" height="16" alt=""> Node.js · npm | Build tooling and packages |

## Run it

```bash
python -m venv venv
.\venv\Scripts\activate            # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
copy .env.example .env             # cp on macOS/Linux
python manage.py migrate
python manage.py seed_vocabulary   # dictionary, relationships, phrase cues
python manage.py seed_support      # hotlines, hospitals, offices
python manage.py test apps
python manage.py runserver
```

Open http://127.0.0.1:8000. A prebuilt `frontend/dist` is included, so Node is only needed to change the frontend:

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173 with hot reload (proxies /api to :8000)
npm run build   # writes frontend/dist, which Django serves
```

### Open it on phones (same Wi-Fi, not deployed)

Double-click **`start-agkainakem-wifi.bat`**. It serves on port 8000 to your local network and opens **/share**, which shows a QR code with this computer’s Wi-Fi address (e.g. `http://192.168.1.23:8000`). Phones on the same Wi-Fi scan it. Allow Python through the Windows firewall on *private* networks if asked. Over plain http on a local IP, browsers turn off offline mode and location sharing (they need https); everything else works.

**/share** (footer → “Open on a phone”) always shows a QR code for the public demo link `https://hbjhw4bn-8000.asse.devtunnels.ms/` (a dev tunnel to port 8000). If the tunnel address changes, edit `PUBLIC_URL` in `frontend/src/pages/Share.jsx` and rebuild. `*.devtunnels.ms` is already allowed in Django’s `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`.

### Handy extras

- **Demo data:** at the bottom of the Journal, “Fill with sample check-ins” adds about 6 weeks of sample check-ins (so the calendar, weekly summary and suggestions have something to show); “Remove sample check-ins” takes exactly those days out again.
- **Password reset:** “Forgot password?” on the login page. Without email settings the reset link is printed in the server window; add the `EMAIL_*` settings from `.env.example` to send real emails.
- **Daily reminder:** Journal → Daily reminder. Shows a gentle prompt (and a browser notification if allowed) once a day after the chosen time, while the site is open.
- **Theme & Simple view:** the **Aa** button in the top bar (Auto / Light / Dark, and Simple view).
- **Install as an app:** “Install app” appears in the footer when the browser allows it (https or localhost).
- **Print the safety plan:** Safety plan → “Print or save as PDF” (includes your contacts and hotlines).
- **Clean up old files:** double-click `cleanup-old-files.bat`. It lists unused old files (legacy templates, replaced components, old build files) and asks before deleting.

Editorial admin: double-click `create-admin.bat` (creates user **pc** / password **password** for the demo), or run `python manage.py createsuperuser`. Then open http://127.0.0.1:8000/admin/. Change the demo password before the site is public — the tunnel link makes /admin/ reachable from the internet.

## Browser extension

1. Open `chrome://extensions` (or `edge://extensions`), turn on **Developer mode**.
2. **Load unpacked** → select the `extension/` folder.
3. **Hold Shift and hover** over a word on any page (Yomichan-style). Multi-word terms like "burned out" and inflections like "overwhelmed" are recognised. The key (Shift / Ctrl / Alt) and an on/off switch are in the popup.
4. Or highlight a phrase → right-click → **Look up with agkAInakem** (or press `Alt+Shift+L`).
   "Explore this feeling" sends a phrase to the website's discovery page.

Permissions: a content script on web pages (it only acts while the hover key is held), `contextMenus`, `activeTab` + `scripting`, `storage`. The extension downloads the word list once (`/api/dictionary/index/`) and matches hovered text on the device; only when the text is a dictionary word does it request that entry by slug. No browsing history is collected. For a deployed site, set its address in the popup's **Settings**; the extension asks for access to that one origin.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dictionary/categories/` | Categories with counts |
| GET | `/api/dictionary/search/?q=&category=&type=&letter=` | Ranked search |
| GET | `/api/dictionary/terms/{slug}/` | Full entry |
| GET | `/api/dictionary/terms/{slug}/related/` | Ego graph (nodes, edges, relationships) |
| GET | `/api/dictionary/graph/` | Whole vocabulary map |
| GET | `/api/dictionary/lookup/?q=` or `?slug=` | Extension lookup (match or suggestions) |
| GET | `/api/dictionary/index/` | Word list for on-device hover matching |
| POST | `/api/discovery/explore/` | `{text, lang}` → possible words + reasons (not stored) |
| GET | `/api/support/resources/` | Emergency / crisis / referral lines |
| GET | `/api/auth/me/` | Current user (sets CSRF cookie) |
| POST | `/api/auth/register/` · `/login/` · `/logout/` | Optional account (session + CSRF) |
| POST | `/api/auth/password-reset/` · `/password-reset/confirm/` | Email a reset link · set a new password |
| GET | `/api/auth/export/` | Download my data |
| POST | `/api/auth/delete/` | Delete account + journal (password required) |
| GET | `/api/journal/entries/` | My entries |
| PUT/DELETE | `/api/journal/entries/{YYYY-MM-DD}/` | Save / remove a day |
| POST | `/api/journal/import/` | Move browser-saved entries into the account |
| POST/DELETE | `/api/auth/research/` | Opt in to / out of anonymous research statistics |
| POST | `/api/events/` | Anonymous usage counters (allow-listed events, no identifiers) |
| GET | `/api/stats/?days=30` · `/api/stats/export.csv` | Staff only: dashboard data · daily counts CSV |

Sensitive POST endpoints are rate-limited (see `REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']`).

## How discovery works

`apps/discovery/engine.py` — deterministic, no AI service required:

1. Normalise text (lower-case, expand contractions).
2. Match curated **phrase cues** (`PhraseCue`, editable in admin) — exact phrase, or all content words within a short window. English and Filipino cues.
3. Credit direct mentions of a term or its aliases.
4. Several independent signals → closer fit; a little credit flows along curated `similar_to` / `associated_with` relationships.
5. Return up to 6 terms labelled **closer** or **possible**, each with its reason and the matched fragments.

If the text contains explicit self-harm language, the response sets `show_support: true` and the UI shows crisis lines. This is not a classifier: it never labels the person.

## Offline & privacy

- The production build registers `/sw.js`; after one visit the help screens and hotline numbers work without signal.
- Without an account, the journal, safety plan, contacts, reminders and settings are stored only in the browser (`localStorage`). Nothing is sent to an organisation or contact without the person tapping send in their own messaging app.
- Text typed into “Find words” is processed in memory and never stored or logged.
- Typing crisis phrases anywhere shows the fixed emergency message immediately (client-side, `frontend/src/lib/crisis.js`).

### Data Privacy Act (RA 10173)

- **Privacy Notice & Terms** at `/privacy` (footer → Privacy): data collected, purposes, legal basis, retention, security, breach notification (NPC + users within 72 h), minors, third parties, and how to use each right.
- **Consent:** registering requires explicit consent to processing journal entries (sensitive health information) and confirmation of being 18+ or having a parent/guardian’s permission. Each consent is stored (`accounts.Consent`) with the notice version and time.
- **Access & portability:** Account → Download my data (`GET /api/auth/export/`) — account, consents, journal as JSON.
- **Rectification:** journal entries can be edited any time; account details via the privacy contact.
- **Erasure / withdraw consent:** Account → Delete account (`POST /api/auth/delete/`, password required) removes the account, journal and consent records. “Erase all data on this device” clears everything in the browser.
- **Privacy contact:** [jamespaulamparo](https://github.com/jamespaulamparo). Complaints may be filed with the National Privacy Commission (privacy.gov.ph).
- Journal entries are not registered in the Django admin; no ads or tracking cookies; fonts are self-hosted.

### Staff dashboard & research data

- **`/dashboard`** (staff accounts only, e.g. the `pc` admin): visits, help tools used, calls tapped by type, safety signals, page views, devices/language/theme, most-viewed words, dictionary search hit/miss, accounts, and research charts. Date presets 7/30/90/365 days, a table view for every chart, CSV export (`/api/stats/export.csv`).
- **Anonymous usage counts** (`apps/insights`): the site posts `{event, label}` pairs from a fixed allow-list to `/api/events/`; the server only increments `(day, event, label, count)`. No user, session, IP, cookie, free text, phone number or location is stored. Turned off by the visitor on /privacy, or automatically with Global Privacy Control / Do Not Track.
- **Sample data for demos:** `start-agkainakem.bat` adds 60 made-up accounts (about a third opted in to research), their journals, and 90 days of sample usage counts the first time it runs (`manage.py seed_demo_data --if-empty`). Sample accounts end in `@demo.agkainakem.local` and can't be signed in to; usage rows have `is_demo=True`. Staff can untick “Include sample data” on the dashboard, or remove/regenerate it under **Admin tools** (removal is remembered, so the launcher won't add it back). `load-sample-data.bat` regenerates it; `manage.py seed_demo_data --clear` removes it.
- Staff see a **Dashboard** link in the top bar (on tablets and computers; on phones it is on the Account page).
- **Research statistics** use journals only from account holders who opt in (`accounts.ResearchConsent`, separate from the sign-up consent, withdrawable any time). Only totals of colours, weekdays and feeling words are shown, never notes, and any group smaller than 5 people is hidden.

## Content & review

- **All help-flow wording** (`frontend/src/lib/helpText.js`) is fixed text in English and Tagalog. The Tagalog lines are drafts: have a native speaker and a clinician review every screen before launch.

- Vocabulary source of truth: `fixtures/vocabulary.json` (loaded by `seed_vocabulary`).
- Every entry is `review` status ("Editorial draft — awaiting review by a qualified professional") until a reviewer approves it in admin. `draft` entries are hidden from the site and extension.
- References point to the APA Dictionary of Psychology, WHO ICD-11 / mhGAP / PFA, NIMH and named publications for reviewers to check against.
- **Before public launch:** re-confirm every number in `seed_support.py` (ITRMC and CDRRMO especially) and set `verified_on` in admin.

## Project layout

```
config/            settings, urls, api_urls, SPA view
apps/dictionary/   Term, Category, TermRelationship, … + api.py, serializers.py
apps/discovery/    PhraseCue + engine.py + api.py (+ tests.py: API/engine tests)
apps/support/      ReferralResource, DailyCheckIn + api.py
apps/journal/      JournalEntry (private, per user) + api.py
apps/accounts/     optional accounts, password reset, export/delete
fixtures/          vocabulary.json
frontend/          React app (src/pages, src/components, src/lib)
extension/         MV3 extension
```

## Roadmap

Milestones 1–5 are in place. Next: organisations and per-school referral pathways, responder accounts, community word suggestions with moderation (Milestone 6), then accessibility/security hardening and demo prep (Milestone 7).
