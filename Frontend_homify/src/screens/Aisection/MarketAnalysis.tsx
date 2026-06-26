import { useState } from 'react';
import { TrendingUp, Loader2, MapPin, Home, BarChart3 } from 'lucide-react';
import { getMarketStats, MarketStats, TYPE_LABELS } from '@/services/marketService';
import { inputClassCompact, selectClass } from '@/lib/formStyles';

const CITIES = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua'];

const fmt = (n: number) => n.toLocaleString('fr-FR');

export default function MarketAnalysis() {
  const [city, setCity] = useState('Yaoundé');
  const [district, setDistrict] = useState('');
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketStats(city, district);
      setStats(data);
      if (data.totalListings === 0) {
        setError('Aucune annonce publiée pour ces critères.');
      }
    } catch {
      setError('Impossible de charger les données du marché.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-homify-muted">
        Statistiques calculées à partir des annonces publiées sur Homify — données réelles, sans n8n.
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
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Quartier (optionnel)</label>
          <input
            className={inputClassCompact}
            placeholder="Ex: Bastos, Akwa..."
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-homify-accent text-white font-bold py-3 rounded-btn hover:bg-homify-accent-hover transition disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
        Analyser le marché
      </button>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {stats && stats.totalListings > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-homify-muted flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {stats.totalListings} annonce(s) analysée(s) — {stats.city}
            {stats.district ? `, ${stats.district}` : ''}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Loyer moyen', value: `${fmt(stats.avgRent)} F`, icon: BarChart3 },
              { label: 'Loyer min.', value: `${fmt(stats.minRent)} F`, icon: TrendingUp },
              { label: 'Loyer max.', value: `${fmt(stats.maxRent)} F`, icon: TrendingUp },
              { label: 'Surface moy.', value: `${stats.avgSurface} m²`, icon: Home },
              { label: 'Meublés', value: `${stats.furnishedCount}`, icon: Home },
              { label: 'Total', value: `${stats.totalListings}`, icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-homify-surface border border-homify-border rounded-card p-4"
              >
                <Icon className="w-4 h-4 text-homify-accent mb-2" />
                <p className="text-xs text-homify-muted">{label}</p>
                <p className="text-lg font-bold text-homify-text">{value}</p>
              </div>
            ))}
          </div>

          {Object.keys(stats.byType).length > 0 && (
            <div className="bg-homify-card border border-homify-border rounded-card p-4">
              <h4 className="text-sm font-bold text-homify-text mb-3">Répartition par type</h4>
              <div className="space-y-2">
                {Object.entries(stats.byType).map(([type, count]) => {
                  const pct = Math.round((count / stats.totalListings) * 100);
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-homify-muted">{TYPE_LABELS[type] ?? type}</span>
                        <span className="font-medium text-homify-text">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-homify-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-homify-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-xs text-homify-muted italic">
            Estimation indicative basée sur les annonces actuellement publiées sur la plateforme.
          </p>
        </div>
      )}
    </div>
  );
}
