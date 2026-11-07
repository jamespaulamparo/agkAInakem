from django.db import models


class DailyCheckIn(models.Model):
    """
    Optional, anonymous self-reported check-in.

    Only the colour and an optional feeling word are stored. No free-text notes,
    no account, no session linkage. Colours are self-descriptions, not severity levels.
    """
    MOOD_CHOICES = [
        ('green', 'Doing okay'),
        ('yellow', 'Stretched'),
        ('red', 'Struggling'),
    ]

    mood_status = models.CharField(max_length=20, choices=MOOD_CHOICES)
    primary_feeling = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Check-in [{self.mood_status}] {self.created_at:%Y-%m-%d}"


class ReferralResource(models.Model):
    """Emergency, crisis-line and professional referral information shown on Reach Out."""
    KIND_CHOICES = [
        ('emergency', 'Emergency service'),
        ('crisis_line', 'Crisis line'),
        ('hospital', 'Hospital / clinic'),
        ('government', 'Government office'),
    ]

    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=60, blank=True)
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    description = models.TextField(blank=True)
    description_fil = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    phones = models.JSONField(default=list, help_text='[{"label": "Hotline", "number": "1553"}]')
    hours = models.CharField(max_length=120, blank=True)
    is_24_7 = models.BooleanField(default=False)
    source_url = models.URLField(blank=True)
    verified_on = models.DateField(null=True, blank=True, help_text="Leave empty until someone has confirmed the numbers")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name
