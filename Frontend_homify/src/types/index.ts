export interface PropertyPhoto {
  id: number;
  url: string;
  thumbnailUrl?: string;
}

export interface LandlordInfo {
  id: number;
  name: string;
  maskedPhone?: string;
  phone?: string;
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  displayPrice?: string;
  rating: number;
  imageUrl: string;
  type?: string;
  description?: string;
  discount?: string;
  amenities?: {
    beds?: number;
    baths?: number;
    sqft?: number;
    kitchen?: number;
    items?: string[];
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  isFavorite: boolean;
  photos?: PropertyPhoto[];
  landlord?: LandlordInfo;
  furnished?: boolean;
  viewCount?: number;
  charges?: string;
  deposit?: string;
  status?: string;
  rejectionReason?: string;
}
