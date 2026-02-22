from django.urls import path
from .views import UserRegistrationView, UserLoginView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('register', UserRegistrationView.as_view(), name='register-no-slash'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('login', UserLoginView.as_view(), name='login-no-slash'),
]
