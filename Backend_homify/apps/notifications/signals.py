from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.users.models import User

from .models import NotificationPreference


@receiver(post_save, sender=User)
def ensure_notification_preferences(sender, instance, created, **kwargs):
    if created:
        NotificationPreference.objects.get_or_create(user=instance)
