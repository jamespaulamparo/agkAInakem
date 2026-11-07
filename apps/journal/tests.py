import datetime as dt

from django.contrib.auth.models import User
from django.test import TestCase, Client


class AuthAndJournalTests(TestCase):
    def setUp(self):
        self.c = Client(enforce_csrf_checks=True)

    def csrf(self):
        self.c.get('/api/auth/me/')
        return {'HTTP_X_CSRFTOKEN': self.c.cookies['csrftoken'].value}

    def post(self, url, data):
        return self.c.post(url, data, content_type='application/json', **self.csrf())

    def test_register_requires_csrf(self):
        r = self.c.post('/api/auth/register/', {'email': 'a@b.co', 'password': 'calm-river-77'}, content_type='application/json')
        self.assertEqual(r.status_code, 403)

    def test_register_login_logout(self):
        r = self.post('/api/auth/register/', {'name': 'Ana', 'email': 'Ana@Example.com', 'password': 'calm-river-77'})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()['user']['email'], 'ana@example.com')
        self.assertTrue(self.c.get('/api/auth/me/').json()['authenticated'])
        self.post('/api/auth/logout/', {})
        self.assertFalse(self.c.get('/api/auth/me/').json()['authenticated'])
        self.assertEqual(self.post('/api/auth/login/', {'email': 'ana@example.com', 'password': 'wrong'}).status_code, 400)
        self.assertEqual(self.post('/api/auth/login/', {'email': 'ANA@example.com', 'password': 'calm-river-77'}).status_code, 200)

    def test_weak_password_rejected(self):
        r = self.post('/api/auth/register/', {'email': 'x@y.co', 'password': '12345678'})
        self.assertEqual(r.status_code, 400)
        self.assertIn('password', r.json())

    def test_journal_is_private_and_upserts(self):
        self.post('/api/auth/register/', {'email': 'a@b.co', 'password': 'calm-river-77'})
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
        self.post('/api/auth/register/', {'email': 'c@d.co', 'password': 'calm-river-77'})
        self.assertEqual(self.c.get('/api/journal/entries/').json(), [])

    def test_anonymous_cannot_read_journal(self):
        self.assertEqual(self.c.get('/api/journal/entries/').status_code, 403)

    def test_import_keeps_existing_days(self):
        self.post('/api/auth/register/', {'email': 'a@b.co', 'password': 'calm-river-77'})
        today = dt.date.today().isoformat()
        h = self.csrf()
        self.c.put(f'/api/journal/entries/{today}/', {'mood': 'red'}, content_type='application/json', **h)
        r = self.post('/api/journal/import/', {'entries': [{'date': today, 'mood': 'green'}, {'date': '2026-01-02', 'mood': 'yellow'}, {'date': 'bad'}]})
        self.assertEqual(r.json(), {'created': 1, 'skipped': 2})

    def test_delete_account_removes_entries(self):
        self.post('/api/auth/register/', {'email': 'a@b.co', 'password': 'calm-river-77'})
        self.c.put(f'/api/journal/entries/{dt.date.today()}/', {'mood': 'red'}, content_type='application/json', **self.csrf())
        self.assertEqual(self.post('/api/auth/delete/', {'password': 'nope'}).status_code, 400)
        self.assertEqual(self.post('/api/auth/delete/', {'password': 'calm-river-77'}).status_code, 200)
        self.assertFalse(User.objects.exists())
