"""
Views for messages app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for Message model."""
    
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        """Get messages for current user."""
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).select_related('sender', 'recipient', 'property')
    
    def get_serializer_class(self):
        """Return appropriate serializer."""
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    @action(detail=False, methods=['get'])
    def inbox(self, request):
        """Get received messages."""
        messages = self.get_queryset().filter(recipient=request.user)
        
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """Get sent messages."""
        messages = self.get_queryset().filter(sender=request.user)
        
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark message as read."""
        message = self.get_object()
        
        if message.recipient != request.user:
            return Response(
                {'error': 'Vous ne pouvez marquer que vos propres messages comme lus.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not message.is_read:
            message.is_read = True
            message.read_at = timezone.now()
            message.save()
        
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread messages."""
        count = Message.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({'unread_count': count})
