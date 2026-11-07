from django.db import models

class DailyCheckIn(models.Model):
    """Privacy-preserving self-reported daily emotional pulse."""
    MOOD_CHOICES = [
        ('green', 'Grounded / Calm (Mabuti at Payapa)'),
        ('yellow', 'Stretched / Burdened (Nahihirapan / Pagod)'),
        ('red', 'Overwhelmed / Distressed (Sobrang Bigat / Kailangan ng Kausap)'),
    ]

    mood_status = models.CharField(max_length=20, choices=MOOD_CHOICES)
    primary_feeling = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True, help_text="Optional private note (never shared)")
    created_at = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=100, blank=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Check-in [{self.mood_status}] at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
