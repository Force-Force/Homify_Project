"""
Authentication and token management service.
"""
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed

from apps.core.exceptions import BusinessLogicError
from apps.users.models import AuthToken, User


class AuthService:
    """JWT lifecycle, email verification, and password reset."""

    EMAIL_VERIFY_HOURS = 24
    PASSWORD_RESET_HOURS = 1

    @classmethod
    def ensure_user_can_authenticate(cls, user):
        """Called on every authenticated request."""
        if user.status == 'DELETED':
            raise AuthenticationFailed('Ce compte a été supprimé.', code='account_deleted')
        if user.status == 'SUSPENDED' or not user.is_active:
            raise AuthenticationFailed('Compte suspendu ou inactif.', code='account_suspended')
        if user.role != 'ADMIN' and not user.email_verified:
            raise AuthenticationFailed(
                'Email non vérifié. Consultez votre boîte mail.',
                code='email_not_verified',
            )

    @classmethod
    def ensure_user_can_login(cls, user):
        """Stricter checks at login time."""
        cls.ensure_user_can_authenticate(user)
        if user.role == 'VISITOR' and user.pending_role:
            raise AuthenticationFailed(
                'Email non vérifié. Consultez votre boîte mail.',
                code='email_not_verified',
            )

    @classmethod
    def record_login(cls, user):
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])

    @classmethod
    def revoke_all_tokens(cls, user):
        """Blacklist all outstanding refresh tokens for a user."""
        try:
            from rest_framework_simplejwt.token_blacklist.models import (
                BlacklistedToken,
                OutstandingToken,
            )
        except ImportError:
            return

        for outstanding in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=outstanding)

    @classmethod
    def blacklist_refresh_token(cls, refresh_token_str):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken(refresh_token_str)
        token.blacklist()

    @classmethod
    def setup_post_registration(cls, user, intended_role):
        """VISITOR until email verified; intended role stored in pending_role."""
        user.role = 'VISITOR'
        user.pending_role = intended_role
        user.email_verified = False
        user.save(update_fields=['role', 'pending_role', 'email_verified', 'updated_at'])
        cls.send_verification_email(user)

    @classmethod
    def _create_token(cls, user, token_type, hours):
        AuthToken.objects.filter(user=user, token_type=token_type, used_at__isnull=True).update(
            used_at=timezone.now()
        )
        return AuthToken.objects.create(
            user=user,
            token=AuthToken.generate_token(),
            token_type=token_type,
            expires_at=timezone.now() + timedelta(hours=hours),
        )

    @classmethod
    def send_verification_email(cls, user):
        from apps.core.tasks import send_verification_email_task
        token = cls._create_token(user, 'EMAIL_VERIFY', cls.EMAIL_VERIFY_HOURS)
        send_verification_email_task.delay(user.id, token.token)

    @classmethod
    def verify_email(cls, token_str):
        try:
            token = AuthToken.objects.select_related('user').get(
                token=token_str,
                token_type='EMAIL_VERIFY',
            )
        except AuthToken.DoesNotExist:
            raise BusinessLogicError('Lien de vérification invalide.', code='invalid_token')

        if not token.is_valid:
            raise BusinessLogicError(
                'Lien expiré ou déjà utilisé.',
                code='token_expired',
            )

        user = token.user
        user.email_verified = True
        if user.pending_role in ('TENANT', 'LANDLORD'):
            user.role = user.pending_role
            user.pending_role = ''
        elif user.role == 'VISITOR':
            user.role = 'TENANT'
        user.save(update_fields=['email_verified', 'role', 'pending_role', 'updated_at'])
        token.mark_used()
        return user

    @classmethod
    def resend_verification(cls, email):
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return None

        if user.email_verified:
            raise BusinessLogicError('Email déjà vérifié.', code='already_verified')
        if user.status != 'ACTIVE':
            raise BusinessLogicError('Compte inactif.', code='account_inactive')

        cls.send_verification_email(user)
        return user

    @classmethod
    def request_password_reset(cls, email):
        try:
            user = User.objects.get(email__iexact=email, status='ACTIVE')
        except User.DoesNotExist:
            return None

        from apps.core.tasks import send_password_reset_email_task
        token = cls._create_token(user, 'PASSWORD_RESET', cls.PASSWORD_RESET_HOURS)
        send_password_reset_email_task.delay(user.id, token.token)
        return user

    @classmethod
    def reset_password(cls, token_str, new_password):
        try:
            token = AuthToken.objects.select_related('user').get(
                token=token_str,
                token_type='PASSWORD_RESET',
            )
        except AuthToken.DoesNotExist:
            raise BusinessLogicError('Lien de réinitialisation invalide.', code='invalid_token')

        if not token.is_valid:
            raise BusinessLogicError(
                'Lien expiré ou déjà utilisé.',
                code='token_expired',
            )

        try:
            validate_password(new_password, user=token.user)
        except DjangoValidationError as exc:
            raise BusinessLogicError(
                ' '.join(exc.messages),
                code='weak_password',
            ) from exc

        user = token.user
        user.set_password(new_password)
        user.save(update_fields=['password'])
        token.mark_used()
        cls.revoke_all_tokens(user)
        return user

    @classmethod
    def delete_own_account(cls, user, password):
        if not user.check_password(password):
            raise BusinessLogicError('Mot de passe incorrect.', code='wrong_password')
        from apps.core.services import UserLifecycleService
        UserLifecycleService.soft_delete(user)
        cls.revoke_all_tokens(user)

    @classmethod
    def sync_status_fields(cls, user, new_status):
        """Keep status and is_active in sync."""
        user.status = new_status
        user.sync_active_flag()
        return user
