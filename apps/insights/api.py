"""
Privacy-preserving analytics.

POST /api/events/   anonymous counters from the website (no cookies needed, nothing identifying stored)
GET  /api/stats/    staff-only dashboard data: usage, accounts, content, and research aggregates
GET  /api/stats/export.csv   staff-only daily usage counts for research

Research aggregates about journals use only people who opted in (ResearchConsent), and any
group smaller than MIN_GROUP people is suppressed so no one can be singled out.
"""
import csv
import re
from collections import Counter, defaultdict
from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Count, F, Sum
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.accounts.models import Consent, ResearchConsent
from apps.dictionary.models import Category, Term
from apps.journal.models import JournalEntry
from .demo import DEMO_DOMAIN, clear_demo, demo_counts, load_demo
from .models import UsageCount

MIN_GROUP = 5
SLUG = re.compile(r'^[a-z0-9][a-z0-9-]{0,58}$')

# event -> allowed labels (None = no label, 'slug' = a dictionary slug that exists, set = fixed values)
EVENTS = {
    'visit': {'mobile', 'tablet', 'desktop'},
    'page': {'home', 'help', 'calm', 'talk', 'emergency', 'plan', 'someone', 'professional', 'check-in', 'dictionary', 'word',
             'explore', 'journal', 'saved', 'about', 'privacy', 'credits', 'share', 'extension', 'account', 'login', 'register', 'other'},
    'lang': {'en', 'fil'},
    'theme': {'light', 'dark', 'auto'},
    'simple_view': None,
    'breathe_start': None, 'breathe_done': None, 'grounding_done': None, 'read_aloud': None,
    'call': {'emergency', 'crisis_line', 'hospital', 'government', 'contact'},
    'text_contact': None, 'location_share': None, 'contact_added': None,
    'plan_saved': None, 'plan_printed': None, 'followup_set': None, 'reminder_on': None,
    'checkin_saved': {'guest', 'account'},
    'term_view': 'slug', 'term_saved': 'slug', 'search': {'hit', 'miss'}, 'explore_run': {'results', 'none'},
    'crisis_shown': None,
    'nudge_shown': None, 'nudge_click': None, 'nudge_snooze': None, 'professional_print': None,
    'suggestion_click': None, 'register': None, 'account_deleted': None, 'data_export': None, 'device_erased': None,
    'pwa_install': None, 'share_qr': None,
}


def _valid(event, label):
    rule = EVENTS.get(event, False)
    if rule is False:
        return None
    if rule is None:
        return ''
    if rule == 'slug':
        return label if SLUG.match(label or '') and Term.public.filter(slug=label).exists() else None
    return label if label in rule else None


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def events(request):
    items = request.data.get('events') if isinstance(request.data, dict) else None
    if not isinstance(items, list):
        return Response({'detail': 'events must be a list'}, status=400)
    today = timezone.localdate()
    saved = 0
    for item in items[:25]:
        if not isinstance(item, dict):
            continue
        event, label = str(item.get('e', ''))[:40], str(item.get('l', '') or '')[:60]
        label = _valid(event, label)
        if label is None:
            continue
        row, _ = UsageCount.objects.get_or_create(day=today, event=event, label=label, is_demo=False)
        UsageCount.objects.filter(pk=row.pk).update(count=F('count') + 1)
        saved += 1
    return Response({'saved': saved})


events.cls.throttle_scope = 'events'


def _series(qs, days, start):
    by_day = defaultdict(int)
    for r in qs:
        by_day[r['day']] += r['n']
    return [{'date': (start + timedelta(d)).isoformat(), 'n': by_day.get(start + timedelta(d), 0)} for d in range(days)]


@api_view(['GET'])
@permission_classes([IsAdminUser])
def stats(request):
    days = max(7, min(int(request.GET.get('days', 30) or 30), 365))
    with_demo = request.GET.get('demo', '1') != '0'
    today = timezone.localdate()
    start = today - timedelta(days - 1)
    prev_start = start - timedelta(days)
    all_usage = UsageCount.objects.all() if with_demo else UsageCount.objects.filter(is_demo=False)
    usage = all_usage.filter(day__gte=start)

    def total(event, qs=usage):
        return qs.filter(event=event).aggregate(n=Sum('count'))['n'] or 0

    def labels(event, qs=usage, limit=None):
        rows = qs.filter(event=event).values('label').annotate(n=Sum('count')).order_by('-n')
        rows = [{'label': r['label'], 'n': r['n']} for r in rows]
        return rows[:limit] if limit else rows

    daily = lambda event: _series(usage.filter(event=event).values('day').annotate(n=Sum('count')), days, start)
    prev = all_usage.filter(day__gte=prev_start, day__lt=start)

    # Accounts (counts only)
    users = User.objects.filter(is_staff=False)
    if not with_demo:
        users = users.exclude(username__endswith='@' + DEMO_DOMAIN)
    joined = users.filter(date_joined__date__gte=start).extra(select={'day': 'date(date_joined)'}).values('day').annotate(n=Count('id'))
    joined_by_day = Counter()
    for r in joined:
        d = r['day']
        joined_by_day[d if isinstance(d, str) else d.isoformat()] += r['n']
    entries = JournalEntry.objects.filter(user__in=users)

    # Research aggregates: opted-in people only, suppressed below MIN_GROUP
    research_users = list(ResearchConsent.objects.filter(user__in=users).values_list('user_id', flat=True))
    n_research = len(research_users)
    research = {'participants': n_research, 'min_group': MIN_GROUP, 'suppressed': n_research < MIN_GROUP}
    if n_research >= MIN_GROUP:
        rq = JournalEntry.objects.filter(user_id__in=research_users, date__gte=start)
        moods = Counter(rq.values_list('mood', flat=True))
        weekday = defaultdict(Counter)
        weekly = defaultdict(Counter)
        feelings = Counter()
        people_per_feeling = defaultdict(set)
        for e in rq.values('user_id', 'date', 'mood', 'feelings'):
            weekday[e['date'].weekday()][e['mood']] += 1
            weekly[(e['date'] - timedelta(e['date'].weekday())).isoformat()][e['mood']] += 1
            for f in set(e['feelings'] or []):
                feelings[f] += 1
                people_per_feeling[f].add(e['user_id'])
        research.update({
            'entries': rq.count(),
            'moods': {m: moods.get(m, 0) for m in ('green', 'yellow', 'red')},
            'weekday': [{'day': d, **{m: weekday[d].get(m, 0) for m in ('green', 'yellow', 'red')}} for d in range(7)],
            'weekly': [{'week': w, **{m: c.get(m, 0) for m in ('green', 'yellow', 'red')}} for w, c in sorted(weekly.items())],
            # A feeling is shown only if at least MIN_GROUP different people chose it.
            'feelings': [{'label': f, 'n': n} for f, n in feelings.most_common() if len(people_per_feeling[f]) >= MIN_GROUP][:12],
        })

    terms = Term.public.all()
    return Response({
        'demo': {**demo_counts(), 'included': with_demo},
        'range': {'days': days, 'start': start.isoformat(), 'end': today.isoformat()},
        'headline': {
            'visits': total('visit'), 'visits_prev': total('visit', prev),
            'breathe_done': total('breathe_done'), 'breathe_done_prev': total('breathe_done', prev),
            'calls': total('call'), 'calls_prev': total('call', prev),
            'term_views': total('term_view'), 'term_views_prev': total('term_view', prev),
            'users': users.count(), 'users_new': users.filter(date_joined__date__gte=start).count(),
        },
        'daily': {k: daily(k) for k in ('visit', 'breathe_done', 'term_view', 'checkin_saved', 'call')},
        'pages': labels('page'),
        'help': [{'label': k, 'n': total(k)} for k in ('breathe_start', 'breathe_done', 'grounding_done', 'read_aloud', 'plan_saved',
                                                       'plan_printed', 'contact_added', 'text_contact', 'location_share', 'followup_set')],
        'calls': labels('call'),
        'safety': [{'label': k, 'n': total(k)} for k in ('crisis_shown', 'nudge_shown', 'nudge_click', 'nudge_snooze', 'professional_print')],
        'devices': labels('visit'), 'langs': labels('lang'), 'themes': labels('theme'),
        'top_terms': labels('term_view', limit=15), 'saved_terms': labels('term_saved', limit=10),
        'search': labels('search'), 'explore': labels('explore_run'),
        'checkins': labels('checkin_saved'),
        'accounts': {
            'total': users.count(), 'new': users.filter(date_joined__date__gte=start).count(),
            'active_30d': users.filter(last_login__gte=timezone.now() - timedelta(30)).count(),
            'with_journal': entries.values('user').distinct().count(), 'entries': entries.count(),
            'consents': Consent.objects.filter(user__in=users).count(), 'research_opt_in': n_research,
            'daily_new': [{'date': (start + timedelta(d)).isoformat(), 'n': joined_by_day.get((start + timedelta(d)).isoformat(), 0)} for d in range(days)],
            'deleted': total('account_deleted'), 'exports': total('data_export'),
        },
        'research': research,
        'content': {
            'terms': terms.count(),
            'by_category': [{'label': c.name, 'n': c.n} for c in Category.objects.annotate(n=Count('terms')).order_by('-n')],
            'by_type': [{'label': r['term_type'], 'n': r['n']} for r in terms.values('term_type').annotate(n=Count('id')).order_by('-n')],
        },
    })


@api_view(['POST', 'DELETE'])
@permission_classes([IsAdminUser])
def demo_data(request):
    """Staff tool: add (POST) or remove (DELETE) clearly-marked sample data."""
    if request.method == 'POST':
        return Response({'added': load_demo()})
    return Response({'removed': clear_demo(remember=True)})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_csv(request):
    resp = HttpResponse(content_type='text/csv')
    resp['Content-Disposition'] = f'attachment; filename="agkainakem-usage-{timezone.localdate()}.csv"'
    w = csv.writer(resp)
    w.writerow(['day', 'event', 'label', 'count', 'sample_data'])
    qs = UsageCount.objects.all() if request.GET.get('demo', '1') != '0' else UsageCount.objects.filter(is_demo=False)
    for r in qs.order_by('day', 'event', 'label').values_list('day', 'event', 'label', 'count', 'is_demo'):
        w.writerow(r)
    return resp
