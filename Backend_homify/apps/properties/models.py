"""
Property models for the rental platform.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Property(models.Model):
    """Property/Annonce model."""
    
    TYPE_CHOICES = [
        ('HOUSE', 'Maison'),
        ('APARTMENT', 'Appartement'),
        ('STUDIO', 'Studio'),
        ('ROOM', 'Chambre'),
    ]
    
    STATUS_CHOICES = [
        ('DRAFT', 'Brouillon'),
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvé'),
        ('REJECTED', 'Rejeté'),
        ('PUBLISHED', 'Publié'),
        ('RENTED', 'Loué'),
        ('DELETED', 'Supprimé'),
    ]
    
    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='properties',
        verbose_name='Propriétaire'
    )
    
    # Basic information
    title = models.CharField(max_length=200, verbose_name='Titre')
    description = models.TextField(verbose_name='Description')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name='Type')
    
    # Characteristics
    surface = models.FloatField(validators=[MinValueValidator(0)], verbose_name='Surface (m²)')
    number_of_rooms = models.IntegerField(validators=[MinValueValidator(0)], verbose_name='Nombre de pièces')
    number_of_bedrooms = models.IntegerField(validators=[MinValueValidator(0)], verbose_name='Nombre de chambres')
    number_of_bathrooms = models.IntegerField(validators=[MinValueValidator(0)], verbose_name='Nombre de salles de bain')
    floor = models.IntegerField(null=True, blank=True, verbose_name='Étage')
    furnished = models.BooleanField(default=False, verbose_name='Meublé')
    
    # Pricing
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Loyer mensuel'
    )
    charges = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Charges'
    )
    charges_included = models.BooleanField(default=False, verbose_name='Charges incluses')
    deposit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Caution'
    )
    agency_fees = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Frais d\'agence'
    )
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT', verbose_name='Statut')
    view_count = models.IntegerField(default=0, verbose_name='Nombre de vues')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Date de modification')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='Date de publication')
    
    class Meta:
        verbose_name = 'Propriété'
        verbose_name_plural = 'Propriétés'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['landlord', 'status']),
            models.Index(fields=['type', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def increment_view_count(self):
        """Increment view count."""
        self.view_count += 1
        self.save(update_fields=['view_count'])


class Address(models.Model):
    """Address model for properties."""
    
    property = models.OneToOneField(
        Property,
        on_delete=models.CASCADE,
        related_name='address',
        verbose_name='Propriété'
    )
    
    street_address = models.CharField(max_length=255, verbose_name='Adresse')
    city = models.CharField(max_length=100, verbose_name='Ville')
    postal_code = models.CharField(max_length=20, verbose_name='Code postal')
    district = models.CharField(max_length=100, blank=True, verbose_name='Quartier')
    
    latitude = models.FloatField(null=True, blank=True, verbose_name='Latitude')
    longitude = models.FloatField(null=True, blank=True, verbose_name='Longitude')
    
    class Meta:
        verbose_name = 'Adresse'
        verbose_name_plural = 'Adresses'
    
    def __str__(self):
        return f"{self.street_address}, {self.city}"
    
    def get_full_address(self):
        """Return full formatted address."""
        parts = [self.street_address, self.district, self.city, self.postal_code]
        return ', '.join(filter(None, parts))


class Photo(models.Model):
    """Photo model for properties."""
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='photos',
        verbose_name='Propriété'
    )
    
    image = models.ImageField(upload_to='properties/%Y/%m/%d/', verbose_name='Image')
    thumbnail = models.ImageField(
        upload_to='properties/thumbnails/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name='Miniature'
    )
    is_primary = models.BooleanField(default=False, verbose_name='Photo principale')
    order = models.IntegerField(default=0, verbose_name='Ordre')
    
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Date d\'upload')
    
    class Meta:
        verbose_name = 'Photo'
        verbose_name_plural = 'Photos'
        ordering = ['order', 'uploaded_at']
    
    def __str__(self):
        return f"Photo {self.id} - {self.property.title}"
