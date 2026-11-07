import datetime as dt

from django.contrib.auth.models import User
from django.test import TestCase, Client


class AuthAndJournalTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.c = Client(enforce_csrf_checks=True)

    def csrf(self):
        self.c.get('/api/auth/me/')
        return {'HTTP_X_CSRFTOKEN': self.c.cookies['csrftoken'].value}

    def post(self, url, data):
        return self.c.post(url, data, content_type='application/json', **self.csrf())

    def test_register_requires_csrf(self):
        r = self.c.post('/api/auth/register/', {'email': 'a@b.co', 'password': 'calm-river-77', 'consent': True, 'age_confirmed': True}, content_type='application/json')
        self.assertEqual(r.status_code, 403)

    def test_register_login_logout(self):
        r = self.post('/api/auth/register/', {'name': 'Ana', 'email': 'Ana@Example.com', 'password': 'calm-river-77', 'consent': True, 'age_confirmed': True})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()['user']['email'], 'ana@example.com')
        self.assertTrue(self.c.get('/api/auth/me/').json()['authenticated'])
        self.post('/api/auth/logout/', {})
        self.assertFalse(self.c.get('/api/auth/me/').json()['authenticated'])
        self.assertEqual(self.post('/api/auth/login/', {'email': 'ana@example.com', 'password': 'wrong'}).status_code, 400)
        self.assertEqual(self.post('/api/auth/login/', {'email': 'ANA@example.com', 'password': 'calm-river-77'}).status_code, 200)

    def test_weak_password_rejected(self):
        r = self.post('/api/auth/register/', {'email': 'x@y.co', 'password': '12345678', 'consent': True, 'age_confirmed': True})
        self.assertEqual(r.status_code, 400)
        self.assertIn('password', r.json())

    def test_journal_is_private_and_upserts(self):
        self.post('/api/auth/register/', {'email': 'a@b.co', 'password': 'calm-river-77', 'consent': True, 'age_confirmed': True})
        day = (dt.date.today() - dt.timedelta(days=2)).isoformat()
        h = self.csrf()
        r = self.c.put(f'/api/journal/entries/{day}/', {'mood': 'yellow', 'feelings': ['anxiety'], 'note': 'exam'}, content_type='application/json', **h)
        self.assertEqual(r.status_code, 201)
        r = self.c.put(f'/api/journal/entries/{day}/', {'mood': 'green', 'feelings': []}, content_type='application/json', **h)
        self.assertEqual(r.status_code, 200)
        data = self.c.get('/api/journal/entries/').json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['mood'], 'green')
        # future dates are rejected
        future = (dt.date.today() + dt.timedelta(days=5)).isoformat()
        self.assertEqual(self.c.put(f'/api/journal/entries/{future}/', {'mood': 'green'}, content_type='application/json', **h).status_code, 400)
        # another user cannot see it
        self.post('/api/auth/logout/', {})
        self.post('/api/auth/register/', {'email': 'c@d.co', 'password': 'calm-river-77', 'consent': True, 'age_confirmed': True})
        self.assertEqual(self.c.get('/api/journal/entries/').json(), [])

    def test_anonymous_cannot_read_journal(self):
        self.assertEqual(self.c.get('/api/journal/entries/').status_code, 403)

    def test_import_keeps_existing_days(self):
        self.post('/api/auth/register/', {'email': 'a@b.co', 'password': 'calm-river-77', 'consent': True, 'age_confirmed': True})
        today = dt.date.today().isoformat()
        h = self.csrf()
        self.c.put(f'/api/journal/entries/{today}/', {'mood': 'red'}, content_type='application/json', **h)
        r = self.post('/api/journal/import/', {'entries': [{'date': today, 'mood': 'green'}, {'date': '2026-01-02', 'mood': 'yellow'}, {'date': 'bad'}]})
        self.assertEqual(r.json(), {'created': 1, 'skipped': 2})

    def test_delete_account_removes_entries(self):
        self.post('/api/auth/register/', {'email': 'a@b.co', 'password': 'calm-river-77', 'consent': True, 'age_confirmed': True})
        self.c.put(f'/api/journal/entries/{dt.date.today()}/', {'mood': 'red'}, content_type='application/json', **self.csrf())
        self.assertEqual(self.post('/api/auth/delete/', {'password': 'nope'}).status_code, 400)
        self.assertEqual(self.post('/api/auth/delete/', {'password': 'calm-river-77'}).status_code, 200)
        self.assertFalse(User.objects.exists())


class PasswordResetTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()   # rate-limit counters are shared across tests
        self.c = Client(enforce_csrf_checks=True)
        User.objects.create_user(username='a@b.co', email='a@b.co', password='calm-river-77')

    def post(self, url, data):
        self.c.get('/api/auth/me/')
        return self.c.post(url, data, content_type='application/json', HTTP_X_CSRFTOKEN=self.c.cookies['csrftoken'].value)

    def test_reset_flow(self):
        from django.core import mail
        import re
        self.assertEqual(self.post('/api/auth/password-reset/', {'email': 'nobody@x.co'}).json(), {'ok': True})
        self.assertEqual(len(mail.outbox), 0)
        self.post('/api/auth/password-reset/', {'email': 'A@b.co'})
        self.assertEqual(len(mail.outbox), 1)
        uid, token = re.search(r'/reset/([^/]+)/(\S+)', mail.outbox[0].body).groups()
        self.assertEqual(self.post('/api/auth/password-reset/confirm/', {'uid': uid, 'token': 'bad', 'password': 'new-river-88'}).status_code, 400)
        r = self.post('/api/auth/password-reset/confirm/', {'uid': uid, 'token': token, 'password': 'new-river-88'})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(User.objects.get().check_password('new-river-88'))
        # token is single-use
        self.assertEqual(self.post('/api/auth/password-reset/confirm/', {'uid': uid, 'token': token, 'password': 'other-river-99'}).status_code, 400)


class ConsentTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.c = Client(enforce_csrf_checks=True)

    def post(self, url, data):
        self.c.get('/api/auth/me/')
        return self.c.post(url, data, content_type='application/json', HTTP_X_CSRFTOKEN=self.c.cookies['csrftoken'].value)

    def test_register_requires_consent_and_age(self):
        base = {'email': 'z@y.co', 'password': 'calm-river-77'}
        self.assertEqual(self.post('/api/auth/register/', {**base, 'consent': False, 'age_confirmed': True}).status_code, 400)
        self.assertEqual(self.post('/api/auth/register/', {**base, 'consent': True, 'age_confirmed': False}).status_code, 400)
        self.assertEqual(self.post('/api/auth/register/', {**base, 'consent': True, 'age_confirmed': True}).status_code, 201)
        data = self.c.get('/api/auth/export/').json()
        self.assertEqual(len(data['consents']), 1)
        self.assertTrue(data['consents'][0]['sensitive_data'])

    def test_deleting_account_removes_consent_records(self):
        from apps.accounts.models import Consent
        self.post('/api/auth/register/', {'email': 'q@y.co', 'password': 'calm-river-77', 'consent': True, 'age_confirmed': True})
        self.post('/api/auth/delete/', {'password': 'calm-river-77'})
        self.assertFalse(Consent.objects.exists())
