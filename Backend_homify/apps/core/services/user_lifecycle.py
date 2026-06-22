"""
User account lifecycle (soft delete, status sync).
"""
from apps.core.exceptions import BusinessLogicError


class UserLifecycleService:
    """User status transitions including soft delete."""

    @classmethod
    def soft_delete(cls, user):
        """Mark user as DELETED without removing the database record."""
        if user.role == 'ADMIN':
            raise BusinessLogicError(
                'Un administrateur ne peut pas être supprimé via cette action.',
                code='admin_delete_forbidden',
            )
        user.status = 'DELETED'
        user.is_active = False
        user.save(update_fields=['status', 'is_active', 'updated_at'])
        return user

    @classmethod
    def suspend(cls, user):
        user.status = 'SUSPENDED'
        user.is_active = False
        user.save(update_fields=['status', 'is_active', 'updated_at'])
        return user

    @classmethod
    def activate(cls, user):
        if user.status == 'DELETED':
            raise BusinessLogicError(
                'Un compte supprimé ne peut pas être réactivé.',
                code='deleted_user',
            )
        user.status = 'ACTIVE'
        user.is_active = True
        user.save(update_fields=['status', 'is_active', 'updated_at'])
        return user
