import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center pb-28">
      <p className="text-6xl font-extrabold text-homify-primary/20 mb-2">404</p>
      <h1 className="text-xl font-bold text-homify-text mb-2">{t('notFound.title')}</h1>
      <p className="text-sm text-homify-muted mb-8 max-w-sm">
        {t('notFound.description')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/home"
          className="inline-flex items-center justify-center gap-2 bg-homify-primary text-white px-6 py-3 rounded-btn font-semibold hover:bg-homify-primary-light transition"
        >
          <Home className="w-4 h-4" />
          {t('common.home')}
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 border border-homify-border text-homify-muted px-6 py-3 rounded-btn font-semibold hover:bg-homify-surface transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      </div>
    </div>
  );
}
