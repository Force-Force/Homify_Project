"""
Report moderation workflow including REVIEWED state.
"""
from django.utils import timezone

from apps.core.exceptions import BusinessLogicError


class ReportModerationService:
    """Report status transitions: PENDING → REVIEWED → RESOLVED/DISMISSED."""

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
    def resolve(cls, report):
        """REVIEWED or PENDING → RESOLVED."""
        if report.status not in ('PENDING', 'REVIEWED'):
            raise BusinessLogicError(
                'Ce signalement ne peut plus être résolu.',
                code='invalid_report_status',
            )
        report.status = 'RESOLVED'
        report.resolved_at = timezone.now()
        report.save(update_fields=['status', 'resolved_at'])
        return report

    @classmethod
    def dismiss(cls, report):
        """REVIEWED or PENDING → DISMISSED."""
        if report.status not in ('PENDING', 'REVIEWED'):
            raise BusinessLogicError(
                'Ce signalement ne peut plus être rejeté.',
                code='invalid_report_status',
            )
        report.status = 'DISMISSED'
        report.resolved_at = timezone.now()
        report.save(update_fields=['status', 'resolved_at'])
        return report
