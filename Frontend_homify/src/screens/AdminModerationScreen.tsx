import { useEffect, useState, useCallback } from 'react';
import { Loader2, Check, X, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { approveProperty, getPendingProperties, rejectProperty } from '@/services/adminService';
import { ApiPropertyDetail } from '@/types/api';
import { PropertyImage } from '@/components/PropertyImage';
import { ApiError } from '@/services/apiClient';

export default function AdminModerationScreen() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<ApiPropertyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProperties(await getPendingProperties());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
    else setLoading(false);
  }, [user, load]);

  const handleApprove = async (id: number) => {
    setActionId(id);
    setError(null);
    try {
      await approveProperty(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Approbation impossible.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
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
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Rejet impossible.');
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

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <PageHeader greeting="Administration" title="Modération" showNotifications={false} />

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100 max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8 max-w-2xl mx-auto">
          <Building2 className="w-12 h-12 text-homify-muted/40 mx-auto mb-4" />
          <p className="font-medium text-homify-text">Aucune annonce en attente</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
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
                    <p className="text-sm text-homify-muted truncate">
                      {p.address?.district}, {p.address?.city}
                    </p>
                    <p className="text-sm font-semibold text-homify-primary mt-1">
                      {parseInt(p.monthly_rent, 10).toLocaleString('fr-FR')} FCFA/mois
                    </p>
                    <p className="text-xs text-homify-muted mt-2 line-clamp-2">{p.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    disabled={actionId === p.id}
                    onClick={() => handleApprove(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2.5 rounded-btn text-sm font-semibold disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    type="button"
                    disabled={actionId === p.id}
                    onClick={() => { setRejectId(p.id); setRejectReason(''); }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-btn text-sm font-semibold disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-homify-text/40 backdrop-blur-sm p-4">
          <div className="bg-homify-card w-full max-w-md rounded-modal p-6 shadow-2xl border border-homify-border">
            <h3 className="text-lg font-bold text-homify-text mb-2">Motif de rejet</h3>
            <textarea
              className="w-full p-3 bg-homify-surface rounded-btn border border-homify-border text-sm min-h-[100px] mb-4"
              placeholder="Expliquez au propriétaire pourquoi l'annonce est rejetée..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="flex-1 py-2.5 rounded-btn border border-homify-border text-homify-muted font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionId === rejectId}
                className="flex-1 py-2.5 rounded-btn bg-red-600 text-white font-semibold disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
