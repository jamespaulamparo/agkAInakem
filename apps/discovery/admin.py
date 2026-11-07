from django.contrib import admin
from .models import PhraseCue


@admin.register(PhraseCue)
class PhraseCueAdmin(admin.ModelAdmin):
    list_display = ('phrase', 'term', 'language', 'weight', 'is_active')
    list_filter = ('language', 'is_active', 'term__category')
    search_fields = ('phrase', 'term__term', 'why')
    autocomplete_fields = ('term',)
