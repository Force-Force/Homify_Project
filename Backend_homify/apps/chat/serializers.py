"""
Serializers for Message model.
"""
from rest_framework import serializers

from apps.core.exceptions import MessagingPolicyError
from apps.core.services import MessagingPolicyService, NotificationService

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


class ConversationSerializer(serializers.Serializer):
    """Grouped thread summary for the inbox."""

    property_id = serializers.IntegerField()
    property_detail = PropertyListSerializer()
    contact = UserSerializer()
    last_message = MessageSerializer()
    unread_count = serializers.IntegerField()
    updated_at = serializers.DateTimeField()


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages."""

    property_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Message
        fields = ('property_id', 'subject', 'content')

    def validate_content(self, value):
        if len(value) < 20:
            raise serializers.ValidationError("Le message doit contenir au moins 20 caractères.")
        if len(value) > 1000:
            raise serializers.ValidationError("Le message ne peut pas dépasser 1000 caractères.")
        return value

    def validate(self, attrs):
        from apps.properties.models import Property

        property_id = attrs.get('property_id')
        request = self.context['request']

        try:
            property_obj = Property.objects.get(id=property_id, status='PUBLISHED')
        except Property.DoesNotExist:
            raise serializers.ValidationError({'property_id': 'Propriété non trouvée.'})

        try:
            MessagingPolicyService.validate_new_message(request.user, property_obj)
        except MessagingPolicyError as exc:
            raise serializers.ValidationError({'non_field_errors': exc.message}) from exc

        attrs['property_obj'] = property_obj
        return attrs

    def create(self, validated_data):
        property_obj = validated_data.pop('property_obj')
        validated_data.pop('property_id')

        sender = self.context['request'].user
        validated_data['sender'] = sender
        validated_data['recipient'] = MessagingPolicyService.resolve_recipient(sender, property_obj)
        validated_data['property'] = property_obj

        message = super().create(validated_data)
        NotificationService.notify_new_message(message.id)
        return message
