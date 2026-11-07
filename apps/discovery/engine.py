"""
Sentence-to-word discovery engine.

Given text a person deliberately submits, return *possible* vocabulary from the
curated dictionary, each with a human-written reason. Deterministic, explainable,
and works without any AI service.

What it deliberately does NOT do: diagnose, score risk, or store the text.

Pipeline
--------
1. normalise   – lower-case, expand contractions, strip punctuation
2. cue match   – curated PhraseCue phrases: exact phrase match, or all content
                 words present (stem-tolerant) within a short window
3. term match  – the person names a term or one of its aliases directly
4. expand      – a little credit flows along curated "similar_to" /
                 "often_associated_with" relationships
5. rank        – top N, with matched fragments for highlighting
"""
from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass, field

from apps.dictionary.models import Term, TermRelationship
from .models import PhraseCue

CONTRACTIONS = {
    "can't": "cannot", "won't": "will not", "don't": "do not", "doesn't": "does not", "didn't": "did not",
    "i'm": "i am", "i've": "i have", "isn't": "is not", "aren't": "are not", "wasn't": "was not",
    "haven't": "have not", "couldn't": "could not", "shouldn't": "should not", "it's": "it is",
    "what's": "what is", "there's": "there is", "nothing's": "nothing is",
}
STOPWORDS = set("""
a an the and or but so to of in on at for with by from up about into over after i me my myself
we our you your he she it they them is am are was were be been being do does did have has had
this that these those just really very too also like as if then than when while not no
""".split())
STOPWORDS -= {"not", "no", "too"}   # these carry meaning in emotional language

# Expressions that should surface support information. This is not a classifier:
# it never labels the person, it only makes sure help is one tap away.
SUPPORT_PHRASES = (
    "kill myself", "end my life", "suicide", "suicidal", "want to die", "don't want to live", "do not want to live",
    "better off without me", "hurt myself", "self harm", "self-harm", "no reason to live",
    "magpakamatay", "ayoko nang mabuhay", "gusto ko nang mamatay", "saktan ang sarili",
)

PROPAGATE = {'similar_to': 0.35, 'often_associated_with': 0.25, 'related_to': 0.15}
MAX_TEXT = 1200


def normalise(text: str) -> str:
    t = text.lower().replace("’", "'").replace("‘", "'")
    for k, v in CONTRACTIONS.items():
        t = t.replace(k, v)
    t = re.sub(r"[^\w\s'-]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def stem(w: str) -> str:
    for suf in ("ingly", "edly", "ness", "ing", "ed", "ly", "es", "s"):
        if len(w) > len(suf) + 2 and w.endswith(suf):
            return w[: -len(suf)]
    return w


def content_tokens(text: str) -> list[str]:
    return [stem(w) for w in text.split() if w not in STOPWORDS]


@dataclass
class Candidate:
    term: Term
    score: float = 0.0
    reasons: list = field(default_factory=list)       # [{"text", "matched", "kind"}]
    fragments: set = field(default_factory=set)

    def add(self, score, why, matched, kind):
        self.score += score
        if not any(r["text"] == why for r in self.reasons):
            self.reasons.append({"text": why, "matched": matched, "kind": kind})
        if matched:
            self.fragments.add(matched)


def _find_span(original_lower: str, phrase: str):
    """Return the phrase as it appears in the original text (for highlighting)."""
    i = original_lower.find(phrase)
    return phrase if i >= 0 else None


def _window_match(tokens: list[str], cue_tokens: list[str], window: int = 7) -> bool:
    if not cue_tokens:
        return False
    positions = [i for i, t in enumerate(tokens) if t == cue_tokens[0]]
    for start in positions:
        seg = tokens[start:start + window]
        if all(ct in seg for ct in cue_tokens):
            return True
    return False


def explore(text: str, limit: int = 6, lang: str = 'en') -> dict:
    text = (text or "")[:MAX_TEXT]
    norm = normalise(text)
    padded = f" {norm} "
    tokens = content_tokens(norm)
    cands: dict[int, Candidate] = {}

    def cand(term):
        return cands.setdefault(term.pk, Candidate(term))

    # 1) curated phrase cues
    cues = PhraseCue.objects.filter(is_active=True, term__review_status__in=('review', 'approved')).select_related('term', 'term__category')
    for cue in cues:
        phrase = normalise(cue.phrase)
        why = (cue.why_fil if lang == 'fil' and cue.why_fil else cue.why)
        if f" {phrase} " in padded or (len(phrase) > 5 and phrase in norm):
            cand(cue.term).add(cue.weight, why, phrase, "phrase")
            continue
        ctoks = content_tokens(phrase)
        if len(ctoks) >= 2 and _window_match(tokens, ctoks):
            cand(cue.term).add(cue.weight * 0.6, why, None, "loose")

    # 2) direct mentions of a term or alias
    for term in Term.public.select_related('category'):
        names = [term.term.lower()] + [a.lower() for a in (term.aliases or [])]
        names += [p.strip().lower() for p in (term.term_fil or '').replace(')', '(').split('(') if len(p.strip()) > 3]
        for name in names:
            n = normalise(name)
            if n and f" {n} " in padded:
                if term.pk in cands and n in cands[term.pk].fragments:
                    break  # already explained by a curated cue
                cand(term).add(1.2, f'You used the word "{name}".' if lang != 'fil' else f'Ginamit mo ang salitang "{name}".', n, "named")
                break

    # Several independent signals pointing to the same term make it a closer fit.
    for c in cands.values():
        if len(c.fragments) > 1:
            c.score += 0.3 * (len(c.fragments) - 1)

    # 3) relationship expansion (small, explainable)
    if cands:
        top_ids = [c.term.pk for c in sorted(cands.values(), key=lambda c: -c.score)[:4]]
        rels = TermRelationship.objects.filter(
            source_term_id__in=top_ids, relationship_type__in=PROPAGATE.keys(),
        ).select_related('source_term', 'target_term', 'target_term__category')
        for rel in rels:
            src = cands[rel.source_term_id]
            bonus = src.score * PROPAGATE[rel.relationship_type]
            label = rel.get_relationship_type_display().lower()
            c = cand(rel.target_term)
            c.add(bonus, f"Linked to {rel.source_term.term} ({label}): {rel.explanation}", None, "related")

    ranked = sorted((c for c in cands.values() if c.score >= 0.5), key=lambda c: -c.score)[:limit]
    top = ranked[0].score if ranked else 1

    results = []
    for c in ranked:
        t = c.term
        distinctions = TermRelationship.objects.filter(
            source_term=t, relationship_type__in=('different_from', 'often_confused_with'),
        ).select_related('target_term')[:2]
        results.append({
            "slug": t.slug,
            "term": t.term,
            "term_fil": t.term_fil,
            "term_type": t.term_type,
            "category": t.category.name,
            "category_slug": t.category.slug,
            "short_definition": t.short_definition,
            "short_definition_fil": t.short_definition_fil,
            "fit": "closer" if c.score >= top * 0.6 else "possible",
            "reasons": c.reasons[:3],
            "matched": sorted(c.fragments),
            "distinctions": [
                {"slug": d.target_term.slug, "term": d.target_term.term, "term_fil": d.target_term.term_fil,
                 "explanation": d.explanation, "explanation_fil": d.explanation_fil}
                for d in distinctions
            ],
        })

    show_support = any(p in norm or p in text.lower() for p in SUPPORT_PHRASES)
    return {
        "results": results,
        "show_support": show_support,
        "engine": "curated-phrase-v1",
        "stored": False,
    }
