"""
Serializers for Report model.
"""
from rest_framework import serializers
from .models import Report
from apps.users.serializers import UserSerializer
from apps.properties.serializers import PropertyListSerializer


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report model."""
    
    reporter = UserSerializer(read_only=True)
    property_detail = PropertyListSerializer(source='property', read_only=True)
    reported_user_detail = UserSerializer(source='reported_user', read_only=True)
    
    class Meta:
        model = Report
        fields = ('id', 'reporter', 'property', 'property_detail', 'reported_user', 
                  'reported_user_detail', 'reason', 'description', 'status', 
                  'created_at', 'resolved_at')
        read_only_fields = ('id', 'reporter', 'status', 'created_at', 'resolved_at')


class ReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reports."""
    
    class Meta:
        model = Report
        fields = ('property', 'reported_user', 'reason', 'description')
    
    def validate(self, attrs):
        """Validate that either property or reported_user is provided."""
        if not attrs.get('property') and not attrs.get('reported_user'):
            raise serializers.ValidationError(
                "Vous devez signaler soit une propriété, soit un utilisateur."
            )
        return attrs
    
    def create(self, validated_data):
        """Create report."""
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)
