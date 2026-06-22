"""
Admin configuration for amenities app.
"""
from django.contrib import admin
from .models import Amenity


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    """Admin for Amenity model."""

    list_display = ('name', 'category', 'icon', 'linked_properties_count')
    list_filter = ('category',)
    search_fields = ('name',)

    @admin.display(description='Annonces liées')
    def linked_properties_count(self, obj):
        return obj.properties.exclude(status='DELETED').count()
