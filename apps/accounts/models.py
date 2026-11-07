from django.conf import settings
from django.db import models


class Consent(models.Model):
    """
    Record of consent given at registration (RA 10173, Data Privacy Act of 2012).
    Journal entries are sensitive personal information (health), so processing them
    requires the person's explicit consent. Withdrawing consent = deleting the account.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='consents')
    notice_version = models.CharField(max_length=20)
    sensitive_data = models.BooleanField(help_text='Agreed to processing of journal entries (health information)')
    age_confirmed = models.BooleanField(help_text='18 or older, or has a parent/guardian’s permission')
    given_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-given_at']


class ResearchConsent(models.Model):
    """
    Separate, optional consent to include this person's journal in anonymous, aggregate research
    statistics (counts only, never individual entries or notes). Deleting it withdraws consent.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='research_consent')
    notice_version = models.CharField(max_length=20)
    given_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Research consent: user {self.user_id} ({self.given_at:%Y-%m-%d})'
