import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import i18n from '@/i18n';
import {
  AppSettings,
  AppLocale,
  DEFAULT_APP_SETTINGS,
  loadAppSettings,
  saveAppSettings,
  ThemeMode,
} from '@/lib/appSettings';
import { applyLocale } from '@/lib/locale';
import { applyTheme, resolveTheme } from '@/lib/theme';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(loadAppSettings().theme),
  );

  useEffect(() => {
    applyTheme(settings.theme);
    setResolvedTheme(resolveTheme(settings.theme));
  }, [settings.theme]);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyTheme('system');
      setResolvedTheme(media.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [settings.theme]);

  useEffect(() => {
    void i18n.changeLanguage(settings.locale);
    applyLocale(settings.locale);
    document.title = i18n.t('meta.title');
  }, [settings.locale]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveAppSettings(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    updateSettings({ theme });
  }, [updateSettings]);

  const setLocale = useCallback((locale: AppLocale) => {
    updateSettings({ locale });
  }, [updateSettings]);

  const resetSettings = useCallback(() => {
    saveAppSettings(DEFAULT_APP_SETTINGS);
    setSettings({ ...DEFAULT_APP_SETTINGS });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        theme: settings.theme,
        resolvedTheme,
        setTheme,
        locale: settings.locale,
        setLocale,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
