// Fichier: src/screens/FavoritesScreen.tsx
import { useEffect, useState } from 'react';
import { Loader2, HeartOff, Heart } from 'lucide-react';
import { FavoriteCard } from '../components/Cards';
import { Hotel } from '../types';
import { getFavorites } from '../services/propertyService';
import { PageHeader } from '@/components/layout/PageHeader';
import { StaggeredItem } from '@/components/ui/StaggeredItem';

interface FavProps {
  onHotelClick: (h: Hotel) => void;
}

export default function FavoritesScreen({ onHotelClick }: FavProps) {
  const [favorites, setFavorites] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      const data = await getFavorites();
      if (data) {
        setFavorites(data);
        setError(null);
      } else {
        setError('Impossible de charger les favoris.');
      }
      setLoading(false);
    };
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] pb-24">
        <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <PageHeader greeting="Bonjour" title="Mes favoris" />

      <div className="flex justify-between items-end mb-5">
        <h2 className="text-lg font-bold text-homify-text flex items-center gap-2">
          <Heart className="w-5 h-5 text-homify-accent fill-homify-accent" />
          Annonces sauvegardées
        </h2>
        <span className="text-homify-primary text-sm font-semibold">
          {favorites.length} enregistrée{favorites.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-600 rounded-btn text-sm text-center mb-4 border border-red-100">
          {error}
        </div>
      )}

      {!loading && favorites.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20 text-homify-muted">
          <div className="bg-homify-surface p-6 rounded-full mb-4 border border-homify-border">
            <HeartOff className="w-12 h-12 text-homify-muted/40" />
          </div>
          <p className="font-medium text-homify-text mb-1">Aucun favori pour l'instant</p>
          <p className="text-sm">Explorez les annonces et ajoutez vos coups de cœur ici.</p>
        </div>
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
          {favorites.map((hotel, index) => (
            <StaggeredItem key={hotel.id} index={index}>
              <FavoriteCard hotel={hotel} onClick={() => onHotelClick(hotel)} />
            </StaggeredItem>
          ))}
        </div>
      )}
    </div>
  );
}
