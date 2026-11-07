from django.conf import settings
from django.db import models


class JournalEntry(models.Model):
    """
    One private check-in per person per day. Only the owner can read it through the API;
    it is not shown to organisations. Colours are self-descriptions, not severity levels.
    """
    MOODS = [('green', 'Doing okay'), ('yellow', 'Stretched'), ('red', 'Struggling')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='journal_entries')
    date = models.DateField()
    mood = models.CharField(max_length=10, choices=MOODS)
    feelings = models.JSONField(default=list, blank=True, help_text='Dictionary slugs, e.g. ["anxiety"]')
    note = models.TextField(max_length=2000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('user', 'date')
        verbose_name_plural = 'journal entries'

    def __str__(self):
        return f'{self.user_id} · {self.date} · {self.mood}'
