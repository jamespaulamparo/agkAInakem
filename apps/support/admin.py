from django.contrib import admin
from .models import DailyCheckIn, ReferralResource


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
