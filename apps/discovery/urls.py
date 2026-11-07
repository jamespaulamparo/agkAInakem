from django.urls import path
from . import views

app_name = 'discovery'

urlpatterns = [
    path('', views.explore_view, name='explore'),
]
