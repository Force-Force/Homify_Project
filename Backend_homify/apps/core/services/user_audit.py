"""Admin audit logging for user management."""
from apps.users.models import UserAuditLog


class UserAuditService:
    @staticmethod
    def log(actor, target, action, details=None):
        if actor is None or actor.role != 'ADMIN':
            return
        UserAuditLog.objects.create(
            actor=actor,
            target=target,
            action=action,
            details=details or {},
        )

    @staticmethod
    def ensure_not_self(actor, target, action_label='cette action'):
        if actor.pk == target.pk:
            from apps.core.exceptions import BusinessLogicError
            raise BusinessLogicError(
                f'Vous ne pouvez pas effectuer {action_label} sur votre propre compte.',
                code='self_action_forbidden',
            )
