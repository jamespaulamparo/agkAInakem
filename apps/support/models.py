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


class ResponderProfile(models.Model):
    """A person who has agreed to receive support requests, with a transparent role."""
    SUPPORT_TYPES = [
        ('peer', 'Peer supporter'),
        ('volunteer', 'Trained volunteer'),
        ('responder', 'Trained responder'),
        ('counselor', 'Guidance counselor'),
        ('professional', 'Mental health professional'),
    ]
    VERIFICATION = [
        ('unverified', 'Not yet verified'),
        ('verified', 'Verified'),
    ]

    display_name = models.CharField(max_length=120)
    organization = models.CharField(max_length=200)
    role = models.CharField(max_length=150)
    support_type = models.CharField(max_length=20, choices=SUPPORT_TYPES)
    scope = models.TextField(help_text="What this person can and cannot help with")
    availability = models.CharField(max_length=200)
    contact_methods = models.JSONField(default=list, help_text='["In person", "Chat request"]')
    phone = models.CharField(max_length=30, blank=True, help_text="Only if this person agreed to be called/texted directly")
    expected_response = models.CharField(max_length=120, help_text='e.g. "Within 1 school day"')
    verification_status = models.CharField(max_length=20, choices=VERIFICATION, default='unverified')
    verified_on = models.DateField(null=True, blank=True)
    is_demo = models.BooleanField(default=True, help_text="Synthetic profile used for demonstrations")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'display_name']

    def __str__(self):
        return f"{self.display_name} ({self.get_support_type_display()})"


class SupportRequest(models.Model):
    """A user-initiated request to be contacted by a responder."""
    STATUS = [('new', 'New'), ('seen', 'Seen'), ('closed', 'Closed')]
    CONTACT_PREFS = [('in_person', 'In person'), ('message', 'Message'), ('call', 'Phone call')]

    responder = models.ForeignKey(ResponderProfile, on_delete=models.PROTECT, related_name='requests')
    first_name = models.CharField(max_length=60, blank=True, help_text="Optional — can be a nickname")
    preferred_contact = models.CharField(max_length=20, choices=CONTACT_PREFS)
    contact_detail = models.CharField(max_length=150, blank=True)
    message = models.TextField(max_length=1000, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Request to {self.responder.display_name} ({self.status})"
