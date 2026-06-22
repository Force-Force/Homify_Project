import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, LogOut, User, Loader2, Mail, Building2, AlertTriangle } from 'lucide-react';
import { PageHeader, inputClass, labelClass } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { updateMe, resendVerification } from '@/services/authService';

export default function ProfileScreen() {
  const { user, loading, logout, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateMe(formData);
      await refreshUser();
      setMessage('Profil mis à jour.');
    } catch {
      setMessage('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResending(true);
    setMessage(null);
    try {
      await resendVerification(user.email);
      setMessage('Email de vérification renvoyé.');
    } catch {
      setMessage('Impossible de renvoyer l\'email.');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <PageHeader greeting="Mon compte" title="Profil" showNotifications={false} />

      {user && !user.email_verified && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-amber-50 border border-amber-200 rounded-modal flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Email non vérifié</p>
            <p className="text-xs text-amber-800 mt-1">
              Activez votre compte pour publier des annonces et contacter les propriétaires.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-homify-primary hover:underline disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {resending ? 'Envoi...' : 'Renvoyer l\'email de vérification'}
            </button>
          </div>
        </div>
      )}

      {(user?.role === 'LANDLORD' || user?.role === 'ADMIN') && (
        <div className="max-w-2xl mx-auto mb-6">
          <Link
            to="/my-properties"
            className="flex items-center gap-4 p-4 bg-homify-accent/10 border border-homify-accent/20 rounded-modal hover:bg-homify-accent/15 transition"
          >
            <div className="w-12 h-12 bg-homify-accent/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-homify-accent" />
            </div>
            <div>
              <p className="font-bold text-homify-text">Mes annonces</p>
              <p className="text-sm text-homify-muted">
                {user.properties_count ?? 0} annonce(s) · Gérer et publier
              </p>
            </div>
          </Link>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-homify-card shadow-card ring-2 ring-homify-primary/20 bg-homify-primary/10 flex items-center justify-center">
            <User className="w-12 h-12 text-homify-primary" />
          </div>
          <button
            className="absolute bottom-0 right-0 bg-homify-primary p-2 rounded-full text-white border-2 border-homify-card hover:bg-homify-primary-light transition"
            aria-label="Changer la photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto bg-homify-card p-6 md:p-8 rounded-modal shadow-card border border-homify-border">
        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-homify-border">
          <User className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">Informations personnelles</h2>
        </div>

        {user && (
          <p className="text-sm text-homify-muted">
            {user.email} · {user.role === 'LANDLORD' ? 'Propriétaire' : user.role === 'TENANT' ? 'Locataire' : user.role}
          </p>
        )}

        {message && (
          <div className="p-3 bg-homify-surface text-homify-primary text-sm rounded-btn border border-homify-border">
            {message}
          </div>
        )}

        <div>
          <label className={labelClass}>Prénom</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Nom</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={inputClass}
            placeholder="237612345678"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-homify-primary text-white font-bold py-3.5 rounded-btn mt-2 shadow-sm hover:bg-homify-primary-light transition active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-homify-border text-homify-muted font-semibold py-3 rounded-btn hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
