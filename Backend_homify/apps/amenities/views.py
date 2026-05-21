"""
Views for amenities app.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Amenity
from .serializers import AmenitySerializer
from apps.users.permissions import IsAdmin


class AmenityViewSet(viewsets.ModelViewSet):
    """ViewSet for Amenity model."""
    
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    
    def get_permissions(self):
        """Only admins can create/update/delete amenities."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()
