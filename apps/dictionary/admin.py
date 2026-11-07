from django.contrib import admin
from .models import Category, Term, TermRelationship, TermExample, ReflectionQuestion, SourceReference

class TermRelationshipInline(admin.TabularInline):
    model = TermRelationship
    fk_name = 'source_term'
    extra = 1

class TermExampleInline(admin.TabularInline):
    model = TermExample
    extra = 1

class ReflectionQuestionInline(admin.TabularInline):
    model = ReflectionQuestion
    extra = 1

class SourceReferenceInline(admin.TabularInline):
    model = SourceReference
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_fil', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'name_fil')

@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ('term', 'term_fil', 'category', 'term_type', 'review_status', 'updated_at')
    list_filter = ('category', 'term_type', 'review_status')
    search_fields = ('term', 'term_fil', 'short_definition', 'detailed_definition')
    prepopulated_fields = {'slug': ('term',)}
    inlines = [TermRelationshipInline, TermExampleInline, ReflectionQuestionInline, SourceReferenceInline]

@admin.register(TermRelationship)
class TermRelationshipAdmin(admin.ModelAdmin):
    list_display = ('source_term', 'relationship_type', 'target_term', 'editorial_review_status')
    list_filter = ('relationship_type', 'editorial_review_status')
    search_fields = ('source_term__term', 'target_term__term', 'explanation')
