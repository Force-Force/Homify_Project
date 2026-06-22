"""
Serializers for Property models.
"""
from rest_framework import serializers

from apps.core.exceptions import PropertyLifecycleError
from apps.core.services import PropertyLifecycleService

from .models import Property, Address, Photo
from apps.users.serializers import UserSerializer, LandlordPublicSerializer


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address model."""
    
    full_address = serializers.CharField(source='get_full_address', read_only=True)
    
    class Meta:
        model = Address
        fields = ('id', 'street_address', 'city', 'postal_code', 'district', 
                  'latitude', 'longitude', 'full_address')


class PhotoSerializer(serializers.ModelSerializer):
    """Serializer for Photo model."""
    
    url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Photo
        fields = ('id', 'url', 'thumbnail_url', 'is_primary', 'order', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')
    
    def get_url(self, obj):
        """Get full URL for image."""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_thumbnail_url(self, obj):
        """Get full URL for thumbnail."""
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        elif obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class PropertyListSerializer(serializers.ModelSerializer):
    """Serializer for Property list view."""
    
    address = AddressSerializer(read_only=True)
    primary_photo = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ('id', 'title', 'type', 'monthly_rent', 'surface', 'number_of_rooms',
                  'address', 'primary_photo', 'furnished', 'published_at', 'is_favorite')
    
    def get_primary_photo(self, obj):
        """Get primary photo."""
        photo = obj.photos.filter(is_primary=True).first()
        if not photo:
            photo = obj.photos.first()
        
        if photo:
            return PhotoSerializer(photo, context=self.context).data
        return None
    
    def get_is_favorite(self, obj):
        """Check if property is in user's favorites."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorites.filter(user=request.user).exists()
        return False


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Serializer for Property detail view."""
    
    address = AddressSerializer(read_only=True)
    photos = PhotoSerializer(many=True, read_only=True)
    landlord = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ('id', 'title', 'description', 'type', 'surface', 'number_of_rooms',
                  'number_of_bedrooms', 'number_of_bathrooms', 'floor', 'furnished',
                  'monthly_rent', 'charges', 'charges_included', 'deposit', 'agency_fees',
                  'address', 'photos', 'amenities', 'landlord', 'view_count', 'status',
                  'rejection_reason', 'published_at', 'updated_at', 'is_favorite')

    def get_landlord(self, obj):
        """Full contact for owner/admin; masked phone for public viewers."""
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        if user and (user.role == 'ADMIN' or obj.landlord_id == user.id):
            return UserSerializer(obj.landlord).data
        return LandlordPublicSerializer(obj.landlord).data
    
    def get_amenities(self, obj):
        """Get property amenities."""
        from apps.amenities.serializers import AmenitySerializer
        return AmenitySerializer(obj.amenities.all(), many=True).data
    
    def get_is_favorite(self, obj):
        """Check if property is in user's favorites."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorites.filter(user=request.user).exists()
        return False


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating properties."""
    
    address = AddressSerializer()
    amenity_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Property
        fields = ('id', 'title', 'description', 'type', 'surface', 'number_of_rooms',
                  'number_of_bedrooms', 'number_of_bathrooms', 'floor', 'furnished',
                  'monthly_rent', 'charges', 'charges_included', 'deposit', 'agency_fees',
                  'address', 'amenity_ids', 'status')
        read_only_fields = ('id',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and getattr(request.user, 'role', None) == 'LANDLORD':
            self.fields['status'].read_only = True

    def validate_status(self, value):
        """Landlords cannot set admin-only statuses."""
        request = self.context.get('request')
        if request and request.user.role == 'LANDLORD':
            if value in PropertyLifecycleService.ADMIN_ONLY_STATUSES:
                raise serializers.ValidationError(
                    'Ce statut ne peut être défini que par un administrateur.'
                )
            if value not in PropertyLifecycleService.LANDLORD_WRITABLE_STATUSES:
                raise serializers.ValidationError(f'Statut « {value} » non autorisé.')
        return value

    def create(self, validated_data):
        """Create property with address and amenities."""
        address_data = validated_data.pop('address')
        amenity_ids = validated_data.pop('amenity_ids', [])
        user = self.context['request'].user

        requested_status = validated_data.pop('status', None)
        validated_data['status'] = PropertyLifecycleService.resolve_initial_status(
            user, requested_status
        )
        validated_data['landlord'] = user

        property_obj = Property.objects.create(**validated_data)
        Address.objects.create(property=property_obj, **address_data)

        if amenity_ids:
            from apps.amenities.models import Amenity
            amenities = Amenity.objects.filter(id__in=amenity_ids)
            property_obj.amenities.set(amenities)

        return property_obj

    def update(self, instance, validated_data):
        """Update property with address and amenities."""
        address_data = validated_data.pop('address', None)
        amenity_ids = validated_data.pop('amenity_ids', None)
        user = self.context['request'].user

        new_status = validated_data.get('status')
        if new_status is not None and user.role == 'LANDLORD':
            try:
                PropertyLifecycleService.validate_landlord_status_change(instance, new_status)
            except PropertyLifecycleError as exc:
                raise serializers.ValidationError({'status': exc.message}) from exc

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if address_data:
            Address.objects.update_or_create(property=instance, defaults=address_data)

        if amenity_ids is not None:
            from apps.amenities.models import Amenity
            amenities = Amenity.objects.filter(id__in=amenity_ids)
            instance.amenities.set(amenities)

        return instance
