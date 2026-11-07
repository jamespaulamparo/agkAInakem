from django.contrib import admin
from .models import UsageCount


@admin.register(UsageCount)
class UsageCountAdmin(admin.ModelAdmin):
    list_display = ('day', 'event', 'label', 'count')
    list_filter = ('event',)
    date_hierarchy = 'day'
    readonly_fields = ('day', 'event', 'label', 'count')

    def has_add_permission(self, request):
        return False
