# Words For It

> **Mental Health Literacy & Early-Support Platform**  
> Helping people discover vocabulary for emotional experiences, understand mental health concepts, and connect with trustworthy human assistance.

---

## 1. Product Overview

Words For It is a browser-based mental health literacy website supported by a Chromium Manifest V3 companion browser extension.

### Core Objectives:
1. **Find Words For It (Pillar A)**: Curated mental health dictionary, sentence-to-word discovery, nuanced relationship mapping (e.g. burnout vs. stress, loneliness vs. isolation).
2. **Reach Out (Pillar B)**: Non-blocking calming first-aid instructions, guided *Notice &rarr; Ask &rarr; Listen &rarr; Connect* support for friends, and verified responder pathways.

### Ethical Boundaries:
- **No Automated Clinical Diagnoses**: Words For It offers educational literacy and communication support; it does not diagnose mental health disorders.
- **No Replacement for Care**: Immediate crisis hotlines (such as 988) are prominent, transparent, and non-blocking.
- **Privacy by Default**: Public browsing requires no account, and exploratory text is not retained or tracked.

---

## 2. Design System & Tokens

Words For It uses an official calming, editorial palette:

| Token Name | Hex Code | Role |
|---|---|---|
| **Primary** | `#4FA8A0` | Soft Teal · Primary branding, buttons, active states |
| **Secondary** | `#8EC5E8` | Sky Blue · Accents, badges, secondary actions |
| **Positive / Approval** | `#A9C8A5` | Sage Green · Positive states, verified badges |
| **Main Background** | `#F7F4EF` | Warm Off-White · Base background surface |
| **Text Dark** | `#263A38` | Deep slate-teal for accessible high-contrast reading |
| **Surface Card** | `#FFFFFF` | Crisp white cards with soft borders and subtle elevation |

Typography is set in **Plus Jakarta Sans** with clean system fallbacks.

---

## 3. Technology Stack

- **Backend**: Python 3.11+, Django 5.1+, Django REST Framework
- **Frontend**: Semantic HTML5, CSS custom properties, vanilla ES6+ JavaScript
- **Database**: SQLite (local development) / PostgreSQL (production)
- **Extension**: Chromium Manifest V3 (`extension/`)

---

## 4. Local Development Setup

### 4.1 Prerequisites
- Python 3.11+
- Git

### 4.2 Installation
```bash
# Clone the repository and enter the directory
cd WordsForIt

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Windows PowerShell
# source venv/bin/activate # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Apply database migrations
python manage.py migrate

# Run test suite
python manage.py test

# Start local development server
python manage.py runserver
```

Navigate to `http://127.0.0.1:8000` in your web browser.

---

## 5. Development Milestones

- [x] **Milestone 1: Project Foundation & Design System**
  - Django project configuration and modular `apps/` layout.
  - Centralized CSS design tokens, typography, and responsive grid.
  - Base template, accessible global navigation, crisis banner, and homepage.
  - Test suite verification.
- [ ] **Milestone 2: Mental Health Dictionary**
  - Category, Term, Definition, Relationship, Example, and Source models.
  - Seed dataset with 50+ curated mental health terms and explicit relationships.
  - Search, taxonomy browsing, and detailed term pages.
- [ ] **Milestone 3: Sentence-to-Word Discovery**
  - Phrase-matching engine and theme extraction.
  - Differentiated candidate explanations.
- [ ] **Milestone 4: Companion Chromium Extension**
  - Manifest V3 context menu and selection lookup.
- [ ] **Milestone 5: Reach Out Early-Support System**
  - Step-by-step calming first-aid, Notice-Ask-Listen-Connect, and responder directory.
- [ ] **Milestone 6: Organization Configurations & Community**
  - Sector-specific workflows and community vocabulary submissions.
- [ ] **Milestone 7: Security Audit, Accessibility & Final Polish**
