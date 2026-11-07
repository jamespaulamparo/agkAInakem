# agkAInakem

> **Mental Health Literacy & Early-Support Platform**  
> Rooted in **San Fernando, La Union, Philippines**  
> Helping people discover vocabulary for emotional experiences, understand mental health concepts, and connect with trustworthy human assistance.

---

## 1. Product Overview & Ilokano Cultural Philosophy

**agkAInakem** is a browser-based mental health literacy and early-support platform.

### The Philosophy of *Nakem*:
In Ilokano philosophy, **nakem** represents the seat of consciousness, conscience, inner feeling, and emotional will. Emotional distress is understood as a disturbance of the inner self (*pannakaburibor wenno pannakariribuk ti nakem*).

**agkAInakem** (*panagkainakem*) means arriving at mutual understanding, deep empathy, and shared mind. The highlighted **AI** functions strictly as an educational vocabulary discovery engine — a lexical companion that helps organize and illuminate vocabulary, never replacing human warmth (*panangngaasi*) or licensed psychiatric evaluation.

### Core Objectives:
1. **Sapulen ti Balikas (Pillar A — Find Words For It)**: Curated mental health dictionary, sentence-to-concept discovery, and nuanced relationship mapping (e.g. *bannog* vs. burnout, *ladingit* vs. depression, *danag* vs. generalized anxiety).
2. **Agpadungso (Pillar B — Reach Out)**: Non-blocking calming first-aid instructions (5-4-3-2-1 sensory grounding), guided *Notice &rarr; Ask &rarr; Listen &rarr; Connect* support for friends and families, and a verified local healthcare directory in San Fernando, La Union.

---

## 2. Localized Care Network (San Fernando, La Union)

All crisis and healthcare referrals are localized to official Region 1 and Philippine national institutions:

- **Ilocos Training and Regional Medical Center (ITRMC)**: Department of Psychiatry & Behavioral Medicine, Parian, City of San Fernando, La Union &bull; Tel: `(072) 607-6418` | Trunkline: `(072) 607-6422`
- **San Fernando CDRRMO / Emergency Rescue**: City Hall Compound, San Fernando, La Union &bull; `911` / `(072) 687-8100` | Mobile: `0917-862-2376`
- **Department of Health (DOH) Center for Health Development Region 1**: San Fernando, La Union
- **National Center for Mental Health (NCMH) 24/7 Crisis Hotline**: Dial `1553` (Toll-Free Nationwide) | Mobile: `0917-899-USAP (8727)` / `0908-639-2672`
- **Hopeline Philippines**: `(02) 8804-4673` | `0917-558-4673`

---

## 3. Design System & Tokens

*agkAInakem* follows a calming, minimalist editorial design:

| Token Name | Hex Code | Role |
|---|---|---|
| **Primary Soft Teal** | `#4FA8A0` | Primary actions, branding, focus rings |
| **Secondary Sky Blue** | `#8EC5E8` | Accents, badges, supportive actions |
| **Sage Green** | `#A9C8A5` | Positive states, healing, verified badges |
| **Warm Off-White** | `#F7F4EF` | Main page background |
| **Brand AI Accent** | `#2C8C83` | Vibrant teal accent for the **AI** letters in *agkAInakem* |
| **Deep Slate-Teal** | `#263A38` | High-contrast readable typography (Plus Jakarta Sans) |

---

## 4. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/jamespaulamparo/agkAIsa.git
cd agkAIsa

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run tests
python manage.py test

# Start development server
python manage.py runserver
```

Navigate to `http://127.0.0.1:8000/`.
