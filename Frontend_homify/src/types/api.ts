// Fichier: src/types/api.ts

export interface Address {
  id: number;
  street_address: string;
  city: string;
  postal_code: string;
  district: string;
  latitude: number;
  longitude: number;
  full_address: string;
}

export interface PrimaryPhoto {
  id: number;
  url: string;
  thumbnail_url: string;
  is_primary: boolean;
}

export interface ApiProperty {
  id: number;
  title: string;
  type: 'HOUSE' | 'APARTMENT' | 'STUDIO' | 'ROOM';
  monthly_rent: string; 
  surface: number;
  number_of_rooms: number;
  number_of_bedrooms: number;
  address: Address;
  primary_photo: PrimaryPhoto | null; 
  furnished: boolean;
  published_at: string;
  is_favorite: boolean;
}

export interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiProperty[];
}

export interface ApiFavoriteItem {
  id: number;
  property: ApiProperty;
  created_at: string;
}

export interface FavoritesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiFavoriteItem[];
}