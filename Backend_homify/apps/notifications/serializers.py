from rest_framework import serializers

from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    is_read = serializers.BooleanField(read_only=True)

    class Meta:
        model = Notification
        fields = (
            'id',
            'notification_type',
            'title',
            'body',
            'property_id',
            'message_id',
            'metadata',
            'is_read',
            'read_at',
            'created_at',
        )
        read_only_fields = fields


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = (
            'email_notifications',
            'message_alerts',
            'new_listing_alerts',
            'property_updates',
            'updated_at',
        )
        read_only_fields = ('updated_at',)
