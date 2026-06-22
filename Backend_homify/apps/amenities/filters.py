"""
Filters for amenities.
"""
import django_filters

from .models import Amenity


class AmenityFilter(django_filters.FilterSet):
    """Filter amenities by category."""

    category = django_filters.ChoiceFilter(choices=Amenity.CATEGORY_CHOICES)

    class Meta:
        model = Amenity
        fields = ['category']
