import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { loadAppSettings } from '@/lib/appSettings';
import { applyLocale, resolveLocale } from '@/lib/locale';
import fr from './locales/fr.json';
import en from './locales/en.json';

const settings = loadAppSettings();
const locale = resolveLocale(settings.locale);

applyLocale(locale);

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: locale,
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
