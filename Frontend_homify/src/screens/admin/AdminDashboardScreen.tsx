import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  ShieldCheck,
  Flag,
  Users,
  Receipt,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { getAdminDashboardStats, AdminDashboardStats } from '@/services/adminService';
import { cn } from '@/lib/utils';

const STAT_CARDS = [
  {
    key: 'pendingProperties' as const,
    labelKey: 'admin.dashboard.pendingProperties',
    to: '/admin/properties',
    icon: Building2,
    accent: 'text-homify-primary bg-homify-primary/10',
  },
  {
    key: 'pendingKyc' as const,
    labelKey: 'admin.dashboard.pendingKyc',
    to: '/admin/kyc',
    icon: ShieldCheck,
    accent: 'text-emerald-600 bg-emerald-100',
  },
  {
    key: 'pendingReports' as const,
    labelKey: 'admin.dashboard.pendingReports',
    to: '/admin/reports',
    icon: Flag,
    accent: 'text-amber-600 bg-amber-100',
  },
  {
    key: 'totalUsers' as const,
    labelKey: 'admin.dashboard.totalUsers',
    to: '/admin/users',
    icon: Users,
    accent: 'text-violet-600 bg-violet-100',
  },
];

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getAdminDashboardStats());
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
      <div className="mb-8">
        <p className="text-sm text-homify-muted">{t('admin.greeting')}</p>
        <h1 className="text-2xl font-bold text-homify-text mt-1">{t('admin.dashboard.title')}</h1>
        <p className="text-sm text-homify-muted mt-1">{t('admin.dashboard.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS.map(({ key, labelKey, to, icon: Icon, accent }) => (
              <Link
                key={key}
                to={to}
                className="bg-homify-card rounded-modal border border-homify-border p-5 hover:border-homify-primary/30 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={cn('p-2.5 rounded-xl', accent)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-homify-muted opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-3xl font-bold text-homify-text mt-4">{stats[key]}</p>
                <p className="text-sm text-homify-muted mt-1">{t(labelKey)}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-homify-card rounded-modal border border-homify-border p-5">
              <h2 className="font-semibold text-homify-text mb-3">{t('admin.dashboard.moderationTitle')}</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-homify-muted">{t('admin.dashboard.awaitingReview')}</span>
                  <span className="font-semibold text-homify-text">{stats.pendingProperties}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-homify-muted">{t('admin.dashboard.awaitingPublish')}</span>
                  <span className="font-semibold text-homify-text">{stats.approvedProperties}</span>
                </li>
              </ul>
              <Link to="/admin/properties" className="inline-flex items-center gap-1 text-sm font-semibold text-homify-primary mt-4 hover:underline">
                {t('admin.dashboard.openModeration')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-homify-card rounded-modal border border-homify-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-5 h-5 text-homify-accent" />
                <h2 className="font-semibold text-homify-text">{t('admin.dashboard.billingTitle')}</h2>
              </div>
              <p className="text-sm text-homify-muted mb-4">{t('admin.dashboard.billingHint')}</p>
              <Link to="/admin/billing" className="inline-flex items-center gap-1 text-sm font-semibold text-homify-primary hover:underline">
                {t('admin.dashboard.openBilling')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
