"""
Notification dispatch — in-app record + optional email (respecting preferences).
"""
from apps.core.tasks import send_email_task

from .models import Notification, NotificationPreference


class NotificationDispatchService:
    """Create in-app notifications and send emails when allowed."""

    @classmethod
    def get_preferences(cls, user) -> NotificationPreference:
        pref, _ = NotificationPreference.objects.get_or_create(user=user)
        return pref

    @classmethod
    def _should_send_email(cls, prefs: NotificationPreference, notification_type: str) -> bool:
        if notification_type == 'MESSAGE':
            return prefs.email_notifications and prefs.message_alerts
        if notification_type in ('PROPERTY_APPROVED', 'PROPERTY_REJECTED', 'PROPERTY_PUBLISHED'):
            return prefs.email_notifications and prefs.property_updates
        if notification_type == 'NEW_LISTING':
            return prefs.email_notifications and prefs.new_listing_alerts
        if notification_type == 'ACCOUNT':
            return prefs.email_notifications
        return prefs.email_notifications

    @classmethod
    def notify(
        cls,
        user,
        notification_type: str,
        title: str,
        body: str,
        *,
        property_obj=None,
        message_obj=None,
        metadata=None,
        email_subject=None,
        email_body=None,
    ):
        meta = dict(metadata or {})
        if property_obj and 'property_id' not in meta:
            meta['property_id'] = property_obj.id
        if message_obj and 'message_id' not in meta:
            meta['message_id'] = message_obj.id

        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            body=body,
            property=property_obj,
            message=message_obj,
            metadata=meta,
        )

        if email_subject and email_body:
            prefs = cls.get_preferences(user)
            if cls._should_send_email(prefs, notification_type):
                send_email_task.delay(email_subject, email_body, user.email)

        return notification
