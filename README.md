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

The same information is on the website at **/credits** (footer → “How it’s made”).

### Made with AI tools

AI helped build the project. The live website does not use any AI: no chatbot, no generated advice, no diagnosis.

| | |
|---|---|
| ChatGPT (OpenAI) | Brainstorming, product discovery and the first product & development blueprint. |
| Google Antigravity | Agentic IDE used for the first coding pass (Django project scaffold and early pages). |
| Claude (Anthropic), in Cowork | Most of the code, design and testing: React frontend, Django API, discovery engine, journal, browser extension; and first drafts of dictionary entries and help-screen wording, all marked for expert review. |

### Frontend

| | |
|---|---|
| React 18.3 | User interface |
| Vite 5.4 | Development server and build |
| React Router 6.30 | Page routing |
| Tailwind CSS 3.4 | Styling and design tokens |
| Framer Motion 11.18 | Animations and page transitions |
| Three.js 0.169 · React Three Fiber 8.18 · drei 9.122 | The 3D heart on the homepage (WebGL) |
| D3.js 7.9 | Force-directed word maps |
| Plus Jakarta Sans · Newsreader | Typefaces, via Google Fonts |
| Illustrations and icons | Drawn for this project as inline SVG |

### Backend

| | |
|---|---|
| Python · Django 5.1 | Web server, data models, admin for editors |
| Django REST Framework 3.17 | JSON API shared by the website and the extension |
| SQLite (local) · PostgreSQL (deployment) | Database |
| WhiteNoise · django-cors-headers · dj-database-url · python-dotenv | Static files, development CORS, database URL and settings |
| Django sessions + CSRF | Optional accounts; passwords hashed with Django’s PBKDF2 |

### Browser extension

| | |
|---|---|
| Chrome Manifest V3 | Service worker, content script, context menu, keyboard shortcut, storage |
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

### Our API

| | |
|---|---|
| /api/dictionary/… | categories, search, terms/{slug}, terms/{slug}/related, graph, lookup, index |
| /api/discovery/explore/ | Sentence → possible words (text is never stored) |
| /api/support/… | resources (hotlines), responders, requests |
| /api/auth/… | me, register, login, logout, export, delete |
| /api/journal/… | entries, entries/{date}, import |
| External APIs | None. No analytics, ads or third-party data services. |

### Algorithms

| | |
|---|---|
| Sentence-to-word discovery | Text normalisation and contraction expansion → curated phrase cues (exact phrase, or all key words within a 7-word window with simple suffix stemming) → direct term/alias mentions → bonus for several independent signals → small, explained credit along curated “similar to / associated with” links → top 6 labelled “closer” or “possible”. Deterministic and explainable. |
| Crisis-word check | Fixed phrase list (English and Tagalog). Shows the fixed emergency message; never labels the person. |
| Dictionary search ranking | Exact name or alias → starts with → contains → found in definitions. |
| Extension hover lookup | Longest match first (up to 5 words) against a locally stored word list, with suffix stemming. Hovered text stays on the device unless it is a dictionary word. |
| Word maps | D3 force simulation: link, many-body, centring and collision forces. |
| Weekly summary | Counts per colour, repeated feeling words, comparison with the previous week, and fixed, pre-written observations. No scores shown, no diagnosis. |

### Content sources

Dictionary entries and help-screen wording are editorial drafts awaiting review by qualified professionals.

| | |
|---|---|
| References for dictionary entries | APA Dictionary of Psychology; WHO ICD-11, mhGAP Intervention Guide and Psychological First Aid guide; NIMH health topics; Figley (1995), Seligman (1975), Clance & Imes (1978), Linehan (2015), Maslach. |
| Grounding and breathing | Based on widely used techniques, including WHO’s guidance on simple stress-management skills. |
| Hotlines | NCMH Crisis Hotline (1553), Hopeline Philippines, DOH Center for Health Development I (as listed by the Provincial Government of La Union), 911. Numbers should be re-checked regularly. |

### Testing

| | |
|---|---|
| Django test runner | API, discovery, accounts, journal privacy |
| Playwright (Chromium) | End-to-end checks of the website, offline mode and the extension |

## Run it

```bash
python -m venv venv
.\venv\Scripts\activate            # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
copy .env.example .env             # cp on macOS/Linux
python manage.py migrate
python manage.py seed_vocabulary   # dictionary, relationships, phrase cues
python manage.py seed_support      # referral lines + demo responders
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

Editorial admin: `python manage.py createsuperuser`, then http://127.0.0.1:8000/admin/.

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
| GET | `/api/support/responders/` | Responder directory |
| POST | `/api/support/requests/` | Contact request to a responder |
| POST | `/api/check-ins/` | Anonymous check-in (legacy) |
| GET | `/api/auth/me/` | Current user (sets CSRF cookie) |
| POST | `/api/auth/register/` · `/login/` · `/logout/` | Optional account (session + CSRF) |
| GET | `/api/auth/export/` | Download my data |
| POST | `/api/auth/delete/` | Delete account + journal (password required) |
| GET | `/api/journal/entries/` | My entries |
| PUT/DELETE | `/api/journal/entries/{YYYY-MM-DD}/` | Save / remove a day |
| POST | `/api/journal/import/` | Move browser-saved entries into the account |

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

- The production build registers `/sw.js`; after one visit the help screens, hotline numbers and responder list work without signal.
- Safety plan, trusted person, read-aloud preference and follow-up reminders are stored only in the browser (`localStorage`). Nothing is sent to an organisation or contact without the person tapping send in their own messaging app.
- Typing crisis phrases anywhere shows the fixed emergency message immediately (client-side, `frontend/src/lib/crisis.js`).

## Content & review

- **All help-flow wording** (`frontend/src/lib/helpText.js`) is fixed text in English and Tagalog. The Tagalog lines are drafts: have a native speaker and a clinician review every screen before launch.

- Vocabulary source of truth: `fixtures/vocabulary.json` (loaded by `seed_vocabulary`).
- Every entry is `review` status ("Editorial draft — awaiting review by a qualified professional") until a reviewer approves it in admin. `draft` entries are hidden from the site and extension.
- References point to the APA Dictionary of Psychology, WHO ICD-11 / mhGAP / PFA, NIMH and named publications for reviewers to check against.
- **Before public launch:** re-confirm every number in `seed_support.py` (ITRMC and CDRRMO especially) and set `verified_on` in admin. Demo responders are synthetic and labelled as such.

## Project layout

```
config/            settings, urls, api_urls, SPA view
apps/dictionary/   Term, Category, TermRelationship, … + api.py, serializers.py
apps/discovery/    PhraseCue + engine.py + api.py (+ tests.py: API/engine tests)
apps/support/      ReferralResource, ResponderProfile, SupportRequest, DailyCheckIn + api.py
fixtures/          vocabulary.json
frontend/          React app (src/pages, src/components, src/lib)
extension/         MV3 extension
```

## Roadmap

Milestones 1–5 are in place. Next: organisations and per-school referral pathways, responder accounts, community word suggestions with moderation (Milestone 6), then accessibility/security hardening and demo prep (Milestone 7).
