"""
Serializers for Message model.
"""
from rest_framework import serializers
from .models import Message
from apps.users.serializers import UserSerializer
from apps.properties.serializers import PropertyListSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model."""
    
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    property_detail = PropertyListSerializer(source='property', read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'property', 'property_detail', 'sender', 'recipient', 
                  'subject', 'content', 'is_read', 'sent_at', 'read_at')
        read_only_fields = ('id', 'sender', 'is_read', 'sent_at', 'read_at')


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages."""
    
    property_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Message
        fields = ('property_id', 'subject', 'content')
    
    def validate_content(self, value):
        """Validate message content length."""
        if len(value) < 20:
            raise serializers.ValidationError("Le message doit contenir au moins 20 caractères.")
        if len(value) > 1000:
            raise serializers.ValidationError("Le message ne peut pas dépasser 1000 caractères.")
        return value
    
    def create(self, validated_data):
        """Create message."""
        from apps.properties.models import Property
        
        property_id = validated_data.pop('property_id')
        
        try:
            property_obj = Property.objects.get(id=property_id, status='PUBLISHED')
        except Property.DoesNotExist:
            raise serializers.ValidationError({'property_id': 'Propriété non trouvée.'})
        
        # Set sender and recipient
        validated_data['sender'] = self.context['request'].user
        validated_data['recipient'] = property_obj.landlord
        validated_data['property'] = property_obj
        
        return super().create(validated_data)
