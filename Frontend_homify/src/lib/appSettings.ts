export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLocale = 'fr' | 'en';

export interface AppSettings {
  defaultCity: string;
  defaultViewMode: 'list' | 'map';
  theme: ThemeMode;
  locale: AppLocale;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultCity: 'Yaoundé',
  defaultViewMode: 'list',
  theme: 'light',
  locale: 'fr',
};

const STORAGE_KEY = 'homify_app_settings';

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_SETTINGS };
    const parsed = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) };
    if (!['light', 'dark', 'system'].includes(parsed.theme)) {
      parsed.theme = DEFAULT_APP_SETTINGS.theme;
    }
    if (!['fr', 'en'].includes(parsed.locale)) {
      parsed.locale = DEFAULT_APP_SETTINGS.locale;
    }
    return parsed;
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const CITY_OPTIONS = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua'];
