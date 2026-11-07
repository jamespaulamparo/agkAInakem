"""
Sample (mock) data for demos: made-up accounts with journals, and anonymous usage counts.

Everything created here is clearly marked so it can be removed in one step:
- accounts use emails ending in DEMO_DOMAIN and have no usable password (nobody can sign in as them)
- usage counts have is_demo=True
Never mix this into a real deployment's research reports without removing it first.
"""
import random
from datetime import timedelta

from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import Consent, ResearchConsent
from apps.journal.models import JournalEntry
from .models import UsageCount

DEMO_DOMAIN = 'demo.agkainakem.local'
# Written when staff remove sample data, so the launcher doesn't add it back on the next start.
REMOVED_MARKER = Path(settings.BASE_DIR) / '.sample-data-removed'
FIRST = ['Ana', 'Ben', 'Carla', 'Dan', 'Ella', 'Franco', 'Gia', 'Hans', 'Ivy', 'Jomar', 'Kaye', 'Leo', 'Mica', 'Nico', 'Ola', 'Paolo',
         'Queenie', 'Rafa', 'Sam', 'Tin', 'Uly', 'Vince', 'Wena', 'Xian', 'Yna', 'Zed', 'Aira', 'Bryan', 'Cielo', 'Dino']

# Personas: probability of (green, yellow, red) and typical feelings for each colour.
PERSONAS = {
    'steady':    {'p': (0.65, 0.28, 0.07), 'freq': 0.7},
    'student':   {'p': (0.35, 0.45, 0.20), 'freq': 0.6, 'weekday_heavy': True},
    'worker':    {'p': (0.40, 0.40, 0.20), 'freq': 0.5, 'weekday_heavy': True},
    'declining': {'p': (0.50, 0.35, 0.15), 'freq': 0.65, 'trend': -1},
    'improving': {'p': (0.30, 0.40, 0.30), 'freq': 0.65, 'trend': 1},
    'lonely':    {'p': (0.30, 0.40, 0.30), 'freq': 0.5, 'weekend_heavy': True},
    'sporadic':  {'p': (0.45, 0.35, 0.20), 'freq': 0.2},
}
FEELINGS = {
    'green': ['mindfulness', 'belonging', 'mindfulness', 'belonging', 'stress'],
    'yellow': ['stress', 'feeling-drained', 'anxiety', 'overwhelm', 'frustration', 'irritability'],
    'red': ['sadness', 'loneliness', 'feeling-drained', 'anxiety', 'hopelessness', 'emotional-numbness', 'overwhelm'],
}

USAGE = {  # (event, label): mean per day at the start of the period
    ('visit', 'mobile'): 34, ('visit', 'desktop'): 14, ('visit', 'tablet'): 3,
    ('lang', 'en'): 26, ('lang', 'fil'): 22, ('theme', 'auto'): 36, ('theme', 'dark'): 9, ('theme', 'light'): 5, ('simple_view', ''): 2,
    ('page', 'home'): 46, ('page', 'help'): 16, ('page', 'calm'): 14, ('page', 'talk'): 7, ('page', 'emergency'): 2, ('page', 'plan'): 3,
    ('page', 'professional'): 2, ('page', 'dictionary'): 18, ('page', 'word'): 26, ('page', 'journal'): 11, ('page', 'explore'): 7,
    ('page', 'privacy'): 2, ('page', 'credits'): 1, ('page', 'about'): 2,
    ('breathe_start', ''): 12, ('breathe_done', ''): 8, ('grounding_done', ''): 3, ('read_aloud', ''): 2,
    ('plan_saved', ''): 0.8, ('plan_printed', ''): 0.2, ('contact_added', ''): 1.5, ('text_contact', ''): 0.8, ('location_share', ''): 0.1,
    ('followup_set', ''): 0.6, ('reminder_on', ''): 0.4,
    ('call', 'crisis_line'): 1.6, ('call', 'emergency'): 0.3, ('call', 'contact'): 0.9, ('call', 'hospital'): 0.2,
    ('checkin_saved', 'guest'): 5, ('checkin_saved', 'account'): 6,
    ('term_view', 'burnout'): 5, ('term_view', 'anxiety'): 4, ('term_view', 'stress'): 3.5, ('term_view', 'loneliness'): 2.5,
    ('term_view', 'gratitude'): 2, ('term_view', 'mental-health'): 2, ('term_view', 'hope'): 1.5, ('term_view', 'grief'): 1.5,
    ('term_view', 'resilience'): 1.5, ('term_view', 'kapwa'): 1.2, ('term_view', 'overthinking'): 1.4, ('term_view', 'joy'): 1,
    ('term_saved', 'burnout'): 0.4, ('term_saved', 'gratitude'): 0.3, ('term_saved', 'anxiety'): 0.3,
    ('search', 'hit'): 6, ('search', 'miss'): 1.5, ('explore_run', 'results'): 4, ('explore_run', 'none'): 0.8,
    ('crisis_shown', ''): 0.25, ('nudge_shown', ''): 1.5, ('nudge_click', ''): 0.4, ('nudge_snooze', ''): 0.6, ('professional_print', ''): 0.1,
    ('suggestion_click', ''): 1.2, ('register', ''): 0.6, ('data_export', ''): 0.05, ('device_erased', ''): 0.05,
}


def _poisson(rng, lam):
    if lam <= 0:
        return 0
    if lam > 30:
        return max(0, int(rng.gauss(lam, lam ** 0.5)))
    L, k, p = pow(2.718281828, -lam), 0, 1.0
    while True:
        p *= rng.random()
        if p <= L:
            return k
        k += 1


def demo_counts():
    users = User.objects.filter(username__endswith='@' + DEMO_DOMAIN)
    return {'users': users.count(), 'research': ResearchConsent.objects.filter(user__in=users).count(),
            'entries': JournalEntry.objects.filter(user__in=users).count(),
            'usage_rows': UsageCount.objects.filter(is_demo=True).count()}


@transaction.atomic
def clear_demo(remember=False):
    n = demo_counts()
    if remember:
        REMOVED_MARKER.write_text('Sample data was removed from the dashboard. Delete this file or use "Add sample data" to bring it back.\n')
    User.objects.filter(username__endswith='@' + DEMO_DOMAIN).delete()   # cascades to journals and consents
    UsageCount.objects.filter(is_demo=True).delete()
    return n


@transaction.atomic
def load_demo(users=60, days=90, research_share=0.3, seed=7):
    clear_demo()
    REMOVED_MARKER.unlink(missing_ok=True)
    rng = random.Random(seed)
    today = timezone.localdate()
    now = timezone.now()
    personas = list(PERSONAS)
    for i in range(users):
        name = FIRST[i % len(FIRST)]
        email = f'{name.lower()}{i + 1}@{DEMO_DOMAIN}'
        joined = now - timedelta(days=int(days * rng.random() ** 0.7))
        u = User(username=email, email=email, first_name=name, date_joined=joined,
                 last_login=now - timedelta(days=rng.choice([0, 1, 2, 4, 7, 12, 20, 35, 60])))
        u.set_unusable_password()
        u.save()
        Consent.objects.create(user=u, notice_version='demo', sensitive_data=True, age_confirmed=True)
        if rng.random() < research_share:
            ResearchConsent.objects.create(user=u, notice_version='demo')
        if rng.random() < 0.15:
            continue   # some accounts never use the journal
        persona = PERSONAS[personas[i % len(personas)]]
        span = (today - joined.date()).days
        rows = []
        for d in range(span + 1):
            if rng.random() > persona['freq']:
                continue
            day = today - timedelta(days=d)
            g, y, r = persona['p']
            progress = 1 - d / max(span, 1)                     # 0 = oldest, 1 = today
            if persona.get('trend') == -1:
                g, r = g - 0.35 * progress, r + 0.35 * progress
            if persona.get('trend') == 1:
                g, r = g + 0.35 * progress, r - 0.25 * progress
            wd = day.weekday()
            if persona.get('weekday_heavy') and wd < 5:
                g, r = g - 0.1, r + 0.1
            if persona.get('weekend_heavy') and wd >= 5:
                g, r = g - 0.15, r + 0.15
            mood = rng.choices(['green', 'yellow', 'red'], [max(g, 0.02), max(y, 0.02), max(r, 0.02)])[0]
            feelings = rng.sample(FEELINGS[mood], k=rng.choice([0, 1, 1, 2, 2, 3]))
            rows.append(JournalEntry(user=u, date=day, mood=mood, feelings=sorted(set(feelings)), note=''))
        JournalEntry.objects.bulk_create(rows)

    usage = []
    for d in range(days):
        day = today - timedelta(days=d)
        growth = 0.55 + 0.45 * (1 - d / days)                     # the site grows over the period
        weekly = 0.8 if day.weekday() >= 5 else 1.05
        for (event, label), mean in USAGE.items():
            n = _poisson(rng, mean * growth * weekly)
            if n:
                usage.append(UsageCount(day=day, event=event, label=label, count=n, is_demo=True))
    UsageCount.objects.bulk_create(usage)
    return demo_counts()
