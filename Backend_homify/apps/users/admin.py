"""
Admin configuration for users app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, AuthToken, UserAuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 'first_name', 'last_name', 'role', 'pending_role',
        'status', 'email_verified', 'created_at',
    )
    list_filter = ('role', 'status', 'email_verified', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {
            'fields': ('role', 'pending_role', 'status', 'email_verified', 'is_staff', 'is_superuser'),
        }),
        ('Dates importantes', {'fields': ('last_login_at', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )

    readonly_fields = ('created_at', 'updated_at', 'last_login_at')


@admin.register(AuthToken)
class AuthTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_type', 'expires_at', 'used_at', 'created_at')
    list_filter = ('token_type', 'used_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('token', 'created_at', 'used_at')


@admin.register(UserAuditLog)
class UserAuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'actor', 'target', 'created_at')
    list_filter = ('action',)
    search_fields = ('actor__email', 'target__email')
    readonly_fields = ('actor', 'target', 'action', 'details', 'created_at')
