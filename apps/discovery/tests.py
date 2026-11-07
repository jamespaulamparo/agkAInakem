from django.test import TestCase, Client
from django.urls import reverse
from apps.dictionary.models import Category, Term, TermRelationship
from apps.support.models import DailyCheckIn

class MilestoneTwoAndUITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(
            name='Emotional Exhaustion',
            name_fil='Pagkaubos ng Lakas',
            slug='emotional-exhaustion'
        )
        self.term_burnout = Term.objects.create(
            term='Burnout',
            slug='burnout',
            term_fil='Sobra-sobrang Pagkaubos',
            category=self.category,
            short_definition='State of exhaustion.',
            detailed_definition='Detailed burnout description.',
            in_simpler_terms='Completely depleted.',
            term_type='psychological',
            review_status='approved'
        )
        self.term_tiredness = Term.objects.create(
            term='Temporary Tiredness',
            slug='temporary-tiredness',
            term_fil='Pansamantalang Pagod',
            category=self.category,
            short_definition='Short-term tiredness.',
            term_type='everyday',
            review_status='approved'
        )
        self.rel = TermRelationship.objects.create(
            source_term=self.term_burnout,
            target_term=self.term_tiredness,
            relationship_type='different_from',
            explanation='Burnout persists even after sleeping, unlike tiredness.',
            editorial_review_status='approved'
        )

    def test_homepage_has_three_big_hero_buttons(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "I Need Help")
        self.assertContains(response, "Someone Else Needs Help")
        self.assertContains(response, "Daily Tracker")
        self.assertContains(response, "hero-big-btn")

    def test_bilingual_toggle_present(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "lang-switcher")
        self.assertContains(response, "data-lang=\"en\"")
        self.assertContains(response, "data-lang=\"fil\"")

    def test_dictionary_index_renders_terms(self):
        response = self.client.get(reverse('dictionary:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Burnout")
        self.assertContains(response, "Emotional Exhaustion")

    def test_term_detail_renders_relationships_and_distinctions(self):
        response = self.client.get(reverse('dictionary:detail', kwargs={'slug': 'burnout'}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Burnout")
        self.assertContains(response, "Temporary Tiredness")
        self.assertContains(response, "Burnout persists even after sleeping")

    def test_daily_tracker_get_and_post(self):
        get_resp = self.client.get(reverse('support:daily_tracker'))
        self.assertEqual(get_resp.status_code, 200)
        self.assertContains(get_resp, "Daily Emotional Tracker")

        post_resp = self.client.post(reverse('support:daily_tracker'), {
            'mood_status': 'yellow',
            'primary_feeling': 'Exhausted',
            'note': 'Long study session'
        })
        self.assertEqual(post_resp.status_code, 200)
        self.assertContains(post_resp, "Thank you for checking in with yourself")
        self.assertEqual(DailyCheckIn.objects.count(), 1)
        check_in = DailyCheckIn.objects.first()
        self.assertEqual(check_in.mood_status, 'yellow')
