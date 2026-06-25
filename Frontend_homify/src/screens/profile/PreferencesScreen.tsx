import { MapPin, List, Map as MapIcon, RotateCcw } from 'lucide-react';
import { SettingsLayout, SettingsPanel } from '@/components/settings/SettingsLayout';
import { labelClass } from '@/components/layout/PageHeader';
import { useSettings } from '@/context/SettingsContext';
import { CITY_OPTIONS } from '@/lib/appSettings';
import { cn } from '@/lib/utils';

export default function PreferencesScreen() {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <SettingsLayout
      title="Préférences de recherche"
      subtitle="Personnalisez votre expérience sur l'accueil et la carte."
    >
      <SettingsPanel className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">Ville par défaut</h2>
        </div>
        <label className={labelClass}>Afficher en priorité les annonces de</label>
        <select
          value={settings.defaultCity}
          onChange={(e) => updateSettings({ defaultCity: e.target.value })}
          className="w-full p-4 bg-homify-surface border border-homify-border rounded-btn text-homify-text text-sm outline-none focus:ring-2 focus:ring-homify-primary/20"
        >
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <p className="text-xs text-homify-muted mt-2">
          Appliquée au filtre ville sur la page d&apos;accueil.
        </p>
      </SettingsPanel>

      <SettingsPanel>
        <div className="flex items-center gap-2 mb-4">
          <List className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">Affichage par défaut</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'list' as const, label: 'Liste', icon: List },
            { value: 'map' as const, label: 'Carte', icon: MapIcon },
          ]).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateSettings({ defaultViewMode: value })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-btn border-2 transition',
                settings.defaultViewMode === value
                  ? 'border-homify-primary bg-homify-primary/5 text-homify-primary'
                  : 'border-homify-border text-homify-muted hover:border-homify-primary/30',
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </SettingsPanel>

      <button
        type="button"
        onClick={resetSettings}
        className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-medium text-homify-muted hover:text-homify-primary py-3 transition"
      >
        <RotateCcw className="w-4 h-4" />
        Réinitialiser les préférences
      </button>
    </SettingsLayout>
  );
}
