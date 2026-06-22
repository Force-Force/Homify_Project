"""
Serializers for Report model.
"""
from rest_framework import serializers

from apps.core.exceptions import BusinessLogicError
from apps.core.services import ReportModerationService

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
        fields = (
            'id', 'reporter', 'property', 'property_detail', 'reported_user',
            'reported_user_detail', 'reason', 'description', 'status',
            'created_at', 'resolved_at',
        )
        read_only_fields = ('id', 'reporter', 'status', 'created_at', 'resolved_at')


class ReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reports."""

    class Meta:
        model = Report
        fields = ('property', 'reported_user', 'reason', 'description')

    def validate(self, attrs):
        if not attrs.get('property') and not attrs.get('reported_user'):
            raise serializers.ValidationError(
                'Vous devez signaler soit une propriété, soit un utilisateur.',
            )

        reporter = self.context['request'].user
        try:
            ReportModerationService.validate_new_report(
                reporter,
                property_obj=attrs.get('property'),
                reported_user=attrs.get('reported_user'),
            )
        except BusinessLogicError as exc:
            raise serializers.ValidationError({'non_field_errors': exc.message}) from exc

        return attrs

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class ReportResolveSerializer(serializers.Serializer):
    """Optional moderation action when resolving a report."""

    action = serializers.ChoiceField(
        choices=['reject_property', 'unpublish_property', 'suspend_user'],
        required=False,
        allow_null=True,
    )
    reason = serializers.CharField(required=False, allow_blank=True, default='')
