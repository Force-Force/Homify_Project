import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchProperties } from '@/services/propertyService';
import { RecommendedCard } from '@/components/Cards';
import { useFavorites } from '@/context/FavoritesContext';
import { Hotel } from '@/types';
import { inputClassCompact, selectClass } from '@/lib/formStyles';

const CITIES = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua'];

export default function SmartPropertySearch() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [city, setCity] = useState('Yaoundé');
  const [district, setDistrict] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [furnished, setFurnished] = useState('');
  const [results, setResults] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    const params = new URLSearchParams({ ordering: '-created_at' });
    if (city) params.set('city', city);
    if (district) params.set('district', district);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (bedrooms) params.set('number_of_bedrooms', bedrooms);
    if (furnished) params.set('furnished', furnished);

    try {
      const data = await searchProperties(`?${params.toString()}`, 1);
      setResults(data.results);
      if (data.results.length === 0) {
        setError('Aucun bien ne correspond à vos critères.');
      }
    } catch {
      setError('Erreur lors de la recherche.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-homify-muted">
        Recherche intelligente basée sur les annonces Homify au Cameroun — résultats en temps réel depuis la plateforme.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Ville</label>
          <select className={selectClass} value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Quartier</label>
          <input
            className={inputClassCompact}
            placeholder="Ex: Bastos, Akwa..."
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Budget min. (FCFA)</label>
          <input type="number" className={inputClassCompact} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Budget max. (FCFA)</label>
          <input type="number" className={inputClassCompact} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Chambres (min.)</label>
          <input type="number" min="0" className={inputClassCompact} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Meublé</label>
          <select className={selectClass} value={furnished} onChange={(e) => setFurnished(e.target.value)}>
            <option value="">Indifférent</option>
            <option value="true">Meublé</option>
            <option value="false">Non meublé</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-homify-primary text-white font-bold py-3 rounded-btn hover:bg-homify-primary-light transition disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        Rechercher
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      {searched && !loading && results.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-homify-text mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-homify-accent" />
            {results.length} résultat(s) à {city}{district ? `, ${district}` : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((hotel) => (
              <RecommendedCard
                key={hotel.id}
                hotel={{ ...hotel, isFavorite: isFavorite(hotel.id) }}
                onClick={() => navigate(`/property/${hotel.id}`)}
                isFavorite={isFavorite(hotel.id)}
                onFavoriteToggle={() => toggleFavorite(hotel.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
