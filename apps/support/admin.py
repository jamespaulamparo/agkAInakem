from django.contrib import admin
from .models import DailyCheckIn, ReferralResource, ResponderProfile, SupportRequest


@admin.register(DailyCheckIn)
class DailyCheckInAdmin(admin.ModelAdmin):
    list_display = ('mood_status', 'primary_feeling', 'created_at')
    list_filter = ('mood_status', 'created_at')
    readonly_fields = ('mood_status', 'primary_feeling', 'created_at')


@admin.register(ReferralResource)
class ReferralResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'kind', 'is_24_7', 'verified_on', 'order', 'is_active')
    list_filter = ('kind', 'is_active')
    list_editable = ('order', 'is_active')


@admin.register(ResponderProfile)
class ResponderProfileAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'organization', 'support_type', 'verification_status', 'is_demo', 'is_active')
    list_filter = ('support_type', 'verification_status', 'is_demo', 'is_active')
    search_fields = ('display_name', 'organization', 'role')


@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = ('responder', 'preferred_contact', 'status', 'created_at')
    list_filter = ('status', 'responder')
    readonly_fields = ('responder', 'first_name', 'preferred_contact', 'contact_detail', 'message', 'created_at')
