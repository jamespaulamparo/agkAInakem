from django.test import TestCase, Client
from django.urls import reverse

class NavigationAndPageTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_homepage_renders_correctly(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Words For It")
        self.assertContains(response, "Find the words for what you're feeling.")
        self.assertContains(response, "Pillar A")
        self.assertContains(response, "Pillar B")
        self.assertTemplateUsed(response, 'pages/home.html')

    def test_about_page_renders_correctly(self):
        response = self.client.get(reverse('about'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "About Words For It")
        self.assertContains(response, "What We Explicitly Do Not Do")
        self.assertTemplateUsed(response, 'pages/about.html')

    def test_explore_page_renders_correctly(self):
        response = self.client.get(reverse('discovery:explore'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Sentence-to-Word Discovery")

    def test_dictionary_index_renders_correctly(self):
        response = self.client.get(reverse('dictionary:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Specialized Mental Health Dictionary")

    def test_reach_out_hub_renders_correctly(self):
        response = self.client.get(reverse('support:reach_out'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Reach Out Hub")
        self.assertContains(response, "Verified Crisis & Emergency Contacts")

    def test_help_someone_renders_correctly(self):
        response = self.client.get(reverse('support:help_someone'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Notice Changes")
        self.assertContains(response, "Ask Gently")
        self.assertContains(response, "Listen Without Fixing")
        self.assertContains(response, "Connect to Support")
