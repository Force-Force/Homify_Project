import { ChevronRight, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SettingsRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  to?: string;
  onClick?: () => void;
  badge?: string | number;
  iconClassName?: string;
  danger?: boolean;
}

export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  to,
  onClick,
  badge,
  iconClassName,
  danger,
}: SettingsRowProps) {
  const inner = (
    <>
      <div
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          danger ? 'bg-red-50' : 'bg-homify-primary/10',
          iconClassName,
        )}
      >
        <Icon className={cn('w-5 h-5', danger ? 'text-red-600' : 'text-homify-primary')} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className={cn('font-semibold text-sm', danger ? 'text-red-600' : 'text-homify-text')}>{title}</p>
        {subtitle && <p className="text-xs text-homify-muted mt-0.5 truncate">{subtitle}</p>}
      </div>
      {badge !== undefined && badge !== 0 && (
        <span className="text-xs font-bold bg-homify-accent text-white px-2 py-0.5 rounded-full shrink-0">
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-homify-muted shrink-0" />
    </>
  );

  const className =
    'w-full flex items-center gap-3 p-4 hover:bg-homify-surface/80 transition rounded-btn';

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-homify-muted mb-2 px-1">{title}</h2>
      <div className="bg-homify-card rounded-modal border border-homify-border shadow-card overflow-hidden divide-y divide-homify-border">
        {children}
      </div>
    </section>
  );
}
