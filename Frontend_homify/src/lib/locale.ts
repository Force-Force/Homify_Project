import type { AppLocale } from '@/lib/appSettings';

export function resolveLocale(stored?: string): AppLocale {
  if (stored === 'fr' || stored === 'en') return stored;
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('en')) return 'en';
  return 'fr';
}

export function applyLocale(locale: AppLocale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
}

export function getDateLocale(locale: AppLocale): string {
  return locale === 'en' ? 'en-US' : 'fr-FR';
}
