"""
URL configuration for users app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, UserProfileView, PasswordChangeView,
    CustomTokenObtainPairView, AdminUserViewSet
)

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # User profile
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('me/password/', PasswordChangeView.as_view(), name='password-change'),

    # Admin routes
    path('', include(router.urls)),
]
