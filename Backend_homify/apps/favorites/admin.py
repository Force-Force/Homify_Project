"""
Admin configuration for favorites app.
"""
from django.contrib import admin
from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    """Admin for Favorite model."""
    
    list_display = ('user', 'property', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'property__title')
    readonly_fields = ('created_at',)
