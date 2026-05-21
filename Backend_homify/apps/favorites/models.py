"""
Favorite models.
"""
from django.db import models
from django.conf import settings


class Favorite(models.Model):
    """Favorite model for user's saved properties."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='Utilisateur'
    )
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='Propriété'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date d\'ajout')
    
    class Meta:
        verbose_name = 'Favori'
        verbose_name_plural = 'Favoris'
        unique_together = ('user', 'property')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.property.title}"
