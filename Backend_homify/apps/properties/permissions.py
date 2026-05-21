"""
Permissions for properties app.
"""
from rest_framework import permissions


class IsLandlordOrReadOnly(permissions.BasePermission):
    """Allow landlords to create, others to read."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['LANDLORD', 'ADMIN']


class IsPropertyOwnerOrAdmin(permissions.BasePermission):
    """Allow property owner or admin to modify."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return obj.landlord == request.user
