"""URL configuration: Django admin, the shared REST API, and the React app for everything else."""
from django.contrib import admin
from django.urls import include, path, re_path

from . import views

admin.site.site_header = 'agkAInakem editorial admin'
admin.site.site_title = 'agkAInakem admin'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('config.api_urls')),
    path('sw.js', views.service_worker),
    re_path(r'^(?!api/|admin/|static/).*$', views.spa, name='spa'),
]
