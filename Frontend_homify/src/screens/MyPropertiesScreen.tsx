import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Building2, Send, Home, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getMyProperties, submitPropertyForReview, markPropertyRented, deleteProperty, STATUS_LABELS } from '@/services/propertyService';
import { useAuth } from '@/context/AuthContext';
import { PropertyImage } from '@/components/PropertyImage';

export default function MyPropertiesScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Awaited<ReturnType<typeof getMyProperties>>>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProperties(await getMyProperties());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'LANDLORD' || user?.role === 'ADMIN') load();
    else setLoading(false);
  }, [user, load]);

  const handleSubmit = async (id: number) => {
    setActionId(id);
    try {
      await submitPropertyForReview(id);
      await load();
    } catch {
      alert('Soumission impossible. Vérifiez que vous avez au moins 3 photos.');
    } finally {
      setActionId(null);
    }
  };

  const handleMarkRented = async (id: number) => {
    setActionId(id);
    try {
      await markPropertyRented(id);
      await load();
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    setActionId(id);
    try {
      await deleteProperty(id);
      await load();
    } finally {
      setActionId(null);
    }
  };

  if (user?.role !== 'LANDLORD' && user?.role !== 'ADMIN') {
    return (
      <div className="px-5 pt-8 text-center text-homify-muted">
        <p>Cette section est réservée aux propriétaires.</p>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <PageHeader greeting="Espace propriétaire" title="Mes annonces" showNotifications={false} />

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-homify-muted">
          {user.properties_count ?? properties.length} annonce(s) gérée(s)
        </p>
        <button
          onClick={() => navigate('/property/new')}
          className="flex items-center gap-2 bg-homify-accent text-white px-4 py-2.5 rounded-btn font-semibold text-sm hover:bg-homify-accent-hover transition"
        >
          <Plus className="w-4 h-4" />
          Nouvelle annonce
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8">
          <Building2 className="w-12 h-12 text-homify-muted/40 mx-auto mb-4" />
          <p className="font-medium text-homify-text mb-2">Aucune annonce</p>
          <p className="text-sm text-homify-muted mb-6">Publiez votre premier logement à louer.</p>
          <button
            onClick={() => navigate('/property/new')}
            className="bg-homify-primary text-white px-6 py-3 rounded-btn font-semibold"
          >
            Créer une annonce
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => {
            const status = p.status ?? 'DRAFT';
            return (
              <div
                key={p.id}
                className="bg-homify-card rounded-card border border-homify-border overflow-hidden flex gap-4 p-3"
              >
                <PropertyImage src={p.imageUrl} alt={p.name} className="w-24 h-24 rounded-btn object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-bold text-homify-text truncate">{p.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-homify-surface text-homify-primary shrink-0">
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                  <p className="text-sm text-homify-muted truncate">{p.location}</p>
                  <p className="text-sm font-semibold text-homify-primary mt-1">{p.displayPrice}/mois</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="text-xs font-medium text-homify-primary hover:underline"
                    >
                      Voir
                    </button>
                    {(status === 'DRAFT' || status === 'REJECTED') && (
                      <>
                        <button
                          onClick={() => navigate(`/property/${p.id}/edit`)}
                          className="flex items-center gap-1 text-xs font-medium text-homify-muted hover:text-homify-primary"
                        >
                          <Pencil className="w-3 h-3" />
                          Modifier
                        </button>
                        <button
                          disabled={actionId === p.id}
                          onClick={() => handleSubmit(p.id)}
                          className="flex items-center gap-1 text-xs font-medium text-homify-accent disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          Soumettre
                        </button>
                      </>
                    )}
                    {status === 'PUBLISHED' && (
                      <button
                        disabled={actionId === p.id}
                        onClick={() => handleMarkRented(p.id)}
                        className="flex items-center gap-1 text-xs font-medium text-emerald-600 disabled:opacity-50"
                      >
                        <Home className="w-3 h-3" />
                        Marquer loué
                      </button>
                    )}
                    {status !== 'PUBLISHED' && status !== 'PENDING' && (
                      <button
                        disabled={actionId === p.id}
                        onClick={() => handleDelete(p.id)}
                        className="flex items-center gap-1 text-xs font-medium text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
