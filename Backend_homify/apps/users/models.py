"""
User models for the rental platform.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError('Users must have an email address')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('email_verified', True)
        
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
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='TENANT', verbose_name='Rôle')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', verbose_name='Statut')
    email_verified = models.BooleanField(default=False, verbose_name='Email vérifié')
    
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
        """Return the full name."""
        return f"{self.first_name} {self.last_name}"
    
    def get_masked_phone(self):
        """Return partially masked phone number."""
        if not self.phone or len(self.phone) < 4:
            return self.phone
        return f"XX XX XX {self.phone[-4:]}"
