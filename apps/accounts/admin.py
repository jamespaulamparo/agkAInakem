from django.contrib import admin
from .models import Consent


@admin.register(Consent)
class ConsentAdmin(admin.ModelAdmin):
    list_display = ('user', 'notice_version', 'sensitive_data', 'age_confirmed', 'given_at')
    readonly_fields = ('user', 'notice_version', 'sensitive_data', 'age_confirmed', 'given_at')


from .models import ResearchConsent  # noqa: E402


@admin.register(ResearchConsent)
class ResearchConsentAdmin(admin.ModelAdmin):
    list_display = ('user', 'notice_version', 'given_at')
    readonly_fields = ('user', 'notice_version', 'given_at')
