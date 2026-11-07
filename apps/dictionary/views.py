from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from .models import Category, Term, TermRelationship

def dictionary_index(request):
    """Browsing and search hub for the specialized mental health dictionary."""
    categories = Category.objects.all()
    selected_cat_slug = request.GET.get('category', '').strip()
    query = request.GET.get('q', '').strip()
    term_type = request.GET.get('type', '').strip()

    terms = Term.objects.filter(review_status='approved').select_related('category')

    if selected_cat_slug:
        terms = terms.filter(category__slug=selected_cat_slug)

    if term_type in ['everyday', 'psychological', 'clinical']:
        terms = terms.filter(term_type=term_type)

    if query:
        terms = terms.filter(
            Q(term__icontains=query) |
            Q(term_fil__icontains=query) |
            Q(short_definition__icontains=query) |
            Q(short_definition_fil__icontains=query) |
            Q(detailed_definition__icontains=query)
        )

    context = {
        'page_title': 'Specialized Mental Health Dictionary | agkAInakem',
        'categories': categories,
        'terms': terms,
        'selected_cat_slug': selected_cat_slug,
        'query': query,
        'term_type': term_type,
        'total_count': terms.count(),
    }
    return render(request, 'dictionary/index.html', context)


def term_detail(request, slug):
    """Detailed view of a curated mental health term, including distinctions and relationships."""
    term = get_object_or_404(Term.objects.select_related('category'), slug=slug)

    # Fetch outgoing and incoming explicit relationships
    outgoing_rels = term.outgoing_relationships.filter(
        editorial_review_status='approved'
    ).select_related('target_term', 'target_term__category')

    incoming_rels = term.incoming_relationships.filter(
        editorial_review_status='approved'
    ).select_related('source_term', 'source_term__category')

    examples = term.examples.all()
    questions = term.reflection_questions.all()
    sources = term.sources.all()

    context = {
        'page_title': f"{term.term} — Meaning & Distinctions | agkAInakem",
        'term': term,
        'outgoing_rels': outgoing_rels,
        'incoming_rels': incoming_rels,
        'examples': examples,
        'questions': questions,
        'sources': sources,
    }
    return render(request, 'dictionary/detail.html', context)
