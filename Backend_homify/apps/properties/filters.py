"""
Filters for properties.
"""
import math

import django_filters

from .models import Property


class PropertyFilter(django_filters.FilterSet):
    """Filter for Property model."""

    min_price = django_filters.NumberFilter(field_name='monthly_rent', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='monthly_rent', lookup_expr='lte')
    min_surface = django_filters.NumberFilter(field_name='surface', lookup_expr='gte')
    city = django_filters.CharFilter(field_name='address__city', lookup_expr='icontains')
    district = django_filters.CharFilter(field_name='address__district', lookup_expr='icontains')
    lat = django_filters.NumberFilter(method='filter_by_geo')
    lng = django_filters.NumberFilter(method='filter_by_geo')
    radius_km = django_filters.NumberFilter(method='filter_by_geo')

    class Meta:
        model = Property
        fields = ['type', 'furnished', 'number_of_rooms', 'number_of_bedrooms', 'number_of_bathrooms']

    def filter_by_geo(self, queryset, name, value):
        """Filter properties within radius_km of lat/lng (Haversine)."""
        if getattr(self, '_geo_filtered', False):
            return queryset

        raw_lat = self.data.get('lat')
        raw_lng = self.data.get('lng')
        if raw_lat in (None, '') or raw_lng in (None, ''):
            return queryset

        try:
            lat = float(raw_lat)
            lng = float(raw_lng)
            radius_km = float(self.data.get('radius_km') or 10)
        except (TypeError, ValueError):
            return queryset

        if radius_km <= 0:
            return queryset

        self._geo_filtered = True

        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * max(math.cos(math.radians(lat)), 0.01))

        candidates = queryset.filter(
            address__latitude__isnull=False,
            address__longitude__isnull=False,
            address__latitude__gte=lat - lat_delta,
            address__latitude__lte=lat + lat_delta,
            address__longitude__gte=lng - lng_delta,
            address__longitude__lte=lng + lng_delta,
        ).select_related('address')

        matching_ids = []
        for prop in candidates:
            distance = self._haversine_km(lat, lng, prop.address.latitude, prop.address.longitude)
            if distance <= radius_km:
                matching_ids.append(prop.id)

        return queryset.filter(id__in=matching_ids)

    @staticmethod
    def _haversine_km(lat1, lng1, lat2, lng2):
        earth_radius = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lng = math.radians(lng2 - lng1)
        a = (
            math.sin(d_lat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(d_lng / 2) ** 2
        )
        return earth_radius * 2 * math.asin(math.sqrt(a))
