from django.core.management import call_command
from django.test import TestCase

from apps.dictionary.models import Term
from apps.support.models import DailyCheckIn, SupportRequest, ResponderProfile


class SeededTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_vocabulary', verbosity=0)
        call_command('seed_support', verbosity=0)


class DiscoveryTests(SeededTestCase):
    def explore(self, text, **extra):
        return self.client.post('/api/discovery/explore/', {'text': text, **extra}, content_type='application/json')

    def test_flagship_example_surfaces_differentiated_terms(self):
        r = self.explore("I feel tired and everything is becoming too much.")
        self.assertEqual(r.status_code, 200)
        slugs = [x['slug'] for x in r.json()['results']]
        self.assertIn('overwhelm', slugs)
        self.assertIn('emotional-exhaustion', slugs)
        for item in r.json()['results']:
            self.assertTrue(item['reasons'], 'every suggestion must explain why')
            self.assertIn(item['fit'], ('closer', 'possible'))

    def test_no_diagnosis_or_score_fields(self):
        data = self.explore("I feel sad and lonely").json()
        flat = str(data).lower()
        for banned in ('risk', 'diagnos', 'severity', '"score"'):
            self.assertNotIn(banned, flat)
        self.assertFalse(data['stored'])

    def test_text_is_not_persisted(self):
        before = (Term.objects.count(), DailyCheckIn.objects.count(), SupportRequest.objects.count())
        self.explore("a very private sentence about my week")
        self.assertEqual(before, (Term.objects.count(), DailyCheckIn.objects.count(), SupportRequest.objects.count()))

    def test_filipino_phrase(self):
        slugs = [x['slug'] for x in self.explore("sobra na, hindi ko na kaya").json()['results']]
        self.assertIn('overwhelm', slugs)

    def test_support_info_flag(self):
        self.assertTrue(self.explore("I want to end my life").json()['show_support'])
        self.assertFalse(self.explore("I am tired of exams").json()['show_support'])

    def test_empty_text_rejected(self):
        self.assertEqual(self.explore("").status_code, 400)


class DictionaryApiTests(SeededTestCase):
    def test_search_ranks_exact_alias_first(self):
        data = self.client.get('/api/dictionary/search/?q=overwhelmed').json()
        self.assertEqual(data['results'][0]['slug'], 'overwhelm')

    def test_letter_and_category_filters(self):
        data = self.client.get('/api/dictionary/search/?letter=b').json()
        self.assertTrue(all(r['term'].lower().startswith('b') for r in data['results']))
        data = self.client.get('/api/dictionary/search/?category=stress-and-anxiety').json()
        self.assertTrue(all(r['category_slug'] == 'stress-and-anxiety' for r in data['results']))

    def test_term_detail_has_relationships_both_directions(self):
        data = self.client.get('/api/dictionary/terms/burnout/').json()
        directions = {r['direction'] for r in data['relationships']}
        self.assertEqual(directions, {'in', 'out'})
        self.assertTrue(data['sources'])

    def test_drafts_are_hidden(self):
        Term.objects.filter(slug='burnout').update(review_status='draft')
        self.assertEqual(self.client.get('/api/dictionary/terms/burnout/').status_code, 404)
        slugs = [r['slug'] for r in self.client.get('/api/dictionary/search/').json()['results']]
        self.assertNotIn('burnout', slugs)

    def test_related_graph(self):
        data = self.client.get('/api/dictionary/terms/burnout/related/').json()
        ids = {n['id'] for n in data['nodes']}
        self.assertIn('burnout', ids)
        for e in data['edges']:
            self.assertIn(e['source'], ids)
            self.assertIn(e['target'], ids)

    def test_extension_lookup(self):
        data = self.client.get('/api/dictionary/lookup/?q=Overwhelmed').json()
        self.assertEqual(data['match']['slug'], 'overwhelm')
        data = self.client.get('/api/dictionary/lookup/?q=I cannot keep up with everything').json()
        self.assertIsNone(data['match'])
        self.assertTrue(data['suggestions'])


class ExtensionIndexTests(SeededTestCase):
    def test_index_lists_names_for_local_matching(self):
        data = self.client.get('/api/dictionary/index/').json()
        by_slug = {t['slug']: t for t in data['terms']}
        self.assertIn('overwhelmed', by_slug['overwhelm']['names'])
        self.assertIn('burnout', by_slug['burnout']['names'])
        self.assertIn('kalungkutan', by_slug['sadness']['names'])

    def test_lookup_by_slug(self):
        data = self.client.get('/api/dictionary/lookup/?slug=burnout').json()
        self.assertEqual(data['match']['slug'], 'burnout')
        self.assertTrue(data['match']['related'])


class SupportApiTests(SeededTestCase):
    def test_resources_include_national_lines(self):
        names = [r['short_name'] for r in self.client.get('/api/support/resources/').json()]
        self.assertIn('911', names)
        self.assertIn('NCMH', names)

    def test_demo_responders_are_labelled(self):
        data = self.client.get('/api/support/responders/').json()
        self.assertTrue(data)
        self.assertTrue(all(r['is_demo'] for r in data))

    def test_support_request_flow(self):
        rid = ResponderProfile.objects.first().id
        r = self.client.post('/api/support/requests/', {'responder': rid, 'preferred_contact': 'message'},
                             content_type='application/json')
        self.assertEqual(r.status_code, 400)  # needs a contact detail
        r = self.client.post('/api/support/requests/', {'responder': rid, 'preferred_contact': 'in_person',
                                                         'message': 'Can we talk?'}, content_type='application/json')
        self.assertEqual(r.status_code, 201)
        self.assertIn('demonstration', r.json()['note'])

    def test_check_in_stores_only_colour_and_word(self):
        r = self.client.post('/api/check-ins/', {'mood_status': 'yellow', 'primary_feeling': 'tired', 'note': 'secret'},
                             content_type='application/json')
        self.assertEqual(r.status_code, 201)
        c = DailyCheckIn.objects.get()
        self.assertEqual(c.mood_status, 'yellow')
        self.assertFalse(hasattr(c, 'note'))
        self.assertEqual(self.client.post('/api/check-ins/', {'mood_status': 'purple'},
                                          content_type='application/json').status_code, 400)


class SpaTests(TestCase):
    def test_any_page_route_serves_app_shell(self):
        for path in ('/', '/dictionary/burnout', '/reach-out'):
            self.assertIn(self.client.get(path).status_code, (200, 503))


class OfflineTests(TestCase):
    def test_service_worker_served_from_root(self):
        r = self.client.get('/sw.js')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r['Service-Worker-Allowed'], '/')
