"""
Property view tracking for deduplicated view counts.
"""
import hashlib

from django.utils import timezone

from apps.properties.models import Property, PropertyViewRecord


class PropertyViewService:
    """Increment view_count at most once per viewer per property per day."""

    @classmethod
    def _viewer_key(cls, request):
        if request.user.is_authenticated:
            return f'user:{request.user.id}'
        ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
        if not ip:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        return f'ip:{hashlib.sha256(ip.encode()).hexdigest()[:32]}'

    @classmethod
    def record_view(cls, property_obj: Property, request) -> bool:
        """
        Record a view if not already counted today for this viewer.
        Returns True when view_count was incremented.
        """
        viewer_key = cls._viewer_key(request)
        today = timezone.localdate()

        _, created = PropertyViewRecord.objects.get_or_create(
            property=property_obj,
            viewer_key=viewer_key,
            viewed_on=today,
            defaults={'user': request.user if request.user.is_authenticated else None},
        )

        if created:
            property_obj.increment_view_count()
            return True
        return False
