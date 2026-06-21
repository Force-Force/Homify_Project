import React, { useEffect, useState } from 'react';
import {
  MapPin, Bell, Search, SlidersHorizontal, Loader2, X, Check, Sparkles,
  Map as MapIcon, List,
} from 'lucide-react';
import axios from 'axios';
import { RecommendedCard } from '../components/Cards';
import PriceMap from '../components/PriceMap';
import { Hotel } from '../types';
import { getProperties } from '../services/propertyService';
import { StaggeredItem } from '@/components/ui/StaggeredItem';

interface HomeProps {
  onHotelClick: (h: Hotel) => void;
}

interface Filters {
  type: string;
  minPrice: string;
  maxPrice: string;
  city: string;
  ordering: string;
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
  ordering: '-created_at',
};

export default function HomeScreen({ onHotelClick }: HomeProps) {
  const [properties, setProperties] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState('Localisation...');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeId, setActiveId] = useState<number | null>(null);

  const buildQueryString = (customSearch?: string): string => {
    let query = `?ordering=${filters.ordering}`;
    if (customSearch) query += `&search=${encodeURIComponent(customSearch)}`;
    if (filters.type) query += `&type=${filters.type}`;
    if (filters.minPrice) query += `&min_price=${filters.minPrice}`;
    if (filters.maxPrice) query += `&max_price=${filters.maxPrice}`;
    if (filters.city) query += `&city=${filters.city}`;
    return query;
  };

  const fetchProperties = async (customQueryString?: string) => {
    setLoading(true);
    try {
      const queryString = customQueryString || '?ordering=-created_at';
      const data = await getProperties(queryString);
      if (data.length > 0) {
        setProperties(data);
        setError(null);
      } else {
        setProperties([]);
        setError('Aucun résultat ne correspond à vos critères.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

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
    fetchProperties(buildQueryString());
    setShowFilters(false);
    setSearchQuery('');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters(DEFAULT_FILTERS);
    fetchProperties('?ordering=-created_at');
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const togglePropertyType = (type: string) => {
    updateFilter('type', filters.type === type ? '' : type);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchProperties(buildQueryString(searchQuery));
      } else if (!showFilters) {
        fetchProperties(`?ordering=${filters.ordering}`);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => fetchCityName(p.coords.latitude, p.coords.longitude),
        () => setLocationName('Yaoundé, CMR')
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
    const hotel = properties.find((p) => p.id === id);
    if (hotel) onHotelClick(hotel);
  };

  const hasActiveFilters = () =>
    searchQuery ||
    Object.entries(filters).some(
      ([key, value]) => key !== 'ordering' && value !== '' && value !== DEFAULT_FILTERS.ordering
    );

  return (
    <div className="flex flex-col h-full pb-28 md:pb-0 md:px-4 lg:px-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 px-5 md:px-0">
        <div>
          <p className="text-homify-muted text-xs font-medium uppercase tracking-wider">Localisation</p>
          <div className="flex items-center gap-1.5 text-homify-primary font-bold text-lg mt-0.5">
            <MapPin className="w-4 h-4 text-homify-accent" />
            <span>{locationName}</span>
          </div>
        </div>
        <button
          className="relative p-2.5 bg-homify-card rounded-full shadow-card border border-homify-border hover:border-homify-accent/40 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-homify-primary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-homify-accent rounded-full" />
        </button>
      </header>

      {/* Hero greeting */}
      <div className="px-5 md:px-0 mb-6">
        <h1 className="text-2xl font-extrabold text-homify-text tracking-tight">
          Bonjour 👋
        </h1>
        <p className="text-homify-muted text-sm mt-1">
          Trouvez le logement idéal près de chez vous
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-8 px-5 md:px-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-homify-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un quartier, une ville..."
            className="w-full pl-10 pr-4 py-3 bg-homify-card rounded-btn border border-homify-border
                       focus:outline-none focus:ring-2 focus:ring-homify-primary/20 focus:border-homify-primary/40
                       text-sm placeholder:text-homify-muted/70 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="bg-homify-primary p-3 rounded-btn text-white hover:bg-homify-primary-light transition shadow-sm shrink-0"
          aria-label="Filtres"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Quick type chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 md:px-0 mb-6 pb-1">
        {PROPERTY_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              togglePropertyType(value);
              const newFilters = { ...filters, type: filters.type === value ? '' : value };
              setFilters(newFilters);
              const q = `?ordering=${newFilters.ordering}${newFilters.type ? `&type=${newFilters.type}` : ''}`;
              fetchProperties(q);
            }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filters.type === value
                ? 'bg-homify-accent text-white border-homify-accent'
                : 'bg-homify-card text-homify-muted border-homify-border hover:border-homify-primary/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 md:mx-0 mb-4 p-3.5 bg-red-50 text-red-600 rounded-btn text-sm text-center border border-red-100">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center mb-6">
          <Loader2 className="w-7 h-7 text-homify-primary animate-spin" />
        </div>
      )}

      {/* List + side map */}
      <div className="flex-1 flex flex-col md:flex-row md:gap-5 md:overflow-hidden md:min-h-0">
        <section
          className={`flex-1 md:overflow-y-auto md:pr-1 ${
            viewMode === 'map' ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between mb-4 px-5 md:px-0">
            <h2 className="text-lg font-bold text-homify-text">
              {hasActiveFilters() ? 'Résultats' : 'Récemment publiés'}
            </h2>
            {!loading && properties.length > 0 && (
              <span className="text-xs text-homify-muted font-medium">
                {properties.length} annonce{properties.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {properties.length > 0 ? (
            <div className="flex overflow-x-auto pb-4 gap-4 px-5 scrollbar-hide md:grid md:grid-cols-2 xl:grid-cols-2 md:px-0 md:overflow-visible md:gap-5 md:pb-8">
              {properties.map((hotel, index) => (
                <div
                  key={hotel.id}
                  onMouseEnter={() => setActiveId(hotel.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <StaggeredItem index={index}>
                    <RecommendedCard hotel={hotel} onClick={() => onHotelClick(hotel)} />
                  </StaggeredItem>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="mx-5 md:mx-0 flex flex-col items-center py-12 text-center">
                <Sparkles className="w-10 h-10 text-homify-muted/40 mb-3" />
                <p className="text-homify-muted text-sm">Aucune annonce trouvée.</p>
              </div>
            )
          )}
        </section>

        {/* Mini map — desktop sidebar + mobile full screen */}
        <aside
          className={`md:w-[42%] md:shrink-0 md:sticky md:top-4 md:self-start md:h-[calc(100vh-220px)] ${
            viewMode === 'map'
              ? 'fixed inset-0 z-50 bg-homify-surface md:static md:z-auto'
              : 'hidden md:block'
          }`}
        >
          <div className="h-full p-4 md:p-0">
            {viewMode === 'map' && (
              <button
                onClick={() => setViewMode('list')}
                className="md:hidden absolute top-4 left-4 z-[1000] bg-homify-card p-3 rounded-full shadow-lg border border-homify-border"
                aria-label="Retour à la liste"
              >
                <List className="w-5 h-5 text-homify-primary" />
              </button>
            )}
            <PriceMap
              properties={properties}
              activeId={activeId}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </aside>
      </div>

      {/* Mobile list / map toggle */}
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

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-homify-text/40 backdrop-blur-sm">
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
