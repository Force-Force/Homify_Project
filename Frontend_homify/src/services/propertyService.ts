// Fichier: src/services/propertyService.ts
import { PaginatedResponse, ApiProperty, FavoritesResponse } from '../types/api';
import { Hotel } from '../types/index'; 

const API_URL = 'http://localhost:8000/api'; 


const transformApiToHotel = (apiProp: ApiProperty): Hotel => {
  return {
    id: apiProp.id,
    name: apiProp.title,
    location: `${apiProp.address.district}, ${apiProp.address.city}`, // On combine quartier et ville
    price: parseFloat(apiProp.monthly_rent), // On convertit "450000.00" en nombre
    displayPrice: `${parseInt(apiProp.monthly_rent).toLocaleString()} FCFA`, // Format joli
    rating: 4.5, // Valeur par défaut car l'API ne fournit pas de note
    imageUrl: apiProp.primary_photo?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800', 
    description: `Surface: ${apiProp.surface}m² - ${apiProp.furnished ? 'Meublé' : 'Non meublé'}`,
    amenities: {
      beds: apiProp.number_of_bedrooms,
      
      sqft: apiProp.surface,
      
    },
    coordinates: {
      lat: apiProp.address.latitude,
      lng: apiProp.address.longitude
    },
    isFavorite: apiProp.is_favorite

  };
};

// --- LA FONCTION DE FETCH ---
export const getProperties = async (filters: string = ''): Promise<Hotel[]> => {
  try {
    const response = await fetch(`${API_URL}/properties/${filters}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des propriétés');
    }

    const data: PaginatedResponse = await response.json();
    
    return data.results.map(transformApiToHotel);
    
  } catch (error) {
    console.error("Erreur API:", error);
    return []; 
  }
};

export const getFavorites = async (): Promise<Hotel[]> => {
  try {
    // Note: Si tu as un token stocké (ex: localStorage), il faut l'ajouter ici
    // const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/favorites/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // <--- DÉCOMMENTER QUAND TU AURAS LE LOGIN
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des favoris');
    }

    const data: FavoritesResponse = await response.json();
    
    // ASTUCE : L'API renvoie { id: 1, property: { ... } }
    // On doit mapper sur "item.property" pour utiliser notre transformateur
    return data.results.map(item => transformApiToHotel(item.property));
    
  } catch (error) {
    console.error("Erreur Favoris:", error);
    return []; 
  }
};

export const addToFavorites = async (propertyId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/favorites/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId })
    });
    return response.ok; // Renvoie true si créé (201)
  } catch (error) {
    console.error("Erreur Add Favorite:", error);
    return false;
  }
};

export const removeFromFavorites = async (propertyId: number): Promise<boolean> => {
  try {
    // Note: L'API demande property_id dans l'URL
    const response = await fetch(`${API_URL}/favorites/${propertyId}/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok; // Renvoie true si supprimé (204)
  } catch (error) {
    console.error("Erreur Remove Favorite:", error);
    return false;
  }
};