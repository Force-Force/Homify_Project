import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Flag } from 'lucide-react';
import {
  getReports,
  reviewReport,
  resolveReport,
  dismissReport,
  ResolveAction,
} from '@/services/reportService';
import { ApiReport } from '@/types/api';
import { ApiError } from '@/services/apiClient';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminModal, AdminModalActions } from '@/components/admin/AdminModal';
import { selectClass } from '@/lib/formStyles';

const REPORT_STATUS: Record<string, string> = {
  PENDING: 'En attente',
  REVIEWED: 'Examiné',
  RESOLVED: 'Résolu',
  DISMISSED: 'Rejeté',
};

const REASON_LABELS: Record<string, string> = {
  FRAUD: 'Fraude',
  INAPPROPRIATE: 'Contenu inapproprié',
  DUPLICATE: 'Doublon',
  OTHER: 'Autre',
};

export default function AdminReportsScreen() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolveAction, setResolveAction] = useState<ResolveAction | ''>('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReports(await getReports());
    } catch {
      setError(t('admin.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReviewReport = async (id: number) => {
    setActionId(id);
    try {
      await reviewReport(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.reports.actionError'));
    } finally {
      setActionId(null);
    }
  };

  const handleResolveReport = async () => {
    if (!resolveId) return;
    setActionId(resolveId);
    try {
      await resolveReport(resolveId, resolveAction || undefined);
      setResolveId(null);
      setResolveAction('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.reports.actionError'));
    } finally {
      setActionId(null);
    }
  };

  const handleDismissReport = async (id: number) => {
    setActionId(id);
    try {
      await dismissReport(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.reports.actionError'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-homify-text">{t('admin.reports.title')}</h1>
        <p className="text-sm text-homify-muted mt-1">{t('admin.reports.subtitle')}</p>
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
      ) : reports.length === 0 ? (
        <AdminEmptyState icon={Flag} text={t('admin.reports.empty')} />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-homify-card rounded-card border border-homify-border p-4">
              <div className="flex justify-between gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-homify-surface text-homify-primary">
                  {REPORT_STATUS[r.status] ?? r.status}
                </span>
                <span className="text-xs text-homify-muted">
                  {REASON_LABELS[r.reason] ?? r.reason}
                </span>
              </div>
              <p className="text-sm text-homify-text mb-1">
                {r.property_detail?.title ?? `Annonce #${r.property ?? '—'}`}
              </p>
              <p className="text-xs text-homify-muted line-clamp-2 mb-3">{r.description}</p>
              <div className="flex flex-wrap gap-2">
                {r.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={actionId === r.id}
                    onClick={() => handleReviewReport(r.id)}
                    className="text-xs font-medium text-homify-primary hover:underline disabled:opacity-50"
                  >
                    {t('admin.reports.review')}
                  </button>
                )}
                {r.status === 'REVIEWED' && (
                  <>
                    <button
                      type="button"
                      disabled={actionId === r.id}
                      onClick={() => { setResolveId(r.id); setResolveAction(''); }}
                      className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
                    >
                      {t('admin.reports.resolve')}
                    </button>
                    <button
                      type="button"
                      disabled={actionId === r.id}
                      onClick={() => handleDismissReport(r.id)}
                      className="text-xs font-medium text-homify-muted hover:underline disabled:opacity-50"
                    >
                      {t('admin.reports.dismiss')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {resolveId && (
        <AdminModal onClose={() => setResolveId(null)} title={t('admin.reports.resolveTitle')}>
          <select
            className={`w-full mb-4 ${selectClass}`}
            value={resolveAction}
            onChange={(e) => setResolveAction(e.target.value as ResolveAction | '')}
          >
            <option value="">{t('admin.reports.noExtraAction')}</option>
            <option value="reject_property">{t('admin.reports.rejectProperty')}</option>
            <option value="unpublish_property">{t('admin.reports.unpublishProperty')}</option>
            <option value="suspend_user">{t('admin.reports.suspendUser')}</option>
          </select>
          <AdminModalActions
            onCancel={() => setResolveId(null)}
            onConfirm={handleResolveReport}
            confirmLabel={t('admin.reports.resolve')}
          />
        </AdminModal>
      )}
    </div>
  );
}
