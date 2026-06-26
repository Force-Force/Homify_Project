import { MapPin, List, Map as MapIcon, RotateCcw, Sun, Moon, Monitor, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsLayout, SettingsPanel } from '@/components/settings/SettingsLayout';
import { labelClass, selectClass } from '@/lib/formStyles';
import { useSettings } from '@/context/SettingsContext';
import { AppLocale, CITY_OPTIONS, ThemeMode } from '@/lib/appSettings';
import { cn } from '@/lib/utils';

const LOCALE_OPTIONS: { value: AppLocale; labelKey: string; descKey: string }[] = [
  { value: 'fr', labelKey: 'preferences.langFr', descKey: 'preferences.langFrDesc' },
  { value: 'en', labelKey: 'preferences.langEn', descKey: 'preferences.langEnDesc' },
];

export default function PreferencesScreen() {
  const { t } = useTranslation();
  const { settings, updateSettings, resetSettings, setTheme, setLocale, resolvedTheme } = useSettings();

  const THEME_OPTIONS: { value: ThemeMode; labelKey: string; descKey: string; icon: typeof Sun }[] = [
    { value: 'light', labelKey: 'preferences.themeLight', descKey: 'preferences.themeLightDesc', icon: Sun },
    { value: 'dark', labelKey: 'preferences.themeDark', descKey: 'preferences.themeDarkDesc', icon: Moon },
    { value: 'system', labelKey: 'preferences.themeSystem', descKey: 'preferences.themeSystemDesc', icon: Monitor },
  ];

  const activeLanguageLabel = settings.locale === 'en' ? t('preferences.langEn') : t('preferences.langFr');
  const activeThemeLabel = resolvedTheme === 'dark' ? t('preferences.themeDark') : t('preferences.themeLight');

  return (
    <SettingsLayout
      title={t('preferences.title')}
      subtitle={t('preferences.subtitle')}
    >
      <SettingsPanel className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">{t('preferences.language')}</h2>
        </div>
        <p className="text-sm text-homify-muted mb-4">
          {t('preferences.languageActive', { language: activeLanguageLabel })}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LOCALE_OPTIONS.map(({ value, labelKey, descKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLocale(value)}
              className={cn(
                'flex flex-col items-start gap-2 p-4 rounded-btn border-2 transition text-left',
                settings.locale === value
                  ? 'border-homify-primary bg-homify-primary/5'
                  : 'border-homify-border hover:border-homify-primary/30',
              )}
            >
              <span className="text-sm font-semibold text-homify-text">{t(labelKey)}</span>
              <span className="text-xs text-homify-muted leading-snug">{t(descKey)}</span>
            </button>
          ))}
        </div>
      </SettingsPanel>

      <SettingsPanel className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">{t('preferences.theme')}</h2>
        </div>
        <p className="text-sm text-homify-muted mb-4">
          {t('preferences.themeActive', { theme: activeThemeLabel })}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, labelKey, descKey, icon: Icon }) => (
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
              <span className="text-sm font-semibold text-homify-text">{t(labelKey)}</span>
              <span className="text-xs text-homify-muted leading-snug">{t(descKey)}</span>
            </button>
          ))}
        </div>
      </SettingsPanel>

      <SettingsPanel className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">{t('preferences.defaultCity')}</h2>
        </div>
        <label className={labelClass}>{t('preferences.defaultCityLabel')}</label>
        <select
          value={settings.defaultCity}
          onChange={(e) => updateSettings({ defaultCity: e.target.value })}
          className={`w-full p-4 ${selectClass}`}
        >
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <p className="text-xs text-homify-muted mt-2">
          {t('preferences.defaultCityHint')}
        </p>
      </SettingsPanel>

      <SettingsPanel>
        <div className="flex items-center gap-2 mb-4">
          <List className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">{t('preferences.defaultView')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'list' as const, labelKey: 'common.list', icon: List },
            { value: 'map' as const, labelKey: 'common.map', icon: MapIcon },
          ]).map(({ value, labelKey, icon: Icon }) => (
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
              <span className="text-sm font-semibold">{t(labelKey)}</span>
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
        {t('preferences.reset')}
      </button>
    </SettingsLayout>
  );
}
