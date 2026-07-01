import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldCheck } from 'lucide-react';
import {
  getAdminVerifications,
  approveVerification,
  rejectVerification,
  AdminVerificationRequest,
} from '@/services/verificationService';
import { ApiError } from '@/services/apiClient';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { textareaClass } from '@/lib/formStyles';

export default function AdminKycScreen() {
  const { t } = useTranslation();
  const [verifications, setVerifications] = useState<AdminVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyNotes, setVerifyNotes] = useState<Record<number, string>>({});
  const [verifyBusyId, setVerifyBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVerifications(await getAdminVerifications('PENDING'));
    } catch {
      setError(t('admin.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id: number) => {
    setVerifyBusyId(id);
    try {
      await approveVerification(id, verifyNotes[id] ?? '');
      setVerifyNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.kyc.approveError'));
    } finally {
      setVerifyBusyId(null);
    }
  };

  const handleReject = async (id: number) => {
    setVerifyBusyId(id);
    try {
      await rejectVerification(id, verifyNotes[id] ?? '');
      setVerifyNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.kyc.rejectError'));
    } finally {
      setVerifyBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-homify-text">{t('admin.kyc.title')}</h1>
        <p className="text-sm text-homify-muted mt-1">{t('admin.kyc.subtitle')}</p>
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
      ) : verifications.length === 0 ? (
        <AdminEmptyState icon={ShieldCheck} text={t('admin.kyc.empty')} />
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => (
            <div key={v.id} className="bg-homify-card rounded-card border border-homify-border p-4">
              <p className="font-semibold text-homify-text">{v.user_name || v.user_email}</p>
              <p className="text-xs text-homify-muted">{v.user_email}</p>
              {v.id_number && (
                <p className="text-sm text-homify-muted mt-2">
                  {t('verification.idLabel')} : {v.id_number}
                </p>
              )}
              {v.note && <p className="text-sm text-homify-text mt-2">{v.note}</p>}
              <textarea
                className={`w-full mt-3 ${textareaClass}`}
                placeholder={t('admin.kyc.adminNotePlaceholder')}
                value={verifyNotes[v.id] ?? ''}
                onChange={(e) => setVerifyNotes((prev) => ({ ...prev, [v.id]: e.target.value }))}
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  disabled={verifyBusyId === v.id}
                  onClick={() => handleApprove(v.id)}
                  className="flex-1 py-2.5 rounded-btn bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {t('admin.kyc.approve')}
                </button>
                <button
                  type="button"
                  disabled={verifyBusyId === v.id}
                  onClick={() => handleReject(v.id)}
                  className="flex-1 py-2.5 rounded-btn bg-red-50 text-red-600 border border-red-200 text-sm font-semibold disabled:opacity-50"
                >
                  {t('admin.kyc.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
