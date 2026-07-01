import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Check, X, Building2, Crown } from 'lucide-react';
import {
  approveAndPublishProperty,
  getPendingProperties,
  getApprovedProperties,
  publishProperty,
  rejectProperty,
} from '@/services/adminService';
import { ApiPropertyDetail } from '@/types/api';
import { PropertyImage } from '@/components/PropertyImage';
import { ApiError } from '@/services/apiClient';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminModal, AdminModalActions } from '@/components/admin/AdminModal';
import { textareaClass } from '@/lib/formStyles';

export default function AdminPropertiesScreen() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<ApiPropertyDetail[]>([]);
  const [approvedProperties, setApprovedProperties] = useState<ApiPropertyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, approved] = await Promise.all([
        getPendingProperties(),
        getApprovedProperties(),
      ]);
      setProperties(pending);
      setApprovedProperties(approved);
    } catch {
      setError(t('admin.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApproveAndPublish = async (id: number) => {
    setActionId(id);
    setError(null);
    try {
      await approveAndPublishProperty(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.properties.publishError'));
    } finally {
      setActionId(null);
    }
  };

  const handlePublish = async (id: number) => {
    setActionId(id);
    setError(null);
    try {
      await publishProperty(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.properties.publishError'));
    } finally {
      setActionId(null);
    }
  };

  const handleRejectProperty = async () => {
    if (!rejectId || rejectReason.trim().length < 10) {
      setError(t('admin.properties.rejectMinLength'));
      return;
    }
    setActionId(rejectId);
    setError(null);
    try {
      await rejectProperty(rejectId, rejectReason.trim());
      setRejectId(null);
      setRejectReason('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.properties.rejectError'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-homify-text">{t('admin.properties.title')}</h1>
        <p className="text-sm text-homify-muted mt-1">{t('admin.properties.subtitle')}</p>
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
      ) : properties.length === 0 && approvedProperties.length === 0 ? (
        <AdminEmptyState icon={Building2} text={t('admin.properties.empty')} />
      ) : (
        <div className="space-y-8">
          {properties.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-homify-text uppercase tracking-wide">
                {t('admin.properties.pending', { count: properties.length })}
              </h3>
              {properties.map((p) => {
                const photoUrl = p.photos?.[0]?.url ?? p.primary_photo?.url;
                return (
                  <div key={p.id} className="bg-homify-card rounded-card border border-homify-border p-4">
                    <div className="flex gap-4">
                      {photoUrl && (
                        <PropertyImage src={photoUrl} alt={p.title} className="w-24 h-24 rounded-btn object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-homify-text truncate">{p.title}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {p.landlord_is_pro && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-homify-accent/15 text-homify-accent inline-flex items-center gap-1">
                              <Crown className="w-3 h-3" /> Pro
                            </span>
                          )}
                          {p.landlord_verified && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              {t('verification.verified')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-homify-muted">{p.address?.city}</p>
                        <p className="text-sm font-semibold text-homify-primary mt-1">
                          {parseInt(p.monthly_rent, 10).toLocaleString('fr-FR')} FCFA/mois
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        disabled={actionId === p.id}
                        onClick={() => handleApproveAndPublish(p.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2.5 rounded-btn text-sm font-semibold disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> {t('admin.properties.approvePublish')}
                      </button>
                      <button
                        type="button"
                        disabled={actionId === p.id}
                        onClick={() => { setRejectId(p.id); setRejectReason(''); }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-btn text-sm font-semibold disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> {t('admin.properties.reject')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {approvedProperties.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-homify-text uppercase tracking-wide">
                {t('admin.properties.approved', { count: approvedProperties.length })}
              </h3>
              {approvedProperties.map((p) => {
                const photoUrl = p.photos?.[0]?.url ?? p.primary_photo?.url;
                return (
                  <div key={p.id} className="bg-homify-card rounded-card border border-amber-200 p-4">
                    <div className="flex gap-4">
                      {photoUrl && (
                        <PropertyImage src={photoUrl} alt={p.title} className="w-24 h-24 rounded-btn object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-homify-text truncate">{p.title}</h3>
                        <p className="text-sm text-homify-muted">{p.address?.city}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={actionId === p.id}
                      onClick={() => handlePublish(p.id)}
                      className="w-full mt-4 flex items-center justify-center gap-1.5 bg-homify-primary text-white py-2.5 rounded-btn text-sm font-semibold disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> {t('admin.properties.publish')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {rejectId && (
        <AdminModal onClose={() => setRejectId(null)} title={t('admin.properties.rejectTitle')}>
          <textarea
            className={`w-full mb-4 ${textareaClass}`}
            placeholder={t('admin.properties.rejectPlaceholder')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <AdminModalActions
            onCancel={() => setRejectId(null)}
            onConfirm={handleRejectProperty}
            confirmLabel={t('admin.properties.confirmReject')}
          />
        </AdminModal>
      )}
    </div>
  );
}
