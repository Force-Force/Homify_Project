export interface AppSettings {
  defaultCity: string;
  defaultViewMode: 'list' | 'map';
  emailNotifications: boolean;
  messageAlerts: boolean;
  newListingAlerts: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultCity: 'Yaoundé',
  defaultViewMode: 'list',
  emailNotifications: true,
  messageAlerts: true,
  newListingAlerts: false,
};

const STORAGE_KEY = 'homify_app_settings';

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_SETTINGS };
    return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const CITY_OPTIONS = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua'];
