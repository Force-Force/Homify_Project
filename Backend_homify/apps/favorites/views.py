"""
Views for favorites app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Favorite
from .serializers import FavoriteSerializer
from apps.properties.models import Property


class FavoriteViewSet(viewsets.ModelViewSet):
    """ViewSet for Favorite model."""
    
    serializer_class = FavoriteSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        """Get current user's favorites."""
        return Favorite.objects.filter(user=self.request.user).select_related('property')
    
    def create(self, request, *args, **kwargs):
        """Add property to favorites."""
        property_id = request.data.get('property_id')
        
        if not property_id:
            return Response(
                {'error': 'property_id est requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            property_obj = Property.objects.get(id=property_id, status='PUBLISHED')
        except Property.DoesNotExist:
            return Response(
                {'error': 'Propriété non trouvée.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already in favorites
        if Favorite.objects.filter(user=request.user, property=property_obj).exists():
            return Response(
                {'error': 'Cette propriété est déjà dans vos favoris.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        favorite = Favorite.objects.create(user=request.user, property=property_obj)
        serializer = self.get_serializer(favorite)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['delete'], url_path='(?P<property_id>[^/.]+)')
    def remove_by_property(self, request, property_id=None):
        """Remove property from favorites by property ID."""
        try:
            favorite = Favorite.objects.get(user=request.user, property_id=property_id)
            favorite.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Favorite.DoesNotExist:
            return Response(
                {'error': 'Favori non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )
