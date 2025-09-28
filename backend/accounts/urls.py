from django.urls import path
from .views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import MyTokenObtainPairView

urlpatterns = [
    # Register new user
    path('', CreateUserView.as_view(), name='register'),

    # JWT token obtain (username + password)
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),


    # Refresh JWT token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
