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

export interface Photo {
  id: number;
  url: string;
  thumbnail_url: string;
  is_primary: boolean;
  order: number;
}

export interface PrimaryPhoto {
  id: number;
  url: string;
  thumbnail_url: string;
  is_primary: boolean;
}

export interface LandlordPublic {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  masked_phone: string;
  role?: string;
}

export interface LandlordFull extends LandlordPublic {
  email: string;
  phone: string;
}

export interface AmenityItem {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface ApiProperty {
  id: number;
  title: string;
  type: 'HOUSE' | 'APARTMENT' | 'STUDIO' | 'ROOM';
  monthly_rent: string;
  surface: number;
  number_of_rooms: number;
  number_of_bedrooms?: number;
  address: Address;
  primary_photo: PrimaryPhoto | null;
  furnished: boolean;
  published_at: string;
  is_favorite: boolean;
}

export interface ApiPropertyDetail extends ApiProperty {
  description: string;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  floor?: number | null;
  charges?: string;
  charges_included: boolean;
  deposit?: string;
  agency_fees?: string;
  photos: Photo[];
  amenities: AmenityItem[];
  landlord: LandlordPublic | LandlordFull;
  view_count: number;
  status: string;
  updated_at: string;
}

export interface PaginatedResponse<T = ApiProperty> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiFavoriteItem {
  id: number;
  property: ApiProperty;
  created_at: string;
}

export type FavoritesResponse = PaginatedResponse<ApiFavoriteItem>;

export interface ApiMessage {
  id: number;
  property: number;
  sender: { id: number; first_name: string; last_name: string; full_name?: string };
  recipient: { id: number; first_name: string; last_name: string; full_name?: string };
  subject: string;
  content: string;
  is_read: boolean;
  sent_at: string;
  read_at: string | null;
}

export interface UnreadCountResponse {
  unread_count: number;
}
