"""
Notification orchestration — delegates to Celery tasks.
"""
from apps.core.tasks import (
    notify_new_message_task,
    notify_property_approved_task,
    notify_property_published_task,
    notify_property_rejected_task,
    send_email_task,
)


class NotificationService:
    """Central entry point for async email and in-app notifications."""

    @staticmethod
    def send_email(subject, message, recipient_email):
        send_email_task.delay(subject, message, recipient_email)

    @staticmethod
    def notify_property_rejected(property_id, reason=''):
        notify_property_rejected_task.delay(property_id, reason)

    @staticmethod
    def notify_property_approved(property_id):
        notify_property_approved_task.delay(property_id)

    @staticmethod
    def notify_property_published(property_id):
        notify_property_published_task.delay(property_id)

    @staticmethod
    def notify_new_message(message_id):
        notify_new_message_task.delay(message_id)
