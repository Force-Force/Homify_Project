export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  displayPrice?: string;
  rating: number;
  imageUrl: string;
  description?: string;
  discount?: string;
  amenities?: { 
    beds?: number; 
    baths?: number; 
    sqft?: number; 
    kitchen?: number 
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  isFavorite: boolean;
}