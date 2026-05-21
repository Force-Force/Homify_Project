"""
Admin configuration for amenities app.
"""
from django.contrib import admin
from .models import Amenity


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    """Admin for Amenity model."""
    
    list_display = ('name', 'category', 'icon')
    list_filter = ('category',)
    search_fields = ('name',)
