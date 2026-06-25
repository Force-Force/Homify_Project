import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SettingsLayout({ title, subtitle, children }: SettingsLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="inline-flex items-center gap-2 text-sm font-medium text-homify-muted hover:text-homify-primary transition mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au compte
      </button>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-homify-text">{title}</h1>
        {subtitle && <p className="text-sm text-homify-muted mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function SettingsPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-homify-card rounded-modal border border-homify-border shadow-card p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

export function SettingsMessage({ message, type = 'info' }: { message: string; type?: 'info' | 'error' | 'success' }) {
  const styles =
    type === 'error'
      ? 'bg-red-50 text-red-700 border-red-100'
      : type === 'success'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
        : 'bg-homify-surface text-homify-primary border-homify-border';

  return (
    <div className={`p-3 text-sm rounded-btn border mb-4 ${styles}`}>
      {message}
    </div>
  );
}
