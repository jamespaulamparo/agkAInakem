from django.urls import path
from . import views

app_name = 'support'

urlpatterns = [
    path('', views.reach_out_index, name='reach_out'),
    path('help-someone/', views.help_someone_view, name='help_someone'),
    path('tracker/', views.daily_tracker, name='daily_tracker'),
]
