"""
Report moderation workflow including REVIEWED state and unified actions.
"""
from django.utils import timezone

from apps.core.exceptions import BusinessLogicError


class ReportModerationService:
    """Report status transitions: PENDING → REVIEWED → RESOLVED/DISMISSED."""

    OPEN_STATUSES = frozenset({'PENDING', 'REVIEWED'})

    RESOLVE_ACTIONS = frozenset({
        'reject_property',
        'unpublish_property',
        'suspend_user',
    })

    @classmethod
    def validate_new_report(cls, reporter, property_obj=None, reported_user=None):
        """Prevent duplicate open reports for the same target."""
        from apps.reports.models import Report

        base_qs = Report.objects.filter(reporter=reporter, status__in=cls.OPEN_STATUSES)

        if property_obj and base_qs.filter(property=property_obj).exists():
            raise BusinessLogicError(
                'Vous avez déjà un signalement ouvert pour cette annonce.',
                code='duplicate_report',
            )

        if reported_user and base_qs.filter(reported_user=reported_user).exists():
            raise BusinessLogicError(
                'Vous avez déjà un signalement ouvert pour cet utilisateur.',
                code='duplicate_report',
            )

    @classmethod
    def review(cls, report):
        """PENDING → REVIEWED."""
        if report.status != 'PENDING':
            raise BusinessLogicError(
                'Seuls les signalements en attente peuvent être examinés.',
                code='invalid_report_status',
            )
        report.status = 'REVIEWED'
        report.save(update_fields=['status'])
        return report

    @classmethod
    def resolve(cls, report, action=None, reason=''):
        """REVIEWED → RESOLVED with optional moderation action."""
        if report.status != 'REVIEWED':
            raise BusinessLogicError(
                'Le signalement doit d\'abord être examiné (statut REVIEWED).',
                code='invalid_report_status',
            )

        if action:
            if action not in cls.RESOLVE_ACTIONS:
                raise BusinessLogicError(
                    f'Action inconnue : {action}.',
                    code='invalid_resolve_action',
                )
            cls._apply_resolve_action(report, action, reason=reason)

        report.status = 'RESOLVED'
        report.resolved_at = timezone.now()
        report.save(update_fields=['status', 'resolved_at'])
        return report

    @classmethod
    def dismiss(cls, report):
        """REVIEWED → DISMISSED."""
        if report.status != 'REVIEWED':
            raise BusinessLogicError(
                'Le signalement doit d\'abord être examiné (statut REVIEWED).',
                code='invalid_report_status',
            )
        report.status = 'DISMISSED'
        report.resolved_at = timezone.now()
        report.save(update_fields=['status', 'resolved_at'])
        return report

    @classmethod
    def _apply_resolve_action(cls, report, action, reason=''):
        from apps.core.services import PropertyLifecycleService, UserLifecycleService, NotificationService

        if action == 'reject_property':
            if not report.property:
                raise BusinessLogicError(
                    'Ce signalement ne concerne pas une annonce.',
                    code='invalid_resolve_action',
                )
            prop = report.property
            if prop.status == 'PENDING':
                PropertyLifecycleService.reject(prop, reason=reason or report.description)
                NotificationService.notify_property_rejected(prop.id, reason=reason or report.description)
            elif prop.status == 'PUBLISHED':
                PropertyLifecycleService.soft_delete(prop)
            else:
                raise BusinessLogicError(
                    f'Impossible de rejeter une annonce au statut {prop.status}.',
                    code='invalid_property_status',
                )

        elif action == 'unpublish_property':
            if not report.property:
                raise BusinessLogicError(
                    'Ce signalement ne concerne pas une annonce.',
                    code='invalid_resolve_action',
                )
            if report.property.status != 'PUBLISHED':
                raise BusinessLogicError(
                    'Seules les annonces publiées peuvent être retirées.',
                    code='invalid_property_status',
                )
            PropertyLifecycleService.soft_delete(report.property)

        elif action == 'suspend_user':
            if not report.reported_user:
                raise BusinessLogicError(
                    'Ce signalement ne concerne pas un utilisateur.',
                    code='invalid_resolve_action',
                )
            UserLifecycleService.suspend(report.reported_user)
