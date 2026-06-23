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
    status: (apiProp as ApiProperty & { status?: string }).status,
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
    status: detail.status,
    rejectionReason: detail.rejection_reason,
  };
};

export interface PropertySearchResult {
  results: Hotel[];
  count: number;
  next: string | null;
  previous: string | null;
}

export const searchProperties = async (filters = '', page = 1): Promise<PropertySearchResult> => {
  const base = filters.startsWith('?') ? filters.slice(1) : filters;
  const params = new URLSearchParams(base);
  params.set('page', String(page));
  const data = await apiFetch<PaginatedResponse>(`${API_ROUTES.properties.list}?${params}`);
  return {
    results: data.results.map(transformApiToHotel),
    count: data.count,
    next: data.next,
    previous: data.previous,
  };
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PENDING: 'En modération',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  PUBLISHED: 'Publié',
  RENTED: 'Loué',
  DELETED: 'Supprimé',
};

export interface PropertyFormPayload {
  title: string;
  description: string;
  type: string;
  surface: number;
  number_of_rooms: number;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  furnished: boolean;
  monthly_rent: string;
  charges: string;
  charges_included: boolean;
  deposit: string;
  agency_fees: string;
  address: {
    street_address: string;
    city: string;
    postal_code: string;
    district: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  amenity_ids: number[];
}

export const getPropertyById = async (id: number): Promise<Hotel> => {
  const data = await apiFetch<ApiPropertyDetail>(API_ROUTES.properties.details(id));
  return transformDetailToHotel(data);
};

export const getPropertyDetailRaw = async (id: number): Promise<ApiPropertyDetail> => {
  return apiFetch<ApiPropertyDetail>(API_ROUTES.properties.details(id));
};

export const getProperties = async (filters = ''): Promise<Hotel[]> => {
  const { results } = await searchProperties(filters, 1);
  return results;
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

export const getMyProperties = async (): Promise<Hotel[]> => {
  const data = await apiFetch<PaginatedResponse>(API_ROUTES.properties.myProperties);
  return data.results.map(transformApiToHotel);
};

export const createProperty = async (payload: PropertyFormPayload): Promise<{ id: number }> => {
  return apiFetch<{ id: number }>(API_ROUTES.properties.list, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateProperty = async (id: number, payload: Partial<PropertyFormPayload>): Promise<void> => {
  await apiFetch(API_ROUTES.properties.details(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const uploadPropertyPhotos = async (propertyId: number, files: File[]): Promise<void> => {
  const form = new FormData();
  files.forEach((file) => form.append('photos', file));
  await apiFetch(API_ROUTES.properties.uploadPhotos(propertyId), {
    method: 'POST',
    body: form,
  });
};

export const submitPropertyForReview = async (propertyId: number): Promise<void> => {
  await apiFetch(API_ROUTES.properties.submitForReview(propertyId), { method: 'POST' });
};

export const markPropertyRented = async (propertyId: number): Promise<void> => {
  await apiFetch(API_ROUTES.properties.markRented(propertyId), { method: 'POST' });
};

export const deleteProperty = async (propertyId: number): Promise<void> => {
  await apiFetch(API_ROUTES.properties.details(propertyId), { method: 'DELETE' });
};

export const getSimilarProperties = async (propertyId: number): Promise<Hotel[]> => {
  const data = await apiFetch<import('../types/api').ApiProperty[]>(
    API_ROUTES.properties.similar(propertyId),
  );
  return data.map(transformApiToHotel);
};

export const deletePropertyPhoto = async (propertyId: number, photoId: number): Promise<void> => {
  await apiFetch(API_ROUTES.properties.deletePhoto(propertyId, photoId), { method: 'DELETE' });
};
