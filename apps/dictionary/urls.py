from django.urls import path
from . import views

app_name = 'dictionary'

urlpatterns = [
    path('', views.dictionary_index, name='index'),
    path('<slug:slug>/', views.term_detail, name='detail'),
]
