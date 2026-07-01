"""Landlord analytics — Pro plan stats."""
from django.db.models import Count

from apps.chat.models import Message
from apps.properties.models import Property

from .services import BillingError, BillingService


class LandlordStatsService:
    """Per-listing performance metrics for Pro landlords."""

    @classmethod
    def ensure_pro_access(cls, user):
        if user.role == 'ADMIN':
            return
        if user.role != 'LANDLORD':
            raise BillingError('Réservé aux propriétaires.', code='landlord_only')
        if not BillingService.is_pro_landlord(user):
            raise BillingError(
                'Statistiques réservées au plan Pro.',
                code='pro_required',
            )

    @classmethod
    def _lead_count(cls, property_id: int, landlord_id: int) -> int:
        return (
            Message.objects.filter(property_id=property_id, recipient_id=landlord_id)
            .exclude(sender_id=landlord_id)
            .values('sender_id')
            .distinct()
            .count()
        )

    @classmethod
    def get_stats(cls, user) -> dict:
        cls.ensure_pro_access(user)

        properties = (
            Property.objects.filter(landlord=user)
            .exclude(status='DELETED')
            .annotate(
                favorites_count=Count('favorites', distinct=True),
                messages_count=Count('messages', distinct=True),
            )
            .order_by('-created_at')
        )

        property_rows = []
        totals = {'views': 0, 'favorites': 0, 'messages': 0, 'leads': 0}

        for prop in properties:
            leads = cls._lead_count(prop.id, user.id)
            row = {
                'id': prop.id,
                'title': prop.title,
                'status': prop.status,
                'views': prop.view_count,
                'favorites': prop.favorites_count,
                'messages': prop.messages_count,
                'leads': leads,
                'is_boosted': BillingService.is_property_boosted(prop),
            }
            property_rows.append(row)
            totals['views'] += prop.view_count
            totals['favorites'] += prop.favorites_count
            totals['messages'] += prop.messages_count
            totals['leads'] += leads

        return {
            'is_pro': BillingService.is_pro_landlord(user),
            'landlord_verified': user.landlord_verified,
            'totals': totals,
            'properties': property_rows,
        }
