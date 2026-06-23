import { useEffect, useState, useCallback } from 'react';
import { Loader2, Check, X, Building2, Flag, Users, Ban, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import {
  approveAndPublishProperty,
  getPendingProperties,
  getApprovedProperties,
  publishProperty,
  rejectProperty,
  getAdminUsers,
  suspendUser,
  activateUser,
  AdminUser,
} from '@/services/adminService';
import {
  getReports,
  reviewReport,
  resolveReport,
  dismissReport,
  ResolveAction,
} from '@/services/reportService';
import { ApiPropertyDetail, ApiReport } from '@/types/api';
import { PropertyImage } from '@/components/PropertyImage';
import { ApiError } from '@/services/apiClient';

type AdminTab = 'properties' | 'reports' | 'users';

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

export default function AdminModerationScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('properties');
  const [properties, setProperties] = useState<ApiPropertyDetail[]>([]);
  const [approvedProperties, setApprovedProperties] = useState<ApiPropertyDetail[]>([]);
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolveAction, setResolveAction] = useState<ResolveAction | ''>('');
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    const [pending, approved] = await Promise.all([
      getPendingProperties(),
      getApprovedProperties(),
    ]);
    setProperties(pending);
    setApprovedProperties(approved);
  }, []);

  const loadReports = useCallback(async () => {
    setReports(await getReports());
  }, []);

  const loadUsers = useCallback(async () => {
    setUsers(await getAdminUsers());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'properties') await loadProperties();
      else if (tab === 'reports') await loadReports();
      else await loadUsers();
    } catch {
      setError('Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [tab, loadProperties, loadReports, loadUsers]);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
    else setLoading(false);
  }, [user, load]);

  const handleApproveAndPublish = async (id: number) => {
    setActionId(id);
    setError(null);
    try {
      await approveAndPublishProperty(id);
      await loadProperties();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Publication impossible.');
    } finally {
      setActionId(null);
    }
  };

  const handlePublish = async (id: number) => {
    setActionId(id);
    setError(null);
    try {
      await publishProperty(id);
      await loadProperties();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Publication impossible.');
    } finally {
      setActionId(null);
    }
  };

  const handleRejectProperty = async () => {
    if (!rejectId || rejectReason.trim().length < 10) {
      setError('Le motif de rejet doit contenir au moins 10 caractères.');
      return;
    }
    setActionId(rejectId);
    setError(null);
    try {
      await rejectProperty(rejectId, rejectReason.trim());
      setRejectId(null);
      setRejectReason('');
      await loadProperties();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Rejet impossible.');
    } finally {
      setActionId(null);
    }
  };

  const handleReviewReport = async (id: number) => {
    setActionId(id);
    try {
      await reviewReport(id);
      await loadReports();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action impossible.');
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
      await loadReports();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Résolution impossible.');
    } finally {
      setActionId(null);
    }
  };

  const handleDismissReport = async (id: number) => {
    setActionId(id);
    try {
      await dismissReport(id);
      await loadReports();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action impossible.');
    } finally {
      setActionId(null);
    }
  };

  const handleToggleUser = async (u: AdminUser) => {
    setActionId(u.id);
    try {
      if (u.status === 'SUSPENDED' || !u.is_active) {
        await activateUser(u.id);
      } else {
        await suspendUser(u.id);
      }
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action impossible.');
    } finally {
      setActionId(null);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="px-5 pt-8 text-center text-homify-muted">
        <p>Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Building2 }[] = [
    { id: 'properties', label: 'Annonces', icon: Building2 },
    { id: 'reports', label: 'Signalements', icon: Flag },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <PageHeader greeting="Administration" title="Tableau de bord" showNotifications={false} />

      <div className="flex gap-2 mb-6 max-w-2xl mx-auto overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-semibold shrink-0 transition ${
              tab === id
                ? 'bg-homify-primary text-white'
                : 'bg-homify-card border border-homify-border text-homify-muted hover:border-homify-primary/30'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100 max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : tab === 'properties' ? (
        properties.length === 0 && approvedProperties.length === 0 ? (
          <EmptyState icon={Building2} text="Aucune annonce à modérer" />
        ) : (
          <div className="space-y-8 max-w-2xl mx-auto">
            {properties.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-homify-text uppercase tracking-wide">
                  En attente ({properties.length})
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
                          <Check className="w-4 h-4" /> Approuver et publier
                        </button>
                        <button
                          type="button"
                          disabled={actionId === p.id}
                          onClick={() => { setRejectId(p.id); setRejectReason(''); }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-btn text-sm font-semibold disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> Rejeter
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
                  Approuvées — à publier ({approvedProperties.length})
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
                        <Check className="w-4 h-4" /> Publier
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      ) : tab === 'reports' ? (
        reports.length === 0 ? (
          <EmptyState icon={Flag} text="Aucun signalement" />
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
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
                      Examiner
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
                        Résoudre
                      </button>
                      <button
                        type="button"
                        disabled={actionId === r.id}
                        onClick={() => handleDismissReport(r.id)}
                        className="text-xs font-medium text-homify-muted hover:underline disabled:opacity-50"
                      >
                        Rejeter le signalement
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : users.length === 0 ? (
        <EmptyState icon={Users} text="Aucun utilisateur" />
      ) : (
        <div className="space-y-3 max-w-2xl mx-auto">
          {users.map((u) => (
            <div key={u.id} className="bg-homify-card rounded-card border border-homify-border p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-homify-text truncate">{u.full_name || u.email}</p>
                <p className="text-xs text-homify-muted">{u.email} · {u.role}</p>
                <p className="text-xs text-homify-muted mt-0.5">
                  {u.status} · {u.properties_count ?? 0} annonce(s)
                </p>
              </div>
              {u.role !== 'ADMIN' && (
                <button
                  type="button"
                  disabled={actionId === u.id}
                  onClick={() => handleToggleUser(u)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-btn text-xs font-semibold disabled:opacity-50 ${
                    u.status === 'SUSPENDED' || !u.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {u.status === 'SUSPENDED' || !u.is_active ? (
                    <><UserCheck className="w-3.5 h-3.5" /> Activer</>
                  ) : (
                    <><Ban className="w-3.5 h-3.5" /> Suspendre</>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectId && (
        <Modal onClose={() => setRejectId(null)} title="Motif de rejet">
          <textarea
            className="w-full p-3 mb-4 bg-homify-surface rounded-btn border border-homify-border text-sm min-h-[100px]"
            placeholder="Expliquez au propriétaire..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <ModalActions onCancel={() => setRejectId(null)} onConfirm={handleRejectProperty} confirmLabel="Confirmer" />
        </Modal>
      )}

      {resolveId && (
        <Modal onClose={() => setResolveId(null)} title="Résoudre le signalement">
          <select
            className="w-full p-3 mb-4 bg-homify-surface rounded-btn border border-homify-border text-sm"
            value={resolveAction}
            onChange={(e) => setResolveAction(e.target.value as ResolveAction | '')}
          >
            <option value="">Aucune action supplémentaire</option>
            <option value="reject_property">Rejeter l'annonce</option>
            <option value="unpublish_property">Dépublier l'annonce</option>
            <option value="suspend_user">Suspendre l'utilisateur</option>
          </select>
          <ModalActions onCancel={() => setResolveId(null)} onConfirm={handleResolveReport} confirmLabel="Résoudre" />
        </Modal>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Building2; text: string }) {
  return (
    <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8 max-w-2xl mx-auto">
      <Icon className="w-12 h-12 text-homify-muted/40 mx-auto mb-4" />
      <p className="font-medium text-homify-text">{text}</p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-homify-text/40 backdrop-blur-sm p-4">
      <div className="bg-homify-card w-full max-w-md rounded-modal p-6 shadow-2xl border border-homify-border">
        <h3 className="text-lg font-bold text-homify-text mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-btn border border-homify-border text-homify-muted font-medium">
        Annuler
      </button>
      <button type="button" onClick={onConfirm} className="flex-1 py-2.5 rounded-btn bg-homify-primary text-white font-semibold">
        {confirmLabel}
      </button>
    </div>
  );
}
