from django.urls import path
from .views import TrainListCreateView, TrainSearchView

urlpatterns = [
    path('', TrainListCreateView.as_view(), name='train-list-create'),
    path('search/', TrainSearchView.as_view(), name='train-search'),
    path('search', TrainSearchView.as_view(), name='train-search-no-slash'),
]
