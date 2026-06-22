"""Custom JWT authentication with account status checks."""
from rest_framework_simplejwt.authentication import JWTAuthentication

from apps.core.services.auth import AuthService


class HomifyJWTAuthentication(JWTAuthentication):
    """Reject suspended, deleted, or unverified users on every request."""

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        AuthService.ensure_user_can_authenticate(user)
        return user
