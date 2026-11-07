from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    """Broad mental health vocabulary categories."""
    name = models.CharField(max_length=100, unique=True)
    name_fil = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    description_fil = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='bookmark')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


PUBLIC_REVIEW_STATUSES = ('review', 'approved')


class PublicTermManager(models.Manager):
    """Terms visible on the website and extension (drafts stay in the admin)."""
    def get_queryset(self):
        return super().get_queryset().filter(review_status__in=PUBLIC_REVIEW_STATUSES)


class Term(models.Model):
    """Core mental health dictionary entry."""
    TERM_TYPES = [
        ('everyday', 'Everyday Expression'),
        ('psychological', 'Psychological Concept'),
        ('clinical', 'Clinical Terminology'),
    ]

    REVIEW_STATUSES = [
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
    ]

    term = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True)
    term_fil = models.CharField(max_length=150, blank=True, help_text="Filipino equivalent or contextual term")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='terms')
    
    # Plain & Detailed Definitions (Bilingual)
    short_definition = models.TextField(help_text="Concise plain-language definition (English)")
    short_definition_fil = models.TextField(blank=True, help_text="Maikling kahulugan (Filipino)")
    detailed_definition = models.TextField(blank=True, help_text="Comprehensive psychological explanation (English)")
    detailed_definition_fil = models.TextField(blank=True, help_text="Detalyadong paliwanag (Filipino)")
    in_simpler_terms = models.TextField(blank=True, help_text="Everyday relatable translation (English)")
    in_simpler_terms_fil = models.TextField(blank=True, help_text="Mas simpleng paliwanag (Filipino)")

    aliases = models.JSONField(
        default=list, blank=True,
        help_text="Alternative names and inflections used for lookup, e.g. [\"overwhelmed\", \"overwhelming\"]",
    )

    term_type = models.CharField(max_length=30, choices=TERM_TYPES, default='psychological')
    # Content written by the project team stays 'review' until a qualified reviewer approves it.
    review_status = models.CharField(max_length=20, choices=REVIEW_STATUSES, default='draft')
    reviewed_by = models.CharField(max_length=150, blank=True)
    reviewed_on = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    public = PublicTermManager()

    class Meta:
        ordering = ['term']

    def __str__(self):
        return self.term

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.term)
        super().save(*args, **kwargs)


class TermRelationship(models.Model):
    """Explicit, curated psychological relationships between terms."""
    RELATIONSHIP_TYPES = [
        ('similar_to', 'Similar to'),
        ('related_to', 'Related to'),
        ('often_associated_with', 'Often associated with'),
        ('different_from', 'Different from'),
        ('can_contribute_to', 'Can contribute to'),
        ('opposite_of', 'Contrasting concept'),
        ('often_confused_with', 'Often confused with'),
    ]

    source_term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='outgoing_relationships')
    target_term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='incoming_relationships')
    relationship_type = models.CharField(max_length=40, choices=RELATIONSHIP_TYPES)
    
    explanation = models.TextField(help_text="Explains precisely why and how they differ or connect (English)")
    explanation_fil = models.TextField(blank=True, help_text="Paliwanag kung bakit magkaiba o magkaugnay (Filipino)")
    editorial_review_status = models.CharField(max_length=20, choices=Term.REVIEW_STATUSES, default='draft')

    class Meta:
        unique_together = ('source_term', 'target_term', 'relationship_type')

    def __str__(self):
        return f"{self.source_term.term} -> [{self.get_relationship_type_display()}] -> {self.target_term.term}"


class TermExample(models.Model):
    """Everyday contextual scenario illustrating the experience."""
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='examples')
    situation = models.TextField(help_text="Realistic scenario in everyday life (English)")
    situation_fil = models.TextField(blank=True, help_text="Halimbawang sitwasyon sa pang-araw-araw (Filipino)")

    def __str__(self):
        return f"Example for {self.term.term}: {self.situation[:40]}..."


class ReflectionQuestion(models.Model):
    """Self-reflection questions to prompt mindful self-awareness."""
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='reflection_questions')
    question = models.TextField(help_text="Reflection question (English)")
    question_fil = models.TextField(blank=True, help_text="Tanong para sa sariling pagninilay (Filipino)")

    def __str__(self):
        return f"Reflection for {self.term.term}: {self.question[:40]}..."


class SourceReference(models.Model):
    """Credible clinical or scientific reference supporting definition."""
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='sources')
    title = models.CharField(max_length=255)
    citation = models.CharField(max_length=255, help_text="e.g. APA Dictionary of Psychology / WHO ICD-11")
    url = models.URLField(blank=True)
    is_clinical_reference = models.BooleanField(default=False)
    language = models.CharField(max_length=3, choices=[('en', 'English'), ('fil', 'Filipino')], default='en',
                                help_text='Filipino references are listed first in the Filipino version of the site.')

    def __str__(self):
        return f"{self.title} ({self.citation})"
