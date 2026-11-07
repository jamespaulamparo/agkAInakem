from django.contrib import admin
from .models import DailyCheckIn

@admin.register(DailyCheckIn)
class DailyCheckInAdmin(admin.ModelAdmin):
    list_display = ('mood_status', 'primary_feeling', 'created_at')
    list_filter = ('mood_status', 'created_at')
    readonly_fields = ('created_at',)
