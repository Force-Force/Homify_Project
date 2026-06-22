import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from '../services/propertyService';
import { ApiError } from '../services/apiClient';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favoriteIds: Set<number>;
  loading: boolean;
  authError: string | null;
  isFavorite: (propertyId: number) => boolean;
  toggleFavorite: (propertyId: number) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      setAuthError(null);
      return;
    }

    setLoading(true);
    try {
      const favorites = await getFavorites();
      setFavoriteIds(new Set(favorites.map((f) => f.id)));
      setAuthError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthError('Connectez-vous pour synchroniser vos favoris.');
      }
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = (propertyId: number) => favoriteIds.has(propertyId);

  const toggleFavorite = async (propertyId: number): Promise<boolean> => {
    if (!user) {
      setAuthError('Connectez-vous pour gérer vos favoris.');
      return false;
    }

    const currentlyFavorite = favoriteIds.has(propertyId);
    const success = currentlyFavorite
      ? await removeFromFavorites(propertyId)
      : await addToFavorites(propertyId);

    if (success) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFavorite) next.delete(propertyId);
        else next.add(propertyId);
        return next;
      });
      setAuthError(null);
    }
    return success;
  };

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, loading, authError, isFavorite, toggleFavorite, refreshFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
