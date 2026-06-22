"""
Serializers for Amenity model.
"""
from rest_framework import serializers

from .models import Amenity


class AmenitySerializer(serializers.ModelSerializer):
    """Serializer for Amenity model."""

    properties_count = serializers.SerializerMethodField()

    class Meta:
        model = Amenity
        fields = ('id', 'name', 'icon', 'category', 'properties_count')
        read_only_fields = ('id', 'properties_count')

    def get_properties_count(self, obj):
        return obj.properties.exclude(status='DELETED').count()
