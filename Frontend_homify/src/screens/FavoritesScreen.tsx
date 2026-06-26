import React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FavoriteCard } from '../components/Cards';
import { Hotel } from '../types';
import { getFavorites, removeFromFavorites } from '../services/propertyService';
import { PageHeader } from '@/components/layout/PageHeader';
import { StaggeredItem } from '@/components/ui/StaggeredItem';
import { useFavorites } from '@/context/FavoritesContext';
import { ApiError } from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';

export default function FavoritesScreen() {
  const { t } = useTranslation();
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
        setError(t('favorites.sessionExpired'));
      } else {
        setError(t('favorites.loadError'));
      }
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      <PageHeader greeting={t('favorites.greeting')} title={t('favorites.title')} />

      <div className="flex justify-between items-end mb-5">
        <h2 className="text-lg font-bold text-homify-text flex items-center gap-2">
          <Heart className="w-5 h-5 text-homify-accent fill-homify-accent" />
          {t('favorites.savedListings')}
        </h2>
        <span className="text-homify-primary text-sm font-semibold">
          {t('favorites.count', { count: favorites.length })}
        </span>
      </div>

      {(error || authError) && (
        <div className="p-3.5 bg-red-50 text-red-600 rounded-btn text-sm text-center mb-4 border border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
          {error || authError}
        </div>
      )}

      {!loading && favorites.length === 0 && !error && !authError ? (
        <div className="flex flex-col items-center justify-center py-20 text-homify-muted">
          <p className="font-medium text-homify-text mb-1">{t('favorites.emptyTitle')}</p>
          <p className="text-sm">{t('favorites.emptyHint')}</p>
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
