"""
Views for amenities app.
"""
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.exceptions import BusinessLogicError
from apps.core.services import AmenityService
from apps.core.utils import business_error_response
from apps.users.permissions import IsAdmin

from .models import Amenity
from .serializers import AmenitySerializer
from .filters import AmenityFilter


class AmenityViewSet(viewsets.ModelViewSet):
    """ViewSet for Amenity model."""

    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = AmenityFilter
    search_fields = ('name',)
    ordering_fields = ('category', 'name')
    ordering = ('category', 'name')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        amenity = self.get_object()
        force = request.query_params.get('force', '').lower() in ('true', '1', 'yes')

        try:
            affected = AmenityService.delete(amenity, force=force)
        except BusinessLogicError as exc:
            return business_error_response(exc)

        return Response(
            {
                'message': 'Équipement supprimé.',
                'properties_affected': affected,
            },
            status=status.HTTP_200_OK,
        )
