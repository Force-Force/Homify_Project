"""
Serializers for User model.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.core.services import AuthService

from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that uses email instead of username."""

    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'username' in self.fields:
            del self.fields['username']
        self.fields['email'] = serializers.EmailField()

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        AuthService.ensure_user_can_login(user)
        AuthService.record_login(user)
        data['user'] = UserSerializer(user).data
        return data


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
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        return attrs

    def validate_role(self, value):
        if value not in ['TENANT', 'LANDLORD']:
            raise serializers.ValidationError('Le rôle doit être TENANT ou LANDLORD.')
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        intended_role = validated_data.pop('role')
        user = User.objects.create_user(**validated_data)
        AuthService.setup_post_registration(user, intended_role)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile with full details."""

    full_name = serializers.CharField(source='get_full_name', read_only=True)
    properties_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone',
            'role', 'pending_role', 'status', 'email_verified', 'created_at', 'last_login_at',
            'properties_count',
        )
        read_only_fields = (
            'id', 'email', 'role', 'pending_role', 'status', 'email_verified',
            'created_at', 'last_login_at',
        )

    def get_properties_count(self, obj):
        if obj.role == 'LANDLORD':
            return obj.properties.filter(status__in=['PUBLISHED', 'RENTED']).count()
        return 0


class LandlordPublicSerializer(serializers.ModelSerializer):
    """Public landlord profile — phone masked, no email."""

    full_name = serializers.CharField(source='get_full_name', read_only=True)
    masked_phone = serializers.CharField(source='get_masked_phone', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'full_name', 'masked_phone', 'role')
        read_only_fields = fields


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password': 'Les mots de passe ne correspondent pas.'})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        return attrs


class EmailVerifySerializer(serializers.Serializer):
    token = serializers.CharField()


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class AccountDeleteSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management."""

    full_name = serializers.CharField(source='get_full_name', read_only=True)
    properties_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone',
            'role', 'pending_role', 'status', 'email_verified', 'is_active',
            'created_at', 'last_login_at', 'properties_count',
        )
        read_only_fields = ('id', 'email', 'created_at', 'last_login_at', 'pending_role')

    def get_properties_count(self, obj):
        return obj.properties.count()

    def validate(self, attrs):
        status_value = attrs.get('status')
        if status_value is not None:
            attrs['is_active'] = status_value == 'ACTIVE'
        elif 'is_active' in attrs:
            attrs['status'] = 'ACTIVE' if attrs['is_active'] else 'SUSPENDED'
        return attrs

    def validate_role(self, value):
        request = self.context.get('request')
        if self.instance and request and self.instance.pk == request.user.pk:
            if value != self.instance.role:
                raise serializers.ValidationError('Vous ne pouvez pas modifier votre propre rôle.')
        if value == 'ADMIN' and (not self.instance or self.instance.role != 'ADMIN'):
            request = self.context.get('request')
            if not request or request.user.role != 'ADMIN':
                raise serializers.ValidationError('Seul un admin peut attribuer le rôle ADMIN.')
        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        request_user = request.user if request else None

        old_data = {
            'role': instance.role,
            'status': instance.status,
            'is_active': instance.is_active,
        }

        if request_user and request_user.pk == instance.pk:
            forbidden = {'role', 'status', 'is_active', 'email_verified'}
            for field in forbidden:
                if field in validated_data and validated_data[field] != getattr(instance, field):
                    raise serializers.ValidationError(
                        {field: 'Vous ne pouvez pas modifier ce champ sur votre propre compte.'}
                    )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if 'status' in validated_data or 'is_active' in validated_data:
            instance.sync_active_flag()
        instance.save()

        if request_user:
            from apps.core.services import UserAuditService
            UserAuditService.log(
                request_user,
                instance,
                'UPDATE',
                {
                    'before': old_data,
                    'after': {
                        'role': instance.role,
                        'status': instance.status,
                        'is_active': instance.is_active,
                    },
                },
            )
        return instance
