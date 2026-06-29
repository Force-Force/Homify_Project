import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { ThemeMode } from '@/lib/appSettings';
import { cn } from '@/lib/utils';

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system'];

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const THEME_LABEL_KEYS = {
  light: 'preferences.themeLight',
  dark: 'preferences.themeDark',
  system: 'preferences.themeSystem',
} as const;

interface ThemeToggleProps {
  variant?: 'default' | 'overlay';
  className?: string;
}

export function ThemeToggle({ variant = 'default', className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useSettings();
  const Icon = THEME_ICONS[theme];
  const themeLabel = t(THEME_LABEL_KEYS[theme]);

  const handleClick = () => {
    const index = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(index + 1) % THEME_CYCLE.length]);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center rounded-btn border p-2.5 transition-colors',
        variant === 'overlay'
          ? 'border-white/25 bg-white/15 text-white hover:bg-white/25'
          : 'border-homify-border bg-homify-card text-homify-primary hover:bg-homify-surface shadow-sm',
        className,
      )}
      aria-label={t('common.themeToggleAria', { theme: themeLabel })}
      title={t('common.themeToggleAria', { theme: themeLabel })}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
