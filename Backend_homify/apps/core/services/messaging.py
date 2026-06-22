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
    def resolve_recipient(cls, sender, property_obj):
        """Tenant → landlord; landlord → most recent tenant in the thread."""
        from apps.chat.models import Message

        if sender == property_obj.landlord:
            last_contact = (
                Message.objects.filter(property=property_obj)
                .exclude(sender=property_obj.landlord)
                .order_by('-sent_at')
                .first()
            )
            if not last_contact:
                raise MessagingPolicyError(
                    'Aucun locataire à contacter pour cette annonce.',
                    code='no_thread',
                )
            return last_contact.sender
        return property_obj.landlord

    @classmethod
    def validate_participant(cls, sender, property_obj):
        """Ensure sender is allowed to participate in this property thread."""
        if sender == property_obj.landlord:
            cls.resolve_recipient(sender, property_obj)
            return

        if sender.role not in ('TENANT', 'VISITOR', 'LANDLORD', 'ADMIN'):
            raise MessagingPolicyError(
                'Compte non autorisé à envoyer des messages.',
                code='sender_not_allowed',
            )

    @classmethod
    def validate_new_message(cls, sender, property_obj):
        """Validate sender eligibility and rate limits before creating a message."""
        if property_obj.status != 'PUBLISHED':
            raise MessagingPolicyError(
                'Seules les annonces publiées acceptent des messages.',
                code='property_not_published',
            )

        if getattr(sender, 'status', 'ACTIVE') != 'ACTIVE':
            raise MessagingPolicyError(
                'Compte inactif ou suspendu.',
                code='sender_inactive',
            )

        cls.validate_participant(sender, property_obj)
        cls.check_rate_limit(sender, property_obj)

    @classmethod
    def validate_delete(cls, user, message):
        """Only the sender may delete their own message."""
        if message.sender_id != user.id:
            raise MessagingPolicyError(
                'Seul l\'expéditeur peut supprimer ce message.',
                code='forbidden_delete',
            )
