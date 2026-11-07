"""
Main URL Configuration for Words For It.
"""

from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Pages
    path('', views.home_view, name='home'),
    path('about/', views.about_view, name='about'),

    # Modular apps
    path('dictionary/', include('apps.dictionary.urls', namespace='dictionary')),
    path('explore/', include('apps.discovery.urls', namespace='discovery')),
    path('reach-out/', include('apps.support.urls', namespace='support')),

    # Shared REST API
    path('api/', include('config.api_urls')),
]
