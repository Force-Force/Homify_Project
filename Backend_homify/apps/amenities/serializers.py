"""
Serializers for Amenity model.
"""
from rest_framework import serializers
from .models import Amenity


class AmenitySerializer(serializers.ModelSerializer):
    """Serializer for Amenity model."""
    
    class Meta:
        model = Amenity
        fields = ('id', 'name', 'icon', 'category')
