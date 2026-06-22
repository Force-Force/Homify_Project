"""
URL configuration for users app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, UserProfileView, PasswordChangeView,
    CustomTokenObtainPairView, AdminUserViewSet, LogoutView,
    EmailVerifyView, ResendVerificationView, ForgotPasswordView,
    ResetPasswordView, AccountDeleteView, CustomTokenRefreshView,
)

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('verify-email/', EmailVerifyView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # User profile
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('me/password/', PasswordChangeView.as_view(), name='password-change'),
    path('me/delete/', AccountDeleteView.as_view(), name='account-delete'),

    # Admin routes
    path('', include(router.urls)),
]
