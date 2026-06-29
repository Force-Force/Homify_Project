"""
Custom permissions for users app.
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission for admin users only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsLandlord(permissions.BasePermission):
    """Permission for landlord users."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'LANDLORD'


class IsLandlordOrAdmin(permissions.BasePermission):
    """Landlord or admin (billing, property management)."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('LANDLORD', 'ADMIN')
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission for object owner or admin."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return obj == request.user or (hasattr(obj, 'user') and obj.user == request.user)
