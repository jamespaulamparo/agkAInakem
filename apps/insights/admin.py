from django.contrib import admin
from .models import UsageCount


@admin.register(UsageCount)
class UsageCountAdmin(admin.ModelAdmin):
    list_display = ('day', 'event', 'label', 'count', 'is_demo')
    list_filter = ('event', 'is_demo')
    date_hierarchy = 'day'
    readonly_fields = ('day', 'event', 'label', 'count', 'is_demo')

    def has_add_permission(self, request):
        return False
