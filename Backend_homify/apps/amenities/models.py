"""
Amenity models.
"""
from django.db import models


class Amenity(models.Model):
    """Amenity/Equipment model."""
    
    CATEGORY_CHOICES = [
        ('COMFORT', 'Confort'),
        ('SECURITY', 'Sécurité'),
        ('CONNECTIVITY', 'Connectivité'),
        ('EXTERIOR', 'Extérieur'),
    ]
    
    name = models.CharField(max_length=100, unique=True, verbose_name='Nom')
    icon = models.CharField(max_length=50, blank=True, verbose_name='Icône')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='Catégorie')
    
    properties = models.ManyToManyField(
        'properties.Property',
        related_name='amenities',
        blank=True,
        verbose_name='Propriétés'
    )
    
    class Meta:
        verbose_name = 'Équipement'
        verbose_name_plural = 'Équipements'
        ordering = ['category', 'name']
    
    def __str__(self):
        return self.name
