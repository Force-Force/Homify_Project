"""
Views for favorites app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.core.exceptions import BusinessLogicError
from apps.core.services import FavoriteService
from apps.core.utils import business_error_response

from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteViewSet(viewsets.ModelViewSet):
    """ViewSet for Favorite model."""

    serializer_class = FavoriteSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        """Only show favorites for currently published properties."""
        return Favorite.objects.filter(
            user=self.request.user,
            property__status__in=FavoriteService.VISIBLE_STATUSES,
        ).select_related('property')

    def create(self, request, *args, **kwargs):
        """Add property to favorites."""
        property_id = request.data.get('property_id')

        if not property_id:
            return Response(
                {'error': 'property_id est requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from apps.properties.models import Property

        try:
            property_obj = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response(
                {'error': 'Propriété non trouvée.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            favorite = FavoriteService.add(request.user, property_obj)
        except BusinessLogicError as exc:
            return business_error_response(exc)

        serializer = self.get_serializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Disallow delete by favorite PK — use by-property route instead."""
        return Response(
            {
                'error': 'Utilisez DELETE /api/favorites/by-property/{property_id}/ '
                         'pour retirer un favori.',
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=False, methods=['delete'], url_path='by-property/(?P<property_id>[^/.]+)')
    def remove_by_property(self, request, property_id=None):
        """Remove property from favorites by property ID."""
        try:
            FavoriteService.remove_by_property(request.user, property_id)
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response(status=status.HTTP_204_NO_CONTENT)
