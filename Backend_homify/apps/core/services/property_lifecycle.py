"""
Property lifecycle and status transition rules.
"""
from django.utils import timezone

from apps.core.exceptions import PropertyLifecycleError


class PropertyLifecycleService:
    """Centralizes property status transitions and business rules."""

    LANDLORD_WRITABLE_STATUSES = frozenset({'DRAFT', 'PENDING'})
    ADMIN_ONLY_STATUSES = frozenset({'APPROVED', 'PUBLISHED', 'REJECTED', 'RENTED', 'DELETED'})

    LANDLORD_TRANSITIONS = {
        'DRAFT': frozenset({'DRAFT', 'PENDING'}),
        'REJECTED': frozenset({'DRAFT', 'PENDING'}),
        'PENDING': frozenset(),
        'APPROVED': frozenset(),
        'PUBLISHED': frozenset({'RENTED'}),
        'RENTED': frozenset(),
        'DELETED': frozenset(),
    }

    MIN_PHOTOS_FOR_SUBMISSION = 3

    @classmethod
    def resolve_initial_status(cls, user, requested_status=None):
        """Landlords always start in DRAFT; admins may set an explicit status."""
        if user.role == 'ADMIN' and requested_status:
            return requested_status
        return 'DRAFT'

    @classmethod
    def validate_landlord_status_change(cls, property_obj, new_status):
        """Ensure landlords cannot bypass moderation."""
        current = property_obj.status
        allowed = cls.LANDLORD_TRANSITIONS.get(current, frozenset())
        if new_status not in allowed:
            raise PropertyLifecycleError(
                f"Transition {current} → {new_status} non autorisée pour un propriétaire.",
                code='invalid_status_transition',
            )
        if new_status == 'PENDING':
            cls.ensure_ready_for_submission(property_obj)

    @classmethod
    def ensure_ready_for_submission(cls, property_obj):
        """Require minimum photos before submitting for review."""
        photo_count = property_obj.photos.count()
        if photo_count < cls.MIN_PHOTOS_FOR_SUBMISSION:
            raise PropertyLifecycleError(
                f"Au moins {cls.MIN_PHOTOS_FOR_SUBMISSION} photos sont requises avant soumission "
                f"({photo_count} actuellement).",
                code='insufficient_photos',
            )

    @classmethod
    def submit_for_review(cls, property_obj):
        """DRAFT/REJECTED → PENDING."""
        if property_obj.status not in ('DRAFT', 'REJECTED'):
            raise PropertyLifecycleError(
                'Seules les annonces en brouillon ou rejetées peuvent être soumises.',
                code='invalid_status_transition',
            )
        cls.ensure_ready_for_submission(property_obj)
        property_obj.status = 'PENDING'
        property_obj.rejection_reason = ''
        property_obj.save(update_fields=['status', 'rejection_reason', 'updated_at'])
        return property_obj

    @classmethod
    def approve(cls, property_obj):
        """PENDING → APPROVED (admin moderation step 1)."""
        if property_obj.status != 'PENDING':
            raise PropertyLifecycleError(
                'Seules les annonces en attente peuvent être approuvées.',
                code='invalid_status_transition',
            )
        property_obj.status = 'APPROVED'
        property_obj.save(update_fields=['status', 'updated_at'])
        return property_obj

    @classmethod
    def publish(cls, property_obj):
        """APPROVED → PUBLISHED (admin moderation step 2)."""
        if property_obj.status != 'APPROVED':
            raise PropertyLifecycleError(
                'Seules les annonces approuvées peuvent être publiées.',
                code='invalid_status_transition',
            )
        property_obj.status = 'PUBLISHED'
        property_obj.published_at = timezone.now()
        property_obj.save(update_fields=['status', 'published_at', 'updated_at'])
        return property_obj

    @classmethod
    def reject(cls, property_obj, reason=''):
        """PENDING → REJECTED with stored reason."""
        if property_obj.status != 'PENDING':
            raise PropertyLifecycleError(
                'Seules les annonces en attente peuvent être rejetées.',
                code='invalid_status_transition',
            )
        property_obj.status = 'REJECTED'
        property_obj.rejection_reason = reason or ''
        property_obj.save(update_fields=['status', 'rejection_reason', 'updated_at'])
        return property_obj

    @classmethod
    def mark_rented(cls, property_obj):
        """PUBLISHED → RENTED."""
        if property_obj.status != 'PUBLISHED':
            raise PropertyLifecycleError(
                'Seules les annonces publiées peuvent être marquées comme louées.',
                code='invalid_status_transition',
            )
        property_obj.status = 'RENTED'
        property_obj.save(update_fields=['status', 'updated_at'])
        return property_obj

    @classmethod
    def soft_delete(cls, property_obj):
        """Any status → DELETED (soft delete, record preserved)."""
        property_obj.status = 'DELETED'
        property_obj.save(update_fields=['status', 'updated_at'])
        return property_obj
