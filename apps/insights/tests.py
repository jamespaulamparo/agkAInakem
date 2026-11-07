from datetime import date

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import ResearchConsent
from apps.journal.models import JournalEntry
from .models import UsageCount


class EventsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_vocabulary', verbosity=0)

    def setUp(self):
        cache.clear()
        self.c = APIClient()

    def test_counts_allowed_events_only(self):
        r = self.c.post('/api/events/', {'events': [
            {'e': 'breathe_done'}, {'e': 'breathe_done'}, {'e': 'visit', 'l': 'mobile'},
            {'e': 'term_view', 'l': 'burnout'}, {'e': 'term_view', 'l': 'not-a-term'},
            {'e': 'page', 'l': 'something-free-text'}, {'e': 'made_up'},
        ]}, format='json')
        self.assertEqual(r.json()['saved'], 4)
        self.assertEqual(UsageCount.objects.get(event='breathe_done').count, 2)
        self.assertFalse(UsageCount.objects.filter(label='not-a-term').exists())
        self.assertFalse(UsageCount.objects.filter(event='made_up').exists())

    def test_no_identifying_fields(self):
        names = {f.name for f in UsageCount._meta.get_fields()}
        self.assertEqual(names, {'id', 'day', 'event', 'label', 'count', 'is_demo'})


class StatsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_vocabulary', verbosity=0)

    def setUp(self):
        cache.clear()
        self.c = APIClient()
        self.staff = User.objects.create_user('pc', password='x-strong-pass-1', is_staff=True)

    def test_staff_only(self):
        self.assertIn(self.c.get('/api/stats/').status_code, (401, 403))
        u = User.objects.create_user('a@ex.com', 'a@ex.com', 'pw-strong-123')
        self.c.force_authenticate(u)
        self.assertEqual(self.c.get('/api/stats/').status_code, 403)
        self.c.force_authenticate(self.staff)
        r = self.c.get('/api/stats/?days=30')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()['daily']['visit']), 30)

    def test_research_suppressed_until_enough_people(self):
        today = date.today()
        for i in range(6):
            u = User.objects.create_user(f'u{i}@ex.com', f'u{i}@ex.com', 'pw-strong-123')
            JournalEntry.objects.create(user=u, date=today, mood='red', feelings=['stress'], note='private note')
            if i < 4:
                ResearchConsent.objects.create(user=u, notice_version='t')
        self.c.force_authenticate(self.staff)
        r = self.c.get('/api/stats/').json()['research']
        self.assertTrue(r['suppressed'])
        self.assertNotIn('moods', r)
        ResearchConsent.objects.create(user=User.objects.get(username='u4@ex.com'), notice_version='t')
        r = self.c.get('/api/stats/').json()
        self.assertFalse(r['research']['suppressed'])
        self.assertEqual(r['research']['moods']['red'], 5)            # only the 5 who opted in
        self.assertEqual(r['research']['feelings'][0]['label'], 'stress')
        self.assertNotIn('private note', str(r))

    def test_research_opt_in_and_out(self):
        u = User.objects.create_user('b@ex.com', 'b@ex.com', 'pw-strong-123')
        self.c.force_authenticate(u)
        self.assertTrue(self.c.post('/api/auth/research/').json()['user']['research_opt_in'])
        self.assertFalse(self.c.delete('/api/auth/research/').json()['user']['research_opt_in'])


class DemoDataTests(TestCase):
    def setUp(self):
        import tempfile, pathlib
        from unittest import mock
        self.tmp = tempfile.TemporaryDirectory()
        p = mock.patch('apps.insights.demo.REMOVED_MARKER', pathlib.Path(self.tmp.name) / 'marker')
        p.start(); self.addCleanup(p.stop); self.addCleanup(self.tmp.cleanup)
        cache.clear()
        self.c = APIClient()
        self.staff = User.objects.create_user('pc', password='x-strong-pass-1', is_staff=True)
        self.c.force_authenticate(self.staff)

    def test_load_filter_and_clear(self):
        added = self.c.post('/api/stats/demo/').json()['added']
        self.assertEqual(added['users'], 60)
        self.assertGreater(added['research'], 5)
        self.assertLess(added['research'], 30)              # most do not opt in
        self.assertFalse(User.objects.get(username__startswith='ana1@').has_usable_password())
        with_demo = self.c.get('/api/stats/').json()
        without = self.c.get('/api/stats/?demo=0').json()
        self.assertEqual(with_demo['accounts']['total'], 60)
        self.assertEqual(without['accounts']['total'], 0)
        self.assertGreater(with_demo['headline']['visits'], 0)
        self.assertEqual(without['headline']['visits'], 0)
        self.assertFalse(with_demo['research']['suppressed'])
        self.c.delete('/api/stats/demo/')
        self.assertEqual(User.objects.filter(username__endswith='@demo.agkainakem.local').count(), 0)
        self.assertFalse(UsageCount.objects.filter(is_demo=True).exists())

    def test_staff_only(self):
        self.c.force_authenticate(None)
        self.assertIn(self.c.post('/api/stats/demo/').status_code, (401, 403))
