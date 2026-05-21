"""
Serializers for Property models.
"""
from rest_framework import serializers
from .models import Property, Address, Photo
from apps.users.serializers import UserSerializer


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
    landlord = UserSerializer(read_only=True)
    amenities = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ('id', 'title', 'description', 'type', 'surface', 'number_of_rooms',
                  'number_of_bedrooms', 'number_of_bathrooms', 'floor', 'furnished',
                  'monthly_rent', 'charges', 'charges_included', 'deposit', 'agency_fees',
                  'address', 'photos', 'amenities', 'landlord', 'view_count', 'status',
                  'published_at', 'updated_at', 'is_favorite')
    
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
    
    def create(self, validated_data):
        """Create property with address and amenities."""
        address_data = validated_data.pop('address')
        amenity_ids = validated_data.pop('amenity_ids', [])
        
        # Set landlord from request user
        validated_data['landlord'] = self.context['request'].user
        
        # Create property
        property_obj = Property.objects.create(**validated_data)
        
        # Create address
        Address.objects.create(property=property_obj, **address_data)
        
        # Add amenities
        if amenity_ids:
            from apps.amenities.models import Amenity
            amenities = Amenity.objects.filter(id__in=amenity_ids)
            property_obj.amenities.set(amenities)
        
        return property_obj
    
    def update(self, instance, validated_data):
        """Update property with address and amenities."""
        address_data = validated_data.pop('address', None)
        amenity_ids = validated_data.pop('amenity_ids', None)
        
        # Update property fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update address
        if address_data:
            Address.objects.update_or_create(
                property=instance,
                defaults=address_data
            )
        
        # Update amenities
        if amenity_ids is not None:
            from apps.amenities.models import Amenity
            amenities = Amenity.objects.filter(id__in=amenity_ids)
            instance.amenities.set(amenities)
        
        return instance
