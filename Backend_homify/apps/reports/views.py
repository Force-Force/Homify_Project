"""
Views for reports app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Report
from .serializers import ReportSerializer, ReportCreateSerializer
from apps.users.permissions import IsAdmin


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for Report model."""
    
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        """Get reports based on user role."""
        user = self.request.user
        
        if user.role == 'ADMIN':
            return Report.objects.all().select_related('reporter', 'property', 'reported_user')
        else:
            return Report.objects.filter(reporter=user).select_related('property', 'reported_user')
    
    def get_serializer_class(self):
        """Return appropriate serializer."""
        if self.action == 'create':
            return ReportCreateSerializer
        return ReportSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['resolve', 'dismiss']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def resolve(self, request, pk=None):
        """Resolve a report."""
        report = self.get_object()
        
        report.status = 'RESOLVED'
        report.resolved_at = timezone.now()
        report.save()
        
        serializer = self.get_serializer(report)
        return Response({
            'message': 'Signalement résolu.',
            'report': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def dismiss(self, request, pk=None):
        """Dismiss a report."""
        report = self.get_object()
        
        report.status = 'DISMISSED'
        report.resolved_at = timezone.now()
        report.save()
        
        serializer = self.get_serializer(report)
        return Response({
            'message': 'Signalement rejeté.',
            'report': serializer.data
        })
