"""
Billing models — products, subscriptions, payment orders.
"""
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator


class BillingProduct(models.Model):
    """Catalog item (boost pack or subscription plan)."""

    PRODUCT_TYPES = [
        ('BOOST', 'Boost annonce'),
        ('SUBSCRIPTION', 'Abonnement'),
    ]

    code = models.CharField(max_length=40, unique=True, verbose_name='Code')
    name = models.CharField(max_length=120, verbose_name='Nom')
    description = models.TextField(blank=True, default='', verbose_name='Description')
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, verbose_name='Type')
    amount_fcfa = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        verbose_name='Prix (FCFA)',
    )
    duration_days = models.PositiveIntegerField(
        default=0,
        verbose_name='Durée (jours)',
        help_text='Durée du boost ou de l\'abonnement.',
    )
    is_active = models.BooleanField(default=True, verbose_name='Actif')
    sort_order = models.PositiveSmallIntegerField(default=0, verbose_name='Ordre')

    class Meta:
        verbose_name = 'Produit facturation'
        verbose_name_plural = 'Produits facturation'
        ordering = ('sort_order', 'amount_fcfa')

    def __str__(self):
        return f'{self.code} — {self.name}'


class LandlordSubscription(models.Model):
    """Active or historical landlord plan."""

    PLAN_CODES = [
        ('FREE', 'Gratuit'),
        ('PRO', 'Pro'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='landlord_subscriptions',
        verbose_name='Propriétaire',
    )
    plan_code = models.CharField(max_length=20, choices=PLAN_CODES, default='FREE', verbose_name='Plan')
    started_at = models.DateTimeField(auto_now_add=True, verbose_name='Début')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Expiration')
    is_active = models.BooleanField(default=True, verbose_name='Actif')

    class Meta:
        verbose_name = 'Abonnement propriétaire'
        verbose_name_plural = 'Abonnements propriétaires'
        ordering = ('-started_at',)

    def __str__(self):
        return f'{self.user_id} — {self.plan_code}'


class PaymentOrder(models.Model):
    """Payment intent / receipt."""

    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('COMPLETED', 'Payé'),
        ('FAILED', 'Échoué'),
        ('CANCELLED', 'Annulé'),
    ]

    PROVIDER_CHOICES = [
        ('MOCK', 'Simulation (dev)'),
        ('AANGARAAPAY', 'Aangaraa Pay'),
        ('FLUTTERWAVE', 'Flutterwave'),
        ('MTN_MOMO', 'MTN Mobile Money'),
        ('ORANGE_MONEY', 'Orange Money'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_orders',
        verbose_name='Utilisateur',
    )
    product = models.ForeignKey(
        BillingProduct,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name='Produit',
    )
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payment_orders',
        verbose_name='Annonce',
    )
    amount_fcfa = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        verbose_name='Montant (FCFA)',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name='Statut')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='MOCK', verbose_name='Fournisseur')
    transaction_id = models.CharField(max_length=80, unique=True, blank=True, default='', verbose_name='ID transaction')
    pay_token = models.CharField(max_length=120, blank=True, default='', verbose_name='Pay token')
    operator = models.CharField(max_length=40, blank=True, default='', verbose_name='Opérateur')
    provider_reference = models.CharField(max_length=120, blank=True, default='', verbose_name='Réf. paiement')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Payé le')

    class Meta:
        verbose_name = 'Commande paiement'
        verbose_name_plural = 'Commandes paiement'
        ordering = ('-created_at',)

    def __str__(self):
        return f'Order #{self.pk} — {self.status}'


class RentCommission(models.Model):
    """Success fee when a property is rented via Homify."""

    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('PAID', 'Payée'),
        ('WAIVED', 'Annulée'),
    ]

    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='rent_commissions',
        verbose_name='Annonce',
    )
    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rent_commissions',
        verbose_name='Propriétaire',
    )
    monthly_rent_fcfa = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        verbose_name='Loyer mensuel (FCFA)',
    )
    commission_rate_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Taux (%)',
    )
    amount_fcfa = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        verbose_name='Commission (FCFA)',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name='Statut')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créée le')
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name='Payée le')

    class Meta:
        verbose_name = 'Commission location'
        verbose_name_plural = 'Commissions location'
        ordering = ('-created_at',)

    def __str__(self):
        return f'Commission #{self.pk} — {self.amount_fcfa} FCFA'
