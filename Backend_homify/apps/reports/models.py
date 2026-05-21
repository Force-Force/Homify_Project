"""
Report models for signalements.
"""
from django.db import models
from django.conf import settings


class Report(models.Model):
    """Report/Signalement model."""
    
    REASON_CHOICES = [
        ('FRAUD', 'Fraude'),
        ('INAPPROPRIATE', 'Contenu inapproprié'),
        ('DUPLICATE', 'Doublon'),
        ('OTHER', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('REVIEWED', 'Examiné'),
        ('RESOLVED', 'Résolu'),
        ('DISMISSED', 'Rejeté'),
    ]
    
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports',
        verbose_name='Rapporteur'
    )
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports',
        verbose_name='Propriété'
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports_received',
        verbose_name='Utilisateur signalé'
    )
    
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, verbose_name='Raison')
    description = models.TextField(verbose_name='Description')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name='Statut')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name='Date de résolution')
    
    class Meta:
        verbose_name = 'Signalement'
        verbose_name_plural = 'Signalements'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Signalement #{self.id} - {self.get_reason_display()}"
