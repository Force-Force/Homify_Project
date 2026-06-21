import { Bell } from 'lucide-react';

interface PageHeaderProps {
  greeting?: string;
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
}

export function PageHeader({ greeting, title, subtitle, showNotifications = true }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        {greeting && (
          <p className="text-homify-muted text-xs font-medium uppercase tracking-wider">{greeting}</p>
        )}
        <h1 className="text-xl font-bold text-homify-text">{title}</h1>
        {subtitle && <p className="text-homify-muted text-sm mt-0.5">{subtitle}</p>}
      </div>
      {showNotifications && (
        <button
          className="relative p-2.5 bg-homify-card rounded-full shadow-card border border-homify-border hover:border-homify-accent/40 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-homify-primary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-homify-accent rounded-full" />
        </button>
      )}
    </div>
  );
}

export const inputClass =
  'w-full p-4 bg-homify-surface border border-homify-border rounded-btn text-homify-text outline-none focus:ring-2 focus:ring-homify-primary/20 focus:border-homify-primary/40 transition text-sm';

export const labelClass = 'block text-sm font-semibold text-homify-text mb-2';
