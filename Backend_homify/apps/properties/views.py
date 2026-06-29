"""
Views for properties app.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from apps.billing.services import BillingService
from apps.core.exceptions import BusinessLogicError
from apps.core.utils import business_error_response
from apps.core.services import PropertyLifecycleService, PropertyMediaService, PropertyViewService, NotificationService

from .models import Property, Photo
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer,
    PropertyCreateUpdateSerializer, PhotoSerializer
)
from .filters import PropertyFilter
from .permissions import IsLandlordOrReadOnly, IsPropertyOwnerOrAdmin
from apps.users.permissions import IsAdmin


class PropertyViewSet(viewsets.ModelViewSet):
    """ViewSet for Property model."""

    permission_classes = (IsAuthenticatedOrReadOnly, IsLandlordOrReadOnly)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = PropertyFilter
    search_fields = ('title', 'description', 'address__city', 'address__district')
    ordering_fields = ('created_at', 'monthly_rent', 'surface', 'view_count')
    ordering = ('-created_at',)

    def get_queryset(self):
        """Get queryset based on user role."""
        user = self.request.user

        if user.is_authenticated and user.role == 'ADMIN':
            return Property.objects.exclude(status='DELETED').select_related(
                'address', 'landlord'
            ).prefetch_related('photos', 'amenities')
        if user.is_authenticated and user.role == 'LANDLORD':
            return Property.objects.filter(
                Q(landlord=user) | Q(status='PUBLISHED')
            ).exclude(status='DELETED').select_related(
                'address', 'landlord'
            ).prefetch_related('photos', 'amenities')
        return Property.objects.filter(status='PUBLISHED').select_related(
            'address', 'landlord'
        ).prefetch_related('photos', 'amenities')

    def filter_queryset(self, queryset):
        qs = super().filter_queryset(queryset)
        if self.action != 'list':
            return qs
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in ('-created_at', 'created_at', ''):
            return BillingService.apply_boost_ordering(qs)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        if self.action == 'retrieve':
            return PropertyDetailSerializer
        return PropertyCreateUpdateSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsPropertyOwnerOrAdmin()]
        return super().get_permissions()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        PropertyViewService.record_view(instance, request)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Soft delete — status DELETED instead of hard delete."""
        property_obj = self.get_object()
        try:
            PropertyLifecycleService.soft_delete(property_obj)
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_properties(self, request):
        properties = Property.objects.filter(
            landlord=request.user
        ).exclude(status='DELETED').select_related('address', 'landlord').prefetch_related('photos')

        page = self.paginate_queryset(properties)
        if page is not None:
            serializer = PropertyListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = PropertyListSerializer(properties, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit_for_review(self, request, pk=None):
        """Landlord submits DRAFT/REJECTED property for moderation."""
        property_obj = self.get_object()
        if property_obj.landlord != request.user and request.user.role != 'ADMIN':
            return Response(
                {'error': 'Permission refusée.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            PropertyLifecycleService.submit_for_review(property_obj)
        except BusinessLogicError as exc:
            return business_error_response(exc)
        serializer = PropertyDetailSerializer(property_obj, context={'request': request})
        return Response({
            'message': 'Annonce soumise pour modération.',
            'property': serializer.data,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_rented(self, request, pk=None):
        """Landlord marks a published property as rented."""
        property_obj = self.get_object()
        if property_obj.landlord != request.user and request.user.role != 'ADMIN':
            return Response(
                {'error': 'Permission refusée.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            PropertyLifecycleService.mark_rented(property_obj)
        except BusinessLogicError as exc:
            return business_error_response(exc)
        serializer = PropertyDetailSerializer(property_obj, context={'request': request})
        return Response({
            'message': 'Annonce marquée comme louée.',
            'property': serializer.data,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_photos(self, request, pk=None):
        property_obj = self.get_object()

        if property_obj.landlord != request.user and request.user.role != 'ADMIN':
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette annonce.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        files = request.FILES.getlist('photos')
        existing_count = property_obj.photos.count()

        try:
            PropertyMediaService.validate_upload_batch(files, existing_count=existing_count)
        except BusinessLogicError as exc:
            return business_error_response(exc)

        photos = []
        for index, file in enumerate(files):
            photo = Photo.objects.create(
                property=property_obj,
                image=file,
                order=existing_count + index,
                is_primary=(existing_count == 0 and index == 0),
            )
            PropertyMediaService.schedule_thumbnail_generation(photo.id)
            photos.append(photo)

        serializer = PhotoSerializer(photos, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='photos/(?P<photo_id>[^/.]+)')
    def delete_photo(self, request, pk=None, photo_id=None):
        property_obj = self.get_object()

        if property_obj.landlord != request.user and request.user.role != 'ADMIN':
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette annonce.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            photo = property_obj.photos.get(id=photo_id)
            photo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Photo.DoesNotExist:
            return Response({'error': 'Photo non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        property_obj = self.get_object()

        if not hasattr(property_obj, 'address'):
            return Response([])

        similar_properties = Property.objects.filter(
            status='PUBLISHED',
            type=property_obj.type,
            address__city=property_obj.address.city,
        ).exclude(id=property_obj.id)[:6]

        serializer = PropertyListSerializer(
            similar_properties, many=True, context={'request': request}
        )
        return Response(serializer.data)


class AdminPropertyViewSet(viewsets.ModelViewSet):
    """Admin viewset for property moderation."""

    queryset = Property.objects.exclude(status='DELETED').select_related('address', 'landlord')
    serializer_class = PropertyDetailSerializer
    permission_classes = (IsAuthenticated, IsAdmin)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ('status', 'type', 'landlord')
    search_fields = ('title', 'landlord__email')

    @action(detail=False, methods=['get'])
    def pending(self, request):
        pending_properties = self.get_queryset().filter(status='PENDING')

        page = self.paginate_queryset(pending_properties)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(pending_properties, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """PENDING → APPROVED."""
        property_obj = self.get_object()
        try:
            PropertyLifecycleService.approve(property_obj)
        except BusinessLogicError as exc:
            return business_error_response(exc)

        NotificationService.notify_property_approved(property_obj.id)
        serializer = self.get_serializer(property_obj)
        return Response({
            'message': 'Annonce approuvée.',
            'property': serializer.data,
        })

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """APPROVED → PUBLISHED."""
        property_obj = self.get_object()
        try:
            PropertyLifecycleService.publish(property_obj)
        except BusinessLogicError as exc:
            return business_error_response(exc)

        NotificationService.notify_property_published(property_obj.id)
        serializer = self.get_serializer(property_obj)
        return Response({
            'message': 'Annonce publiée.',
            'property': serializer.data,
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """PENDING → REJECTED."""
        property_obj = self.get_object()
        reason = request.data.get('reason', '')

        try:
            PropertyLifecycleService.reject(property_obj, reason=reason)
        except BusinessLogicError as exc:
            return business_error_response(exc)

        NotificationService.notify_property_rejected(property_obj.id, reason=reason)
        serializer = self.get_serializer(property_obj)
        return Response({
            'message': 'Annonce rejetée.',
            'property': serializer.data,
        })

    @action(detail=True, methods=['post'])
    def mark_rented(self, request, pk=None):
        """PUBLISHED → RENTED."""
        property_obj = self.get_object()
        try:
            PropertyLifecycleService.mark_rented(property_obj)
        except BusinessLogicError as exc:
            return business_error_response(exc)
        serializer = self.get_serializer(property_obj)
        return Response({
            'message': 'Annonce marquée comme louée.',
            'property': serializer.data,
        })

    def destroy(self, request, *args, **kwargs):
        property_obj = self.get_object()
        PropertyLifecycleService.soft_delete(property_obj)
        return Response(status=status.HTTP_204_NO_CONTENT)
