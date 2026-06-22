import { API_ROUTES } from '../api/routes';
import {
  ApiProperty,
  ApiPropertyDetail,
  FavoritesResponse,
  PaginatedResponse,
} from '../types/api';
import { Hotel } from '../types/index';
import { apiFetch } from './apiClient';

const TYPE_LABELS: Record<string, string> = {
  HOUSE: 'Maison',
  APARTMENT: 'Appart.',
  STUDIO: 'Studio',
  ROOM: 'Chambre',
};

const formatPrice = (rent: string) =>
  `${parseInt(rent, 10).toLocaleString('fr-FR')} FCFA`;

const fallbackImage =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';

export const transformApiToHotel = (apiProp: ApiProperty): Hotel => {
  const beds = apiProp.number_of_bedrooms ?? apiProp.number_of_rooms ?? 0;

  return {
    id: apiProp.id,
    name: apiProp.title,
    type: TYPE_LABELS[apiProp.type] ?? apiProp.type,
    location: [apiProp.address.district, apiProp.address.city].filter(Boolean).join(', '),
    price: parseFloat(apiProp.monthly_rent),
    displayPrice: formatPrice(apiProp.monthly_rent),
    rating: 0,
    imageUrl: apiProp.primary_photo?.url || fallbackImage,
    description: apiProp.furnished ? 'Logement meublé' : 'Logement non meublé',
    amenities: {
      beds,
      sqft: apiProp.surface,
    },
    coordinates: {
      lat: apiProp.address.latitude,
      lng: apiProp.address.longitude,
    },
    isFavorite: apiProp.is_favorite,
    furnished: apiProp.furnished,
  };
};

export const transformDetailToHotel = (detail: ApiPropertyDetail): Hotel => {
  const base = transformApiToHotel(detail);

  return {
    ...base,
    description: detail.description,
    rating: 0,
    amenities: {
      beds: detail.number_of_bedrooms ?? detail.number_of_rooms,
      baths: detail.number_of_bathrooms,
      sqft: detail.surface,
      items: detail.amenities?.map((a) => a.name) ?? [],
    },
    photos: detail.photos.map((p) => ({
      id: p.id,
      url: p.url,
      thumbnailUrl: p.thumbnail_url,
    })),
    imageUrl: detail.photos.find((p) => p.is_primary)?.url || detail.photos[0]?.url || base.imageUrl,
    landlord: {
      id: detail.landlord.id,
      name: detail.landlord.full_name || `${detail.landlord.first_name} ${detail.landlord.last_name}`,
      maskedPhone: 'masked_phone' in detail.landlord ? detail.landlord.masked_phone : undefined,
      phone: 'phone' in detail.landlord ? detail.landlord.phone : undefined,
    },
    viewCount: detail.view_count,
    charges: detail.charges,
    deposit: detail.deposit,
    isFavorite: detail.is_favorite,
  };
};

export const getProperties = async (filters = ''): Promise<Hotel[]> => {
  const query = filters.startsWith('?') ? filters : filters ? `?${filters}` : '';
  const data = await apiFetch<PaginatedResponse>(`${API_ROUTES.properties.list}${query}`);
  return data.results.map(transformApiToHotel);
};

export const getPropertyById = async (id: number): Promise<Hotel> => {
  const data = await apiFetch<ApiPropertyDetail>(API_ROUTES.properties.details(id));
  return transformDetailToHotel(data);
};

export const getFavorites = async (): Promise<Hotel[]> => {
  const data = await apiFetch<FavoritesResponse>(API_ROUTES.favorites.list);
  return data.results.map((item) => transformApiToHotel(item.property));
};

export const addToFavorites = async (propertyId: number): Promise<boolean> => {
  await apiFetch(API_ROUTES.favorites.add, {
    method: 'POST',
    body: JSON.stringify({ property_id: propertyId }),
  });
  return true;
};

export const removeFromFavorites = async (propertyId: number): Promise<boolean> => {
  await apiFetch(API_ROUTES.favorites.remove(propertyId), { method: 'DELETE' });
  return true;
};
