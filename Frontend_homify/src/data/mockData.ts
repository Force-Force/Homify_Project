import { Hotel } from '../types';

export const allHotels: Hotel[] = [
  {
    id: 1,
    name: "Modern Villa",
    location: "Beverly Hills, CA",
    price: 2500000,
    displayPrice: "$2.5M",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-2a4d9f0152ba?auto=format&fit=crop&q=80&w=800",
    description: "Experience luxury living in this stunning modern hideaway.",
    amenities: { beds: 4, baths: 3, sqft: 3200, kitchen: 1 }
  },
  {
    id: 2,
    name: "HarborHaven Hideaway",
    location: "1012 Ocean av, New York",
    price: 650,
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=600",
    description: "Featuring state-of-the-art amenities and breathtaking views.",
    amenities: { beds: 3, baths: 1, kitchen: 3 }
  },
  {
    id: 3,
    name: "Skyline Penthouse",
    location: "Manhattan, NY",
    price: 850000,
    displayPrice: "$850K",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    description: "High-end apartment in the heart of the city.",
    amenities: { beds: 2, baths: 2, sqft: 1800, kitchen: 1 }
  },
  {
    id: 4,
    name: "PrinstonHouse",
    location: "Nkolfoulou, Yde",
    price: 550,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600",
    amenities: { beds: 2, baths: 2, kitchen: 1 }
  }
];