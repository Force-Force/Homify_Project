"""
User account lifecycle (soft delete, status sync).
"""
from apps.core.exceptions import BusinessLogicError
from apps.core.services.auth import AuthService


class UserLifecycleService:
    """User status transitions including soft delete."""

    @classmethod
    def soft_delete(cls, user):
        if user.role == 'ADMIN':
            raise BusinessLogicError(
                'Un administrateur ne peut pas être supprimé via cette action.',
                code='admin_delete_forbidden',
            )
        AuthService.sync_status_fields(user, 'DELETED')
        user.save(update_fields=['status', 'is_active', 'updated_at'])
        AuthService.revoke_all_tokens(user)
        return user

    @classmethod
    def suspend(cls, user):
        AuthService.sync_status_fields(user, 'SUSPENDED')
        user.save(update_fields=['status', 'is_active', 'updated_at'])
        AuthService.revoke_all_tokens(user)
        return user

    @classmethod
    def activate(cls, user):
        if user.status == 'DELETED':
            raise BusinessLogicError(
                'Un compte supprimé ne peut pas être réactivé.',
                code='deleted_user',
            )
        AuthService.sync_status_fields(user, 'ACTIVE')
        user.save(update_fields=['status', 'is_active', 'updated_at'])
        return user
