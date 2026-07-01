"""
User models for the rental platform.
"""
import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('email_verified', True)
        extra_fields.setdefault('pending_role', '')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model."""

    ROLE_CHOICES = [
        ('VISITOR', 'Visiteur'),
        ('TENANT', 'Locataire'),
        ('LANDLORD', 'Propriétaire'),
        ('ADMIN', 'Administrateur'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Actif'),
        ('SUSPENDED', 'Suspendu'),
        ('DELETED', 'Supprimé'),
    ]

    email = models.EmailField(unique=True, verbose_name='Email')
    first_name = models.CharField(max_length=100, verbose_name='Prénom')
    last_name = models.CharField(max_length=100, verbose_name='Nom')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Téléphone')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='VISITOR', verbose_name='Rôle')
    pending_role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        blank=True,
        default='',
        verbose_name='Rôle en attente (post-vérification email)',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', verbose_name='Statut')
    email_verified = models.BooleanField(default=False, verbose_name='Email vérifié')
    landlord_verified = models.BooleanField(
        default=False,
        verbose_name='Propriétaire vérifié (KYC)',
    )
    landlord_verified_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Vérification KYC le',
    )

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Date de modification')
    last_login_at = models.DateTimeField(null=True, blank=True, verbose_name='Dernière connexion')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_masked_phone(self):
        if not self.phone or len(self.phone) < 4:
            return self.phone
        return f"XX XX XX {self.phone[-4:]}"

    def sync_active_flag(self):
        """Keep is_active aligned with status."""
        self.is_active = self.status == 'ACTIVE'
        return self.is_active


class AuthToken(models.Model):
    """Base model for single-use auth tokens."""

    TOKEN_TYPES = [
        ('EMAIL_VERIFY', 'Vérification email'),
        ('PASSWORD_RESET', 'Réinitialisation mot de passe'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auth_tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    token_type = models.CharField(max_length=20, choices=TOKEN_TYPES)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Jeton d\'authentification'
        verbose_name_plural = 'Jetons d\'authentification'
        indexes = [
            models.Index(fields=['token', 'token_type']),
        ]

    def __str__(self):
        return f"{self.token_type} for {self.user.email}"

    @classmethod
    def generate_token(cls):
        return secrets.token_urlsafe(32)

    @property
    def is_valid(self):
        return self.used_at is None and self.expires_at > timezone.now()

    def mark_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=['used_at'])


class UserAuditLog(models.Model):
    """Audit trail for admin actions on user accounts."""

    ACTION_CHOICES = [
        ('SUSPEND', 'Suspension'),
        ('ACTIVATE', 'Activation'),
        ('SOFT_DELETE', 'Suppression logique'),
        ('UPDATE', 'Modification'),
    ]

    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_actions_performed',
        verbose_name='Administrateur',
    )
    target = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='audit_logs',
        verbose_name='Utilisateur cible',
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Journal d\'audit utilisateur'
        verbose_name_plural = 'Journaux d\'audit utilisateur'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} → {self.target.email} par {self.actor_id}"


class LandlordVerificationRequest(models.Model):
    """KYC request submitted by a landlord."""

    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvé'),
        ('REJECTED', 'Rejeté'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='landlord_verification_requests',
        verbose_name='Propriétaire',
    )
    id_number = models.CharField(max_length=80, blank=True, default='', verbose_name='N° pièce')
    note = models.TextField(blank=True, default='', verbose_name='Message du propriétaire')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name='Statut')
    admin_note = models.TextField(blank=True, default='', verbose_name='Note admin')
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='landlord_verifications_reviewed',
        verbose_name='Revu par',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Soumis le')
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='Revu le')

    class Meta:
        verbose_name = 'Demande vérification propriétaire'
        verbose_name_plural = 'Demandes vérification propriétaire'
        ordering = ['-created_at']

    def __str__(self):
        return f'KYC {self.user.email} — {self.status}'
