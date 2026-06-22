"""
Favorite management and cleanup when properties leave the catalog.
"""
from apps.core.exceptions import BusinessLogicError


class FavoriteService:
    """Favorite add/remove and lifecycle cleanup."""

    VISIBLE_STATUSES = frozenset({'PUBLISHED'})

    @classmethod
    def add(cls, user, property_obj):
        from apps.favorites.models import Favorite

        if property_obj.status not in cls.VISIBLE_STATUSES:
            raise BusinessLogicError(
                'Seules les annonces publiées peuvent être ajoutées aux favoris.',
                code='property_not_favoritable',
            )
        if Favorite.objects.filter(user=user, property=property_obj).exists():
            raise BusinessLogicError(
                'Cette propriété est déjà dans vos favoris.',
                code='duplicate_favorite',
            )
        return Favorite.objects.create(user=user, property=property_obj)

    @classmethod
    def remove_by_property(cls, user, property_id):
        from apps.favorites.models import Favorite

        try:
            favorite = Favorite.objects.get(user=user, property_id=property_id)
        except Favorite.DoesNotExist:
            raise BusinessLogicError(
                'Favori non trouvé.',
                code='favorite_not_found',
            ) from None
        favorite.delete()

    @classmethod
    def prune_for_property(cls, property_obj):
        """Remove all favorites when a property is no longer published."""
        from apps.favorites.models import Favorite

        Favorite.objects.filter(property=property_obj).delete()
