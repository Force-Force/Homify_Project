"""
Serializers for User model.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that uses email instead of username."""

    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the default username field if it exists and add email field
        if 'username' in self.fields:
            del self.fields['username']
        self.fields['email'] = serializers.EmailField()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone', 'role')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs
    
    def validate_role(self, value):
        """Validate role is either TENANT or LANDLORD."""
        if value not in ['TENANT', 'LANDLORD']:
            raise serializers.ValidationError("Le rôle doit être TENANT ou LANDLORD.")
        return value
    
    def create(self, validated_data):
        """Create user."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    masked_phone = serializers.CharField(source='get_masked_phone', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name', 'phone', 
                  'masked_phone', 'role', 'status', 'email_verified', 'created_at')
        read_only_fields = ('id', 'email', 'role', 'status', 'email_verified', 'created_at')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with full details."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    properties_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name', 'phone', 
                  'role', 'status', 'email_verified', 'created_at', 'properties_count')
        read_only_fields = ('id', 'email', 'role', 'status', 'email_verified', 'created_at')
    
    def get_properties_count(self, obj):
        """Get count of user's properties."""
        if obj.role == 'LANDLORD':
            return obj.properties.filter(status__in=['PUBLISHED', 'RENTED']).count()
        return 0


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        """Validate passwords."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Les mots de passe ne correspondent pas."})
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    properties_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name', 'phone', 
                  'role', 'status', 'email_verified', 'is_active', 'created_at', 
                  'last_login_at', 'properties_count')
        read_only_fields = ('id', 'email', 'created_at', 'last_login_at')
    
    def get_properties_count(self, obj):
        """Get count of user's properties."""
        return obj.properties.count()
