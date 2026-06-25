import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Bell, Search, SlidersHorizontal, Loader2, X, Check, Sparkles,
  Map as MapIcon, List, ChevronLeft, ChevronRight, Navigation,
} from 'lucide-react';
import axios from 'axios';
import { RecommendedCard } from '../components/Cards';
import PriceMap from '../components/PriceMap';
import { Hotel } from '../types';
import { searchProperties } from '../services/propertyService';
import { getNotificationUnreadCount } from '../services/notificationService';
import { StaggeredItem } from '@/components/ui/StaggeredItem';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';

interface Filters {
  type: string;
  minPrice: string;
  maxPrice: string;
  city: string;
  district: string;
  ordering: string;
  furnished: string;
  bedrooms: string;
  bathrooms: string;
  minSurface: string;
  nearMe: boolean;
  radiusKm: string;
}

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'Maison' },
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'ROOM', label: 'Chambre' },
];

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Plus récents' },
  { value: 'monthly_rent', label: 'Prix croissant' },
  { value: '-monthly_rent', label: 'Prix décroissant' },
  { value: 'surface', label: 'Surface croissante' },
];

const DEFAULT_FILTERS: Filters = {
  type: '',
  minPrice: '',
  maxPrice: '',
  city: '',
  district: '',
  ordering: '-created_at',
  furnished: '',
  bedrooms: '',
  bathrooms: '',
  minSurface: '',
  nearMe: false,
  radiusKm: '10',
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { settings } = useSettings();
  const [properties, setProperties] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState(settings.defaultCity || 'Localisation...');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    city: settings.defaultCity,
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>(settings.defaultViewMode);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getNotificationUnreadCount()
      .then(setNotificationCount)
      .catch(() => setNotificationCount(0));
  }, []);

  const buildQueryString = useCallback((customSearch?: string, customFilters?: Filters): string => {
    const f = customFilters ?? filters;
    const params = new URLSearchParams();
    params.set('ordering', f.ordering);
    if (customSearch) params.set('search', customSearch);
    if (f.type) params.set('type', f.type);
    if (f.minPrice) params.set('min_price', f.minPrice);
    if (f.maxPrice) params.set('max_price', f.maxPrice);
    if (f.city) params.set('city', f.city);
    if (f.district) params.set('district', f.district);
    if (f.furnished) params.set('furnished', f.furnished);
    if (f.bedrooms) params.set('number_of_bedrooms', f.bedrooms);
    if (f.bathrooms) params.set('number_of_bathrooms', f.bathrooms);
    if (f.minSurface) params.set('min_surface', f.minSurface);
    if (f.nearMe && userCoords) {
      params.set('lat', String(userCoords.lat));
      params.set('lng', String(userCoords.lng));
      params.set('radius_km', f.radiusKm || '10');
    }
    return `?${params.toString()}`;
  }, [filters, userCoords]);

  const fetchProperties = useCallback(async (queryString?: string, pageNum = 1) => {
    setLoading(true);
    try {
      const qs = queryString ?? buildQueryString();
      const data = await searchProperties(qs, pageNum);
      setProperties(data.results);
      setTotalCount(data.count);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
      setPage(pageNum);
      setError(data.results.length === 0 ? 'Aucun résultat ne correspond à vos critères.' : null);
    } catch {
      setError('Erreur de connexion au serveur.');
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  const fetchCityName = async (lat: number, lon: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const response = await axios.get(url);
      const address = response.data.address;
      const city = address.city || address.town || address.village || 'Ma Position';
      setLocationName(`${city}, CMR`);
    } catch {
      setLocationName('Yaoundé, CMR');
    }
  };

  const applyFilters = () => {
    setPage(1);
    fetchProperties(buildQueryString(), 1);
    setShowFilters(false);
    setSearchQuery('');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    fetchProperties('?ordering=-created_at', 1);
  };

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const togglePropertyType = (type: string) => {
    updateFilter('type', filters.type === type ? '' : type);
  };

  useEffect(() => {
    fetchProperties('?ordering=-created_at', 1);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        setPage(1);
        fetchProperties(buildQueryString(searchQuery), 1);
      } else if (!showFilters) {
        setPage(1);
        fetchProperties(buildQueryString(), 1);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          setUserCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
          fetchCityName(p.coords.latitude, p.coords.longitude);
        },
        () => setLocationName('Yaoundé, CMR'),
      );
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setViewMode('list');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMarkerClick = (id: number) => {
    navigate(`/property/${id}`);
  };

  const goToPage = (nextPage: number) => {
    fetchProperties(buildQueryString(searchQuery.trim() || undefined), nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = () =>
    searchQuery ||
    Object.entries(filters).some(([key, value]) => {
      if (key === 'ordering') return value !== DEFAULT_FILTERS.ordering;
      if (key === 'nearMe') return value === true;
      if (key === 'radiusKm') return filters.nearMe && value !== DEFAULT_FILTERS.radiusKm;
      return value !== '' && value !== false;
    });

  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  return (
    <div className="flex flex-col md:flex-row h-full md:h-screen overflow-hidden pb-28 md:pb-0">
      <div
        className={`flex flex-col min-w-0 md:w-[58%] md:max-w-[58%] md:h-full md:overflow-hidden ${
          viewMode === 'map' ? 'hidden md:flex' : 'flex flex-1'
        }`}
      >
        <div className="flex-none bg-homify-card border-b border-homify-border px-5 md:px-6 py-4 md:py-3 space-y-3 md:space-y-2.5">
          <header className="flex justify-between items-center">
            <div className="min-w-0">
              <p className="text-homify-muted text-[10px] md:text-xs font-medium uppercase tracking-wider">
                Localisation
              </p>
              <div className="flex items-center gap-1.5 text-homify-primary font-bold text-base md:text-sm mt-0.5">
                <MapPin className="w-3.5 h-3.5 md:w-3 md:h-3 text-homify-accent shrink-0" />
                <span className="truncate">{locationName}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="relative p-2 md:p-1.5 bg-homify-surface rounded-full border border-homify-border hover:border-homify-accent/40 transition-colors shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 md:w-3.5 md:h-3.5 text-homify-primary" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-homify-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          </header>

          <div className="md:hidden">
            <h1 className="text-2xl font-extrabold text-homify-text tracking-tight">Bonjour 👋</h1>
            <p className="text-homify-muted text-sm mt-1">Trouvez le logement idéal près de chez vous</p>
          </div>

          <div className="flex gap-2 md:gap-2.5">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-homify-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un quartier, une ville..."
                className="w-full pl-9 pr-3 py-2.5 md:py-2 bg-homify-surface rounded-btn border border-homify-border
                           focus:outline-none focus:ring-2 focus:ring-homify-primary/20 focus:border-homify-primary/40
                           text-sm placeholder:text-homify-muted/70 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="bg-homify-primary p-2.5 md:p-2 rounded-btn text-white hover:bg-homify-primary-light transition shadow-sm shrink-0"
              aria-label="Filtres"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {PROPERTY_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  const newType = filters.type === value ? '' : value;
                  const newFilters = { ...filters, type: newType };
                  setFilters(newFilters);
                  setPage(1);
                  fetchProperties(buildQueryString(undefined, newFilters), 1);
                }}
                className={`shrink-0 px-3 py-1 md:px-2.5 md:py-0.5 rounded-full text-xs font-semibold border transition-all ${
                  filters.type === value
                    ? 'bg-homify-accent text-white border-homify-accent'
                    : 'bg-homify-surface text-homify-muted border-homify-border hover:border-homify-primary/30'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <section className="flex-1 overflow-y-auto px-5 md:px-6 py-4 md:py-5 min-h-0">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 text-red-600 rounded-btn text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center mb-6">
              <Loader2 className="w-7 h-7 text-homify-primary animate-spin" />
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-base font-bold text-homify-text">
              {hasActiveFilters() ? 'Résultats' : 'Récemment publiés'}
            </h2>
            {!loading && totalCount > 0 && (
              <span className="text-xs text-homify-muted font-medium">
                {totalCount} annonce{totalCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {properties.length > 0 ? (
            <>
              <div className="flex flex-col gap-4 pb-4 md:grid md:grid-cols-2 md:gap-4 md:pb-6">
                {properties.map((hotel, index) => (
                  <div
                    key={hotel.id}
                    className="w-full"
                    onMouseEnter={() => setActiveId(hotel.id)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <StaggeredItem index={index}>
                      <RecommendedCard
                        hotel={{ ...hotel, isFavorite: isFavorite(hotel.id) }}
                        onClick={() => navigate(`/property/${hotel.id}`)}
                        isFavorite={isFavorite(hotel.id)}
                        onFavoriteToggle={() => toggleFavorite(hotel.id)}
                      />
                    </StaggeredItem>
                  </div>
                ))}
              </div>

              {totalCount > 20 && (
                <div className="flex items-center justify-center gap-4 py-4 border-t border-homify-border">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={!hasPrevious || loading}
                    className="flex items-center gap-1 px-4 py-2 rounded-btn border border-homify-border text-sm font-medium
                               text-homify-muted hover:bg-homify-surface disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  <span className="text-sm text-homify-muted">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={!hasNext || loading}
                    className="flex items-center gap-1 px-4 py-2 rounded-btn border border-homify-border text-sm font-medium
                               text-homify-muted hover:bg-homify-surface disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div className="flex flex-col items-center py-12 text-center">
                <Sparkles className="w-10 h-10 text-homify-muted/40 mb-3" />
                <p className="text-homify-muted text-sm">Aucune annonce trouvée.</p>
              </div>
            )
          )}
        </section>
      </div>

      <aside
        className={`md:w-[42%] md:shrink-0 md:h-full md:min-h-0 md:p-4 md:pl-3 md:pr-5 md:py-5 bg-homify-surface ${
          viewMode === 'map'
            ? 'fixed inset-0 z-50 md:static md:z-auto flex flex-col p-4'
            : 'hidden md:flex md:flex-col'
        }`}
      >
        {viewMode === 'map' && (
          <button
            onClick={() => setViewMode('list')}
            className="md:hidden absolute top-6 left-6 z-20 bg-homify-card p-3 rounded-full shadow-card border border-homify-border"
            aria-label="Retour à la liste"
          >
            <List className="w-5 h-5 text-homify-primary" />
          </button>
        )}
        <PriceMap
          properties={properties}
          activeId={activeId}
          onMarkerClick={handleMarkerClick}
          className={viewMode === 'map' ? 'flex-1' : undefined}
        />
      </aside>

      <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="bg-homify-primary text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:bg-homify-primary-light transition"
        >
          {viewMode === 'list' ? (
            <>
              <MapIcon className="w-4 h-4" />
              Carte
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              Liste
            </>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-modal flex items-end md:items-center justify-center bg-homify-text/40 backdrop-blur-sm">
          <div className="bg-homify-card w-full md:w-[480px] h-[85vh] md:h-auto md:max-h-[85vh] md:rounded-modal rounded-t-modal p-6 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-homify-text">Filtres</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 bg-homify-surface rounded-full hover:bg-homify-border/50 transition"
              >
                <X className="w-5 h-5 text-homify-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <label className="block text-sm font-semibold text-homify-text mb-2">Type de bien</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PROPERTY_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => togglePropertyType(value)}
                      className={`py-2.5 rounded-btn text-sm font-medium border transition ${
                        filters.type === value
                          ? 'bg-homify-primary text-white border-homify-primary'
                          : 'bg-homify-surface text-homify-muted border-homify-border hover:border-homify-primary/30'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-homify-text mb-2">Budget (FCFA)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-homify-text mb-2">Chambres (min.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 2"
                    className="w-full p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm"
                    value={filters.bedrooms}
                    onChange={(e) => updateFilter('bedrooms', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-homify-text mb-2">Salles de bain (min.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 1"
                    className="w-full p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm"
                    value={filters.bathrooms}
                    onChange={(e) => updateFilter('bathrooms', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-homify-text mb-2">Surface min. (m²)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 40"
                  className="w-full p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm"
                  value={filters.minSurface}
                  onChange={(e) => updateFilter('minSurface', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-homify-text mb-2">Meublé</label>
                <select
                  className="w-full p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm text-homify-text"
                  value={filters.furnished}
                  onChange={(e) => updateFilter('furnished', e.target.value)}
                >
                  <option value="">Indifférent</option>
                  <option value="true">Meublé uniquement</option>
                  <option value="false">Non meublé uniquement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-homify-text mb-2">Ville</label>
                <input
                  type="text"
                  placeholder="Ex: Yaoundé, Douala..."
                  className="w-full p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm"
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-homify-text mb-2">Quartier</label>
                <input
                  type="text"
                  placeholder="Ex: Bastos, Akwa..."
                  className="w-full p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm"
                  value={filters.district}
                  onChange={(e) => updateFilter('district', e.target.value)}
                />
              </div>

              <div className="rounded-btn border border-homify-border p-4 bg-homify-surface">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.nearMe}
                    disabled={!userCoords}
                    onChange={(e) => updateFilter('nearMe', e.target.checked)}
                    className="w-4 h-4 rounded border-homify-border text-homify-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-homify-text flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-homify-accent" />
                      Près de moi
                    </span>
                    <p className="text-xs text-homify-muted mt-0.5">
                      {userCoords
                        ? 'Annonces dans un rayon autour de votre position'
                        : 'Autorisez la géolocalisation pour activer ce filtre'}
                    </p>
                  </div>
                </label>
                {filters.nearMe && userCoords && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-homify-muted mb-1">Rayon (km)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="w-full p-2.5 bg-homify-card rounded-btn border border-homify-border text-sm"
                      value={filters.radiusKm}
                      onChange={(e) => updateFilter('radiusKm', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-homify-text mb-2">Trier par</label>
                <select
                  className="w-full p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm text-homify-text"
                  value={filters.ordering}
                  onChange={(e) => updateFilter('ordering', e.target.value)}
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="w-full bg-homify-surface text-homify-muted font-semibold py-3 rounded-btn border border-homify-border hover:bg-homify-border/30 transition text-sm"
              >
                Réinitialiser les filtres
              </button>
            </div>

            <div className="pt-5 mt-4 border-t border-homify-border">
              <button
                onClick={applyFilters}
                className="w-full bg-homify-accent text-white font-bold py-3.5 rounded-btn hover:bg-homify-accent-hover transition flex justify-center items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Afficher les résultats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
