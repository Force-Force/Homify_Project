"""
Amenity lifecycle rules — prevent silent removal from properties.
"""
from apps.core.exceptions import BusinessLogicError


class AmenityService:
    """Amenity management with explicit delete safeguards."""

    @classmethod
    def linked_properties_count(cls, amenity):
        return amenity.properties.exclude(status='DELETED').count()

    @classmethod
    def delete(cls, amenity, force=False):
        """
        Delete an amenity. Blocked when linked to active properties unless force=True.
        Returns the number of properties that were unlinked.
        """
        count = cls.linked_properties_count(amenity)
        if count > 0 and not force:
            raise BusinessLogicError(
                f'Cet équipement est utilisé par {count} annonce(s). '
                f'Passez ?force=true pour confirmer la suppression.',
                code='amenity_in_use',
                properties_count=count,
            )
        amenity.delete()
        return count
