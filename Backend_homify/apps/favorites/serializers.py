"""
Serializers for Favorite model.
"""
from rest_framework import serializers
from .models import Favorite
from apps.properties.serializers import PropertyListSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for Favorite model."""
    
    property = PropertyListSerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Favorite
        fields = ('id', 'property', 'property_id', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        """Create favorite."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
