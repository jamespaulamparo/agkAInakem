"""Shared REST API used by the React website and the browser extension."""
from django.urls import path

from apps.dictionary import api as dictionary
from apps.discovery import api as discovery
from apps.support import api as support
from apps.accounts import api as accounts
from apps.journal import api as journal

urlpatterns = [
    path('dictionary/categories/', dictionary.categories),
    path('dictionary/search/', dictionary.search),
    path('dictionary/graph/', dictionary.graph),
    path('dictionary/lookup/', dictionary.lookup),
    path('dictionary/index/', dictionary.lookup_index),
    path('dictionary/terms/<slug:slug>/', dictionary.term_detail),
    path('dictionary/terms/<slug:slug>/related/', dictionary.term_related),
    path('discovery/explore/', discovery.explore),
    path('support/resources/', support.resources),
    path('support/responders/', support.responders),
    path('support/requests/', support.create_request),
    path('check-ins/', support.check_in),
    path('auth/me/', accounts.me),
    path('auth/register/', accounts.register),
    path('auth/login/', accounts.login_view),
    path('auth/logout/', accounts.logout_view),
    path('auth/export/', accounts.export),
    path('auth/delete/', accounts.delete_account),
    path('journal/entries/', journal.entries),
    path('journal/entries/<str:date>/', journal.entry),
    path('journal/import/', journal.import_entries),
]
