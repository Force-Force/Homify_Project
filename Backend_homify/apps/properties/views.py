"""
Views for properties app.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
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
            # Admin sees all properties
            return Property.objects.select_related('address', 'landlord').prefetch_related('photos', 'amenities')
        elif user.is_authenticated and user.role == 'LANDLORD':
            # Landlord sees their own properties + published ones
            return Property.objects.filter(
                Q(landlord=user) | Q(status='PUBLISHED')
            ).select_related('address', 'landlord').prefetch_related('photos', 'amenities')
        else:
            # Others see only published properties
            return Property.objects.filter(
                status='PUBLISHED'
            ).select_related('address', 'landlord').prefetch_related('photos', 'amenities')
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action == 'retrieve':
            return PropertyDetailSerializer
        return PropertyCreateUpdateSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsPropertyOwnerOrAdmin()]
        return super().get_permissions()
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve property and increment view count."""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_properties(self, request):
        """Get current user's properties."""
        properties = self.get_queryset().filter(landlord=request.user)
        
        page = self.paginate_queryset(properties)
        if page is not None:
            serializer = PropertyListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PropertyListSerializer(properties, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_photos(self, request, pk=None):
        """Upload photos for a property."""
        property_obj = self.get_object()
        
        # Check permission
        if property_obj.landlord != request.user and request.user.role != 'ADMIN':
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette annonce.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        files = request.FILES.getlist('photos')
        
        if not files:
            return Response(
                {'error': 'Aucune photo fournie.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(files) > 10:
            return Response(
                {'error': 'Maximum 10 photos autorisées.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        photos = []
        for index, file in enumerate(files):
            photo = Photo.objects.create(
                property=property_obj,
                image=file,
                order=index,
                is_primary=(index == 0 and not property_obj.photos.exists())
            )
            photos.append(photo)
        
        serializer = PhotoSerializer(photos, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='photos/(?P<photo_id>[^/.]+)')
    def delete_photo(self, request, pk=None, photo_id=None):
        """Delete a photo from property."""
        property_obj = self.get_object()
        
        # Check permission
        if property_obj.landlord != request.user and request.user.role != 'ADMIN':
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette annonce.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            photo = property_obj.photos.get(id=photo_id)
            photo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Photo.DoesNotExist:
            return Response(
                {'error': 'Photo non trouvée.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get similar properties."""
        property_obj = self.get_object()
        
        similar_properties = Property.objects.filter(
            status='PUBLISHED',
            type=property_obj.type,
            address__city=property_obj.address.city
        ).exclude(id=property_obj.id)[:6]
        
        serializer = PropertyListSerializer(
            similar_properties,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class AdminPropertyViewSet(viewsets.ModelViewSet):
    """Admin viewset for property moderation."""
    
    queryset = Property.objects.all().select_related('address', 'landlord')
    serializer_class = PropertyDetailSerializer
    permission_classes = (IsAuthenticated, IsAdmin)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ('status', 'type', 'landlord')
    search_fields = ('title', 'landlord__email')
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get properties pending moderation."""
        pending_properties = self.get_queryset().filter(status='PENDING')
        
        page = self.paginate_queryset(pending_properties)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(pending_properties, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a property."""
        property_obj = self.get_object()
        
        if property_obj.status != 'PENDING':
            return Response(
                {'error': 'Seules les annonces en attente peuvent être approuvées.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        property_obj.status = 'PUBLISHED'
        from django.utils import timezone
        property_obj.published_at = timezone.now()
        property_obj.save()
        
        serializer = self.get_serializer(property_obj)
        return Response({
            'message': 'Annonce approuvée et publiée.',
            'property': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a property."""
        property_obj = self.get_object()
        
        if property_obj.status != 'PENDING':
            return Response(
                {'error': 'Seules les annonces en attente peuvent être rejetées.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', '')
        
        property_obj.status = 'REJECTED'
        property_obj.save()
        
        # TODO: Send notification to landlord with reason
        
        serializer = self.get_serializer(property_obj)
        return Response({
            'message': 'Annonce rejetée.',
            'property': serializer.data
        })
