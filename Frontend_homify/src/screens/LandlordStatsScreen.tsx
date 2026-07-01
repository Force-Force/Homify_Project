import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BarChart3, Eye, Heart, MessageCircle, Users, Loader2, Crown } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { getLandlordStats, getBillingSummary, LandlordStats } from '@/services/billingService';
import { cn } from '@/lib/utils';

export default function LandlordStatsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<LandlordStats | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getBillingSummary();
      setIsPro(summary.is_pro);
      if (summary.is_pro) {
        setStats(await getLandlordStats());
      }
    } catch {
      setError(t('stats.proRequired'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user?.role === 'LANDLORD' || user?.role === 'ADMIN') load();
    else setLoading(false);
  }, [user, load]);

  if (user?.role !== 'LANDLORD' && user?.role !== 'ADMIN') {
    return (
      <div className="px-5 pt-8 text-center text-homify-muted">
        <p>{t('billing.landlordOnly')}</p>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-3xl mx-auto">
      <Link
        to="/my-properties"
        className="inline-flex items-center gap-2 text-sm text-homify-muted hover:text-homify-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('billing.backToListings')}
      </Link>

      <PageHeader greeting={t('stats.greeting')} title={t('stats.title')} showNotifications={false} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : !isPro ? (
        <div className="bg-homify-card rounded-modal border border-homify-border p-6 text-center">
          <Crown className="w-10 h-10 text-homify-accent mx-auto mb-3" />
          <p className="font-semibold text-homify-text mb-2">{t('stats.proRequired')}</p>
          <Link to="/landlord/billing" className="text-sm font-semibold text-homify-accent hover:underline">
            {t('billing.managePlan')}
          </Link>
        </div>
      ) : stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Eye, label: t('stats.views'), value: stats.totals.views },
              { icon: Heart, label: t('stats.favorites'), value: stats.totals.favorites },
              { icon: MessageCircle, label: t('stats.messages'), value: stats.totals.messages },
              { icon: Users, label: t('stats.leads'), value: stats.totals.leads },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-homify-card rounded-modal border border-homify-border p-4 text-center">
                <Icon className="w-5 h-5 text-homify-primary mx-auto mb-2" />
                <p className="text-xl font-bold text-homify-text">{value}</p>
                <p className="text-[11px] text-homify-muted">{label}</p>
              </div>
            ))}
          </div>

          <h2 className="font-bold text-homify-text flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-homify-accent" />
            {t('stats.byListing')}
          </h2>

          <div className="space-y-2">
            {stats.properties.map((p) => (
              <div key={p.id} className="bg-homify-card rounded-btn border border-homify-border p-4">
                <div className="flex justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm text-homify-text truncate">{p.title}</p>
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                    p.is_boosted ? 'bg-homify-accent/15 text-homify-accent' : 'bg-homify-surface text-homify-muted',
                  )}>
                    {p.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div><span className="font-bold text-homify-primary">{p.views}</span><br />{t('stats.views')}</div>
                  <div><span className="font-bold text-homify-primary">{p.favorites}</span><br />{t('stats.favorites')}</div>
                  <div><span className="font-bold text-homify-primary">{p.messages}</span><br />{t('stats.messages')}</div>
                  <div><span className="font-bold text-homify-primary">{p.leads}</span><br />{t('stats.leads')}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {error && !loading && (
        <p className="text-sm text-red-600 text-center mt-4">{error}</p>
      )}
    </div>
  );
}
