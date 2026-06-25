import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  loadAppSettings,
  saveAppSettings,
} from '@/lib/appSettings';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  useEffect(() => {
    setSettings(loadAppSettings());
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveAppSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveAppSettings(DEFAULT_APP_SETTINGS);
    setSettings({ ...DEFAULT_APP_SETTINGS });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
