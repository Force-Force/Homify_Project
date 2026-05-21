// Fichier: src/screens/FavoritesScreen.tsx
// Fichier: src/screens/FavoritesScreen.tsx
import React, { useEffect, useState } from 'react';
import { Bell, Settings2, Loader2, HeartOff } from 'lucide-react';
import { FavoriteCard } from '../components/Cards';
import { Hotel } from '../types';
import { getFavorites } from '../services/propertyService'; // <--- Import du service

interface FavProps {
  onHotelClick: (h: Hotel) => void;
}

export default function FavoritesScreen({ onHotelClick }: FavProps) {
  // 1. États pour les données dynamiques
  const [favorites, setFavorites] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Récupération des données au chargement
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      // Appel à l'API
      const data = await getFavorites();
      
      if (data) {
        setFavorites(data);
      } else {
        setError("Impossible de charger les favoris.");
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  // 3. Gestion du chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen pb-24">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 animate-in slide-in-from-right-10 duration-300 pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
         <div>
            <p className="text-gray-400 text-sm">Good morning</p>
            {/* Nom statique pour l'instant, plus tard via l'API User */}
            <h1 className="text-xl font-bold text-gray-900">Sarah</h1>
         </div>
         <div className="flex gap-3">
             <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Bell className="w-6 h-6" /></button>
             <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Settings2 className="w-6 h-6" /></button>
         </div>
      </div>

      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-gray-900">Favorite Houses</h2>
        <span className="text-blue-500 text-sm font-medium">{favorites.length} saved</span>
      </div>

      {/* Gestion de l'affichage (Erreur, Vide ou Liste) */}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-xl text-center mb-4">
          {error}
        </div>
      )}

      {!loading && favorites.length === 0 && !error ? (
        // Cas où la liste est vide
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
           <div className="bg-gray-50 p-6 rounded-full mb-4">
             <HeartOff className="w-12 h-12 text-gray-300" />
           </div>
           <p>Vous n'avez pas encore de favoris.</p>
        </div>
      ) : (
        // Grille des favoris
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">
           {favorites.map((hotel) => (
              <FavoriteCard key={hotel.id} hotel={hotel} onClick={() => onHotelClick(hotel)} />
           ))}
        </div>
      )}
    </div>
  );
}