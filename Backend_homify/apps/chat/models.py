"""
Message models.
"""
from django.db import models
from django.conf import settings


class Message(models.Model):
    """Message model for communication between users."""
    
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name='Propriété'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name='Expéditeur'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages',
        verbose_name='Destinataire'
    )
    
    subject = models.CharField(max_length=200, verbose_name='Sujet')
    content = models.TextField(verbose_name='Contenu')
    
    is_read = models.BooleanField(default=False, verbose_name='Lu')
    
    sent_at = models.DateTimeField(auto_now_add=True, verbose_name='Date d\'envoi')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='Date de lecture')
    
    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['recipient', '-sent_at']),
            models.Index(fields=['sender', '-sent_at']),
        ]
    
    def __str__(self):
        return f"{self.sender.email} → {self.recipient.email}: {self.subject}"
