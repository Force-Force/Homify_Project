"""
Admin configuration for properties app.
"""
from django.contrib import admin
from .models import Property, Address, Photo


class AddressInline(admin.StackedInline):
    """Inline admin for Address."""
    model = Address
    extra = 0


class PhotoInline(admin.TabularInline):
    """Inline admin for Photo."""
    model = Photo
    extra = 0
    readonly_fields = ('uploaded_at',)


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    """Admin for Property model."""
    
    list_display = ('title', 'type', 'landlord', 'monthly_rent', 'status', 'view_count', 'created_at')
    list_filter = ('status', 'type', 'furnished', 'created_at')
    search_fields = ('title', 'description', 'landlord__email')
    readonly_fields = ('view_count', 'created_at', 'updated_at', 'published_at')
    
    inlines = [AddressInline, PhotoInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('landlord', 'title', 'description', 'type', 'status')
        }),
        ('Caractéristiques', {
            'fields': ('surface', 'number_of_rooms', 'number_of_bedrooms', 
                      'number_of_bathrooms', 'floor', 'furnished')
        }),
        ('Tarification', {
            'fields': ('monthly_rent', 'charges', 'charges_included', 'deposit', 'agency_fees')
        }),
        ('Statistiques', {
            'fields': ('view_count', 'created_at', 'updated_at', 'published_at')
        }),
    )
