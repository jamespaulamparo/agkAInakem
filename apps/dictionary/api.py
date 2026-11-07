from django.db.models import Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.discovery.engine import explore, normalise
from .models import Category, Term, TermRelationship, PUBLIC_REVIEW_STATUSES
from .serializers import CategorySerializer, TermListSerializer, TermDetailSerializer, relationships_for


def _public_terms():
    out_rels = TermRelationship.objects.filter(
        target_term__review_status__in=PUBLIC_REVIEW_STATUSES).select_related('target_term')
    return Term.public.select_related('category').prefetch_related(
        Prefetch('outgoing_relationships', queryset=out_rels, to_attr='prefetched_out'))


@api_view(['GET'])
def categories(request):
    qs = Category.objects.annotate(
        term_count=Count('terms', filter=Q(terms__review_status__in=PUBLIC_REVIEW_STATUSES)))
    return Response(CategorySerializer(qs, many=True).data)


@api_view(['GET'])
def search(request):
    """
    GET /api/dictionary/search/?q=&category=&type=&letter=
    Ranked: exact name/alias > prefix > contains in name > contains in definition.
    """
    q = request.GET.get('q', '').strip()
    category = request.GET.get('category', '').strip()
    term_type = request.GET.get('type', '').strip()
    letter = request.GET.get('letter', '').strip().upper()[:1]

    qs = _public_terms()
    if category:
        qs = qs.filter(category__slug=category)
    if term_type in ('everyday', 'psychological', 'clinical'):
        qs = qs.filter(term_type=term_type)
    if letter.isalpha():
        qs = qs.filter(term__istartswith=letter)

    terms = list(qs)
    if q:
        nq = normalise(q)

        def rank(t):
            names = [t.term.lower()] + [a.lower() for a in t.aliases or []] + [t.term_fil.lower()]
            if nq in names:
                return 0
            if any(n.startswith(nq) for n in names):
                return 1
            if any(nq in n for n in names):
                return 2
            hay = f"{t.short_definition} {t.short_definition_fil} {t.detailed_definition} {t.in_simpler_terms}".lower()
            if nq in hay:
                return 3
            return 9
        scored = sorted(((rank(t), t.term, t) for t in terms), key=lambda x: (x[0], x[1]))
        terms = [t for r, _, t in scored if r < 9]

    return Response({'count': len(terms), 'query': q, 'results': TermListSerializer(terms, many=True).data})


@api_view(['GET'])
def term_detail(request, slug):
    term = get_object_or_404(Term.public.select_related('category'), slug=slug)
    return Response(TermDetailSerializer(term).data)


@api_view(['GET'])
def term_related(request, slug):
    """Ego graph for one term: the term, its direct neighbours, and edges among them."""
    term = get_object_or_404(Term.public, slug=slug)
    rels = relationships_for(term)
    slugs = {term.slug} | {r['slug'] for r in rels}
    nodes = {t.slug: t for t in Term.public.filter(slug__in=slugs).select_related('category')}
    edges = TermRelationship.objects.filter(source_term__slug__in=slugs, target_term__slug__in=slugs).select_related(
        'source_term', 'target_term')
    return Response({
        'center': term.slug,
        'nodes': [_node(t) for t in nodes.values()],
        'edges': [_edge(e) for e in edges],
        'relationships': rels,
    })


@api_view(['GET'])
def graph(request):
    """Every public term and curated relationship (used for the vocabulary map)."""
    terms = Term.public.select_related('category')
    edges = TermRelationship.objects.filter(
        source_term__review_status__in=PUBLIC_REVIEW_STATUSES,
        target_term__review_status__in=PUBLIC_REVIEW_STATUSES).select_related('source_term', 'target_term')
    return Response({'nodes': [_node(t) for t in terms], 'edges': [_edge(e) for e in edges]})


@api_view(['GET'])
@throttle_classes([ScopedRateThrottle])
def lookup(request):
    """
    GET /api/dictionary/lookup/?q=overwhelmed
    Used by the browser extension: best single match for a selection, plus
    phrase-based suggestions when the selection is not a dictionary word.
    """
    q = request.GET.get('q', '').strip()[:300]
    slug = request.GET.get('slug', '').strip()
    if slug:
        q = q or slug
    if not q:
        return Response({'match': None, 'suggestions': []})
    nq = normalise(q)
    match = Term.public.select_related('category').filter(slug=slug).first() if slug else None
    for t in ([] if match else Term.public.select_related('category')):
        names = [normalise(t.term)] + [normalise(a) for a in t.aliases or []]
        if nq in names or nq.rstrip('s') in names:
            match = t
            break
    data = {'query': q, 'match': None, 'suggestions': []}
    if match:
        detail = TermDetailSerializer(match).data
        data['match'] = {k: detail[k] for k in (
            'slug', 'term', 'term_fil', 'term_type', 'short_definition', 'short_definition_fil',
            'in_simpler_terms', 'category', 'review_status')}
        data['match']['related'] = [
            {'slug': r['slug'], 'term': r['term'], 'term_fil': r['term_fil'], 'label': r['label'], 'explanation': r['explanation'], 'explanation_fil': r['explanation_fil']}
            for r in detail['relationships']][:5]
    else:
        data['suggestions'] = explore(q, limit=4)['results']
    return Response(data)


lookup.cls.throttle_scope = 'lookup'


def _names(t):
    names = {normalise(t.term)} | {normalise(a) for a in (t.aliases or [])}
    if t.term_fil:
        # "Burnout (Sobra-sobrang Pagkaubos)" -> "burnout", "sobra-sobrang pagkaubos"
        for part in t.term_fil.replace(')', '(').split('('):
            part = normalise(part)
            if part and len(part) > 2:
                names.add(part)
    return sorted(n for n in names if n)


@api_view(['GET'])
def lookup_index(request):
    """
    GET /api/dictionary/index/
    Compact list of every public term and the names it can be found by. The extension
    downloads this once and matches hovered text locally, so hovered words never leave
    the browser unless they are dictionary words.
    """
    terms = Term.public.only('slug', 'term', 'term_fil', 'aliases')
    resp = Response({'version': Term.public.order_by('-updated_at').values_list('updated_at', flat=True).first(),
                     'terms': [{'slug': t.slug, 'term': t.term, 'names': _names(t)} for t in terms]})
    resp['Cache-Control'] = 'public, max-age=3600'
    return resp


def _node(t):
    return {'id': t.slug, 'term': t.term, 'term_fil': t.term_fil, 'type': t.term_type,
            'category': t.category.slug, 'short': t.short_definition}


def _edge(e):
    return {'source': e.source_term.slug, 'target': e.target_term.slug, 'type': e.relationship_type,
            'label': e.get_relationship_type_display()}
