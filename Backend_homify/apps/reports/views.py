"""
Views for reports app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.core.exceptions import BusinessLogicError
from apps.core.utils import business_error_response
from apps.core.services import ReportModerationService

from .models import Report
from .serializers import ReportSerializer, ReportCreateSerializer, ReportResolveSerializer
from apps.users.permissions import IsAdmin


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for Report model."""

    permission_classes = (IsAuthenticated,)
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Report.objects.all().select_related('reporter', 'property', 'reported_user')
        return Report.objects.filter(reporter=user).select_related('property', 'reported_user')

    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        if self.action == 'resolve':
            return ReportResolveSerializer
        return ReportSerializer

    def get_permissions(self):
        if self.action in ['resolve', 'dismiss', 'review']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def review(self, request, pk=None):
        """PENDING → REVIEWED."""
        report = self.get_object()
        try:
            ReportModerationService.review(report)
        except BusinessLogicError as exc:
            return business_error_response(exc)
        serializer = ReportSerializer(report, context={'request': request})
        return Response({
            'message': 'Signalement examiné.',
            'report': serializer.data,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def resolve(self, request, pk=None):
        """REVIEWED → RESOLVED with optional moderation action."""
        report = self.get_object()
        payload = ReportResolveSerializer(data=request.data)
        payload.is_valid(raise_exception=True)

        try:
            ReportModerationService.resolve(
                report,
                action=payload.validated_data.get('action'),
                reason=payload.validated_data.get('reason', ''),
            )
        except BusinessLogicError as exc:
            return business_error_response(exc)

        serializer = ReportSerializer(report, context={'request': request})
        return Response({
            'message': 'Signalement résolu.',
            'report': serializer.data,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def dismiss(self, request, pk=None):
        """REVIEWED → DISMISSED."""
        report = self.get_object()
        try:
            ReportModerationService.dismiss(report)
        except BusinessLogicError as exc:
            return business_error_response(exc)
        serializer = ReportSerializer(report, context={'request': request})
        return Response({
            'message': 'Signalement rejeté.',
            'report': serializer.data,
        })
