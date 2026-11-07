from rest_framework import serializers
from .models import Category, Term, TermRelationship


class CategorySerializer(serializers.ModelSerializer):
    term_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ('slug', 'name', 'name_fil', 'description', 'description_fil', 'icon', 'order', 'term_count')


class TermListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name')
    category_fil = serializers.CharField(source='category.name_fil')
    category_slug = serializers.CharField(source='category.slug')
    see_also = serializers.SerializerMethodField()

    class Meta:
        model = Term
        fields = ('slug', 'term', 'term_fil', 'term_type', 'review_status', 'short_definition', 'short_definition_fil',
                  'category', 'category_fil', 'category_slug', 'aliases', 'see_also')

    def get_see_also(self, obj):
        rels = getattr(obj, 'prefetched_out', None)
        if rels is None:
            rels = obj.outgoing_relationships.all()
        return [{'slug': r.target_term.slug, 'term': r.target_term.term, 'term_fil': r.target_term.term_fil, 'type': r.relationship_type} for r in list(rels)[:3]]


class RelationshipSerializer(serializers.Serializer):
    type = serializers.CharField()
    label = serializers.CharField()
    direction = serializers.CharField()
    slug = serializers.CharField()
    term = serializers.CharField()
    term_fil = serializers.CharField(allow_blank=True)
    term_type = serializers.CharField()
    explanation = serializers.CharField()
    explanation_fil = serializers.CharField(allow_blank=True)


class TermDetailSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    examples = serializers.SerializerMethodField()
    reflection_questions = serializers.SerializerMethodField()
    sources = serializers.SerializerMethodField()
    relationships = serializers.SerializerMethodField()

    class Meta:
        model = Term
        fields = ('slug', 'term', 'term_fil', 'aliases', 'term_type', 'review_status', 'reviewed_on',
                  'short_definition', 'short_definition_fil', 'detailed_definition', 'detailed_definition_fil',
                  'in_simpler_terms', 'in_simpler_terms_fil', 'category', 'examples', 'reflection_questions',
                  'sources', 'relationships', 'updated_at')

    def get_category(self, obj):
        c = obj.category
        return {'slug': c.slug, 'name': c.name, 'name_fil': c.name_fil}

    def get_examples(self, obj):
        return [{'text': e.situation, 'text_fil': e.situation_fil} for e in obj.examples.all()]

    def get_reflection_questions(self, obj):
        return [{'text': q.question, 'text_fil': q.question_fil} for q in obj.reflection_questions.all()]

    def get_sources(self, obj):
        return [{'title': s.title, 'citation': s.citation, 'url': s.url, 'clinical': s.is_clinical_reference, 'language': s.language}
                for s in obj.sources.all()]

    def get_relationships(self, obj):
        return relationships_for(obj)


# Relationship types that read the same in both directions; others get an inverse label.
INVERSE_LABELS = {
    'can_contribute_to': 'Can result from',
}


def relationships_for(term):
    out = []
    qs_out = term.outgoing_relationships.filter(
        source_term__review_status__in=('review', 'approved'), target_term__review_status__in=('review', 'approved'),
    ).select_related('target_term')
    for r in qs_out:
        out.append({'type': r.relationship_type, 'label': r.get_relationship_type_display(), 'direction': 'out',
                    'slug': r.target_term.slug, 'term': r.target_term.term, 'term_fil': r.target_term.term_fil, 'term_type': r.target_term.term_type,
                    'explanation': r.explanation, 'explanation_fil': r.explanation_fil})
    qs_in = term.incoming_relationships.filter(
        source_term__review_status__in=('review', 'approved'),
    ).select_related('source_term')
    for r in qs_in:
        out.append({'type': r.relationship_type,
                    'label': INVERSE_LABELS.get(r.relationship_type, r.get_relationship_type_display()),
                    'direction': 'in', 'slug': r.source_term.slug, 'term': r.source_term.term, 'term_fil': r.source_term.term_fil,
                    'term_type': r.source_term.term_type, 'explanation': r.explanation,
                    'explanation_fil': r.explanation_fil})
    return out
