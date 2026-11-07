from django.db import models


class PhraseCue(models.Model):
    """
    Curated mapping from an everyday expression to a dictionary term.

    The discovery engine matches user-submitted text against these cues. Each cue
    carries a human-written explanation of *why* the term might be relevant, so the
    interface never has to invent one. Cues are editorial content, not a classifier.
    """
    LANG_CHOICES = [('en', 'English'), ('fil', 'Filipino')]

    term = models.ForeignKey('dictionary.Term', on_delete=models.CASCADE, related_name='phrase_cues')
    phrase = models.CharField(max_length=200, help_text="Lower-case expression, e.g. 'too much'")
    language = models.CharField(max_length=5, choices=LANG_CHOICES, default='en')
    weight = models.FloatField(default=1.0, help_text="Relative strength of this cue (0.2 – 2.0)")
    why = models.TextField(help_text="Why this expression might point to the term (English)")
    why_fil = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['term__term', 'phrase']
        unique_together = ('term', 'phrase')

    def __str__(self):
        return f'"{self.phrase}" → {self.term.term}'
