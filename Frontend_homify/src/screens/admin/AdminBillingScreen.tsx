import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Receipt, Crown } from 'lucide-react';
import { getAdminBillingOverview, AdminBillingOverview } from '@/services/adminService';
import { formatFcfa } from '@/services/billingService';

export default function AdminBillingScreen() {
  const { t } = useTranslation();
  const [overview, setOverview] = useState<AdminBillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await getAdminBillingOverview());
    } catch {
      setError(t('admin.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-homify-text">{t('admin.billing.title')}</h1>
        <p className="text-sm text-homify-muted mt-1">{t('admin.billing.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : overview && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              label={t('admin.billing.revenue')}
              value={formatFcfa(overview.total_revenue_fcfa)}
              icon={Receipt}
            />
            <StatCard
              label={t('admin.billing.completedOrders')}
              value={String(overview.completed_orders)}
              icon={Receipt}
            />
            <StatCard
              label={t('admin.billing.activePro')}
              value={String(overview.active_pro_subscriptions)}
              icon={Crown}
            />
            <StatCard
              label={t('admin.billing.pendingCommissions')}
              value={formatFcfa(overview.pending_commissions_amount_fcfa)}
              sub={t('admin.billing.pendingCount', { count: overview.pending_commissions })}
              icon={Receipt}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-homify-card rounded-modal border border-homify-border p-5">
              <h2 className="font-semibold text-homify-text mb-4">{t('admin.billing.recentOrders')}</h2>
              {overview.recent_orders.length === 0 ? (
                <p className="text-sm text-homify-muted">{t('admin.billing.noOrders')}</p>
              ) : (
                <div className="space-y-2">
                  {overview.recent_orders.map((o) => (
                    <div key={o.id} className="flex justify-between gap-3 text-sm border-b border-homify-border pb-2 last:border-0">
                      <div className="min-w-0">
                        <p className="font-medium text-homify-text truncate">{o.product_name}</p>
                        <p className="text-xs text-homify-muted truncate">{o.user_email}</p>
                      </div>
                      <p className="font-semibold text-homify-primary shrink-0">{formatFcfa(o.amount_fcfa)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-homify-card rounded-modal border border-homify-border p-5">
              <h2 className="font-semibold text-homify-text mb-4">{t('admin.billing.recentCommissions')}</h2>
              {overview.recent_commissions.length === 0 ? (
                <p className="text-sm text-homify-muted">{t('admin.billing.noCommissions')}</p>
              ) : (
                <div className="space-y-2">
                  {overview.recent_commissions.map((c) => (
                    <div key={c.id} className="flex justify-between gap-3 text-sm border-b border-homify-border pb-2 last:border-0">
                      <div className="min-w-0">
                        <p className="font-medium text-homify-text truncate">{c.property_title}</p>
                        <p className="text-xs text-homify-muted truncate">{c.landlord_email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-homify-primary">{formatFcfa(c.amount_fcfa)}</p>
                        <p className="text-[10px] uppercase text-amber-600">{c.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Receipt;
}) {
  return (
    <div className="bg-homify-card rounded-modal border border-homify-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-homify-accent" />
        <p className="text-sm text-homify-muted">{label}</p>
      </div>
      <p className="text-xl font-bold text-homify-text">{value}</p>
      {sub && <p className="text-xs text-homify-muted mt-1">{sub}</p>}
    </div>
  );
}
