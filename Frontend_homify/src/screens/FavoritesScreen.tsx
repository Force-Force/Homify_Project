import React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { RecommendedCard, FavoriteCard } from '../components/Cards';
import { Hotel } from '../types';
import { getFavorites, removeFromFavorites } from '../services/propertyService';
import { PageHeader } from '@/components/layout/PageHeader';
import { StaggeredItem } from '@/components/ui/StaggeredItem';
import { useFavorites } from '@/context/FavoritesContext';
import { ApiError } from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';

export default function FavoritesScreen() {
  const navigate = useNavigate();
  const { authError, refreshFavorites } = useFavorites();
  const [favorites, setFavorites] = React.useState<Hotel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadFavorites = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Session expirée. Reconnectez-vous pour voir vos favoris.');
      } else {
        setError('Impossible de charger les favoris.');
      }
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemove = async (propertyId: number) => {
    const ok = await removeFromFavorites(propertyId);
    if (ok) {
      setFavorites((prev) => prev.filter((f) => f.id !== propertyId));
      await refreshFavorites();
    }
  };

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

      {(error || authError) && (
        <div className="p-3.5 bg-red-50 text-red-600 rounded-btn text-sm text-center mb-4 border border-red-100">
          {error || authError}
        </div>
      )}

      {!loading && favorites.length === 0 && !error && !authError ? (
        <div className="flex flex-col items-center justify-center py-20 text-homify-muted">
          <p className="font-medium text-homify-text mb-1">Aucun favori pour l'instant</p>
          <p className="text-sm">Explorez les annonces et ajoutez vos coups de cœur ici.</p>
        </div>
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
          {favorites.map((hotel, index) => (
            <StaggeredItem key={hotel.id} index={index}>
              <FavoriteCard
                hotel={hotel}
                onClick={() => navigate(`/property/${hotel.id}`)}
                onRemove={() => handleRemove(hotel.id)}
              />
            </StaggeredItem>
          ))}
        </div>
      )}
    </div>
  );
}
