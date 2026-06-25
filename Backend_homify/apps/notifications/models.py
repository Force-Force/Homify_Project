"""
In-app notifications and user preferences.
"""
from django.conf import settings
from django.db import models
from django.utils import timezone


class NotificationPreference(models.Model):
    """Per-user notification channel preferences."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        verbose_name='Utilisateur',
    )
    email_notifications = models.BooleanField(default=True, verbose_name='Emails Homify')
    message_alerts = models.BooleanField(default=True, verbose_name='Alertes messages')
    new_listing_alerts = models.BooleanField(default=False, verbose_name='Nouvelles annonces')
    property_updates = models.BooleanField(
        default=True,
        verbose_name='Mises à jour annonces (propriétaire)',
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Préférences de notification'
        verbose_name_plural = 'Préférences de notification'

    def __str__(self):
        return f'Préférences — {self.user.email}'


class Notification(models.Model):
    """In-app notification stored for a user."""

    TYPE_CHOICES = [
        ('MESSAGE', 'Message'),
        ('PROPERTY_APPROVED', 'Annonce approuvée'),
        ('PROPERTY_REJECTED', 'Annonce rejetée'),
        ('PROPERTY_PUBLISHED', 'Annonce publiée'),
        ('ACCOUNT', 'Compte'),
        ('SYSTEM', 'Système'),
        ('NEW_LISTING', 'Nouvelle annonce'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Utilisateur',
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    body = models.TextField()
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    message = models.ForeignKey(
        'chat.Message',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    metadata = models.JSONField(default=dict, blank=True)
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='Lu le')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'read_at']),
        ]

    def __str__(self):
        return f'{self.title} → {self.user.email}'

    @property
    def is_read(self):
        return self.read_at is not None

    def mark_read(self):
        if not self.read_at:
            self.read_at = timezone.now()
            self.save(update_fields=['read_at'])
