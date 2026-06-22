"""
Messaging policy enforcement (rate limits, sender rules).
"""
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from apps.core.exceptions import MessagingPolicyError


class MessagingPolicyService:
    """Enforces documented messaging limits and sender rules."""

    @classmethod
    def _rate_limit(cls):
        return getattr(settings, 'HOMIFY_MESSAGE_RATE_LIMIT', 3)

    @classmethod
    def _rate_window_hours(cls):
        return getattr(settings, 'HOMIFY_MESSAGE_RATE_WINDOW_HOURS', 24)

    @classmethod
    def check_rate_limit(cls, sender, property_obj):
        """Max N messages per property per sender per 24h (documented API rule)."""
        from apps.chat.models import Message

        since = timezone.now() - timedelta(hours=cls._rate_window_hours())
        count = Message.objects.filter(
            sender=sender,
            property=property_obj,
            sent_at__gte=since,
        ).count()

        limit = cls._rate_limit()
        if count >= limit:
            raise MessagingPolicyError(
                f'Limite atteinte : {limit} messages maximum par annonce '
                f'sur {cls._rate_window_hours()}h.',
                code='message_rate_limit',
            )

    @classmethod
    def validate_new_message(cls, sender, property_obj):
        """Validate sender eligibility and rate limits before creating a message."""
        if property_obj.status != 'PUBLISHED':
            raise MessagingPolicyError(
                'Seules les annonces publiées acceptent des messages.',
                code='property_not_published',
            )

        if sender == property_obj.landlord:
            raise MessagingPolicyError(
                'Vous ne pouvez pas contacter votre propre annonce.',
                code='self_message',
            )

        if getattr(sender, 'status', 'ACTIVE') != 'ACTIVE':
            raise MessagingPolicyError(
                'Compte inactif ou suspendu.',
                code='sender_inactive',
            )

        cls.check_rate_limit(sender, property_obj)
