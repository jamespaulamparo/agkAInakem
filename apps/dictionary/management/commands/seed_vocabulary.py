"""
Load the curated vocabulary dataset from fixtures/vocabulary.json.

Idempotent: re-running updates existing entries by slug. Phrase cues and
relationships for the listed terms are replaced so the JSON stays the source of truth.
"""
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.dictionary.models import (
    Category, Term, TermRelationship, TermExample, ReflectionQuestion, SourceReference,
)
from apps.discovery.models import PhraseCue

TERM_FIELDS = (
    'term', 'term_fil', 'term_type', 'short_definition', 'short_definition_fil',
    'detailed_definition', 'detailed_definition_fil', 'in_simpler_terms',
    'in_simpler_terms_fil', 'aliases', 'review_status',
)


class Command(BaseCommand):
    help = 'Seed the curated mental health vocabulary from fixtures/vocabulary.json'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=str(Path(settings.BASE_DIR) / 'fixtures' / 'vocabulary.json'))

    @transaction.atomic
    def handle(self, *args, **opts):
        data = json.loads(Path(opts['file']).read_text(encoding='utf-8'))

        cats = {}
        for c in data['categories']:
            cat, _ = Category.objects.update_or_create(slug=c['slug'], defaults={k: v for k, v in c.items() if k != 'slug'})
            cats[cat.slug] = cat

        terms = {}
        for t in data['terms']:
            defaults = {k: t[k] for k in TERM_FIELDS if k in t}
            defaults['category'] = cats[t['category']]
            term, _ = Term.objects.update_or_create(slug=t['slug'], defaults=defaults)
            terms[term.slug] = term

            term.examples.all().delete()
            for en, fil in t.get('examples', []):
                TermExample.objects.create(term=term, situation=en, situation_fil=fil)
            term.reflection_questions.all().delete()
            for en, fil in t.get('questions', []):
                ReflectionQuestion.objects.create(term=term, question=en, question_fil=fil)
            term.sources.all().delete()
            for src in t.get('sources', []):
                title, citation, url, clinical = src[:4]
                SourceReference.objects.create(term=term, title=title, citation=citation, url=url, is_clinical_reference=clinical,
                                               language=src[4] if len(src) > 4 else 'en')
            term.phrase_cues.all().delete()
            for cue in t.get('cues', []):
                phrase, why, weight = cue[0], cue[1], cue[2] if len(cue) > 2 else 1.0
                PhraseCue.objects.update_or_create(
                    term=term, phrase=phrase.lower(),
                    defaults={'why': why, 'weight': weight, 'language': 'fil' if _looks_filipino(phrase) else 'en'},
                )

        TermRelationship.objects.filter(source_term__in=terms.values()).delete()
        for src, tgt, typ, exp, exp_fil in data['relationships']:
            TermRelationship.objects.create(
                source_term=terms[src], target_term=terms[tgt], relationship_type=typ,
                explanation=exp, explanation_fil=exp_fil, editorial_review_status='review',
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(cats)} categories, {len(terms)} terms, {len(data['relationships'])} relationships, "
            f"{PhraseCue.objects.count()} phrase cues."
        ))


FIL_MARKERS = ('na ', 'ng ', 'ako', 'ko ', 'wala', 'ayoko', 'hindi', 'pagod', 'ubos', 'sobra', 'malungkot', 'kaba',
               'balisa', 'galit', 'manhid', 'inis', 'tamad', 'gana', 'puyat', 'kausap', 'mag-', 'pag-', 'baliw', 'namatay', 'paulit')


def _looks_filipino(phrase):
    p = phrase.lower() + ' '
    return any(m in p for m in FIL_MARKERS)
