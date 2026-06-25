"""
Views for messages app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from apps.core.exceptions import MessagingPolicyError
from apps.core.services import MessagingPolicyService
from apps.core.utils import business_error_response

from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer, ConversationSerializer


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for Message model."""

    permission_classes = (IsAuthenticated,)
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        """Get messages for current user."""
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).select_related('sender', 'recipient', 'property')

    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        output = MessageSerializer(message, context=self.get_serializer_context())
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        return Response(
            {'error': 'Les messages ne peuvent pas être modifiés.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        try:
            MessagingPolicyService.validate_delete(request.user, message)
        except MessagingPolicyError as exc:
            return business_error_response(exc, http_status=status.HTTP_403_FORBIDDEN)
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

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
                status=status.HTTP_403_FORBIDDEN,
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
            is_read=False,
        ).count()

        return Response({'unread_count': count})

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Grouped threads — one entry per property the user participates in."""
        user = request.user
        base_qs = self.get_queryset()
        property_ids = (
            base_qs.values_list('property_id', flat=True)
            .distinct()
            .order_by('-property_id')
        )

        threads = []
        for property_id in property_ids:
            thread_messages = (
                base_qs.filter(property_id=property_id)
                .select_related('sender', 'recipient', 'property', 'property__landlord')
                .order_by('-sent_at')
            )
            last_message = thread_messages.first()
            if not last_message:
                continue

            if last_message.sender_id == user.id:
                contact = last_message.recipient
            else:
                contact = last_message.sender

            unread_count = thread_messages.filter(recipient=user, is_read=False).count()

            threads.append({
                'property_id': property_id,
                'property_detail': last_message.property,
                'contact': contact,
                'last_message': last_message,
                'unread_count': unread_count,
                'updated_at': last_message.sent_at,
            })

        threads.sort(key=lambda item: item['updated_at'], reverse=True)
        serializer = ConversationSerializer(threads, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='thread/(?P<property_id>[^/.]+)/mark_read')
    def mark_thread_read(self, request, property_id=None):
        """Mark all messages in a property thread as read for the current user."""
        updated = Message.objects.filter(
            property_id=property_id,
            recipient=request.user,
            is_read=False,
        ).update(is_read=True, read_at=timezone.now())
        return Response({'marked_read': updated})

    @action(detail=False, methods=['get'], url_path='thread/(?P<property_id>[^/.]+)')
    def thread(self, request, property_id=None):
        """Messages for a property thread visible to the current user."""
        messages = self.get_queryset().filter(property_id=property_id).order_by('sent_at')

        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
