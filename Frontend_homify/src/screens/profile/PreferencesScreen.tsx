import { MapPin, List, Map as MapIcon, RotateCcw, Sun, Moon, Monitor } from 'lucide-react';
import { SettingsLayout, SettingsPanel } from '@/components/settings/SettingsLayout';
import { labelClass } from '@/components/layout/PageHeader';
import { useSettings } from '@/context/SettingsContext';
import { CITY_OPTIONS, ThemeMode } from '@/lib/appSettings';
import { cn } from '@/lib/utils';

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', description: 'Fond clair, texte foncé', icon: Sun },
  { value: 'dark', label: 'Sombre', description: 'Reposant pour les yeux', icon: Moon },
  { value: 'system', label: 'Système', description: 'Suit l\'appareil', icon: Monitor },
];

export default function PreferencesScreen() {
  const { settings, updateSettings, resetSettings, setTheme, resolvedTheme } = useSettings();

  return (
    <SettingsLayout
      title="Préférences"
      subtitle="Apparence, recherche et affichage par défaut."
    >
      <SettingsPanel className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">Thème</h2>
        </div>
        <p className="text-sm text-homify-muted mb-4">
          Thème actif : <span className="font-semibold text-homify-text">{resolvedTheme === 'dark' ? 'Sombre' : 'Clair'}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-start gap-2 p-4 rounded-btn border-2 transition text-left',
                settings.theme === value
                  ? 'border-homify-primary bg-homify-primary/5'
                  : 'border-homify-border hover:border-homify-primary/30',
              )}
            >
              <Icon className={cn('w-6 h-6', settings.theme === value ? 'text-homify-primary' : 'text-homify-muted')} />
              <span className="text-sm font-semibold text-homify-text">{label}</span>
              <span className="text-xs text-homify-muted leading-snug">{description}</span>
            </button>
          ))}
        </div>
      </SettingsPanel>

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
