import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, LogOut, User, Loader2, Mail, Building2, AlertTriangle, Shield, MessageSquare, Lock } from 'lucide-react';
import { PageHeader, inputClass, labelClass } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { updateMe, resendVerification, changePassword, deleteAccount } from '@/services/authService';

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
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setMessage('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    setChangingPassword(true);
    setMessage(null);
    try {
      await changePassword(
        passwordForm.old_password,
        passwordForm.new_password,
        passwordForm.new_password_confirm,
      );
      setPasswordForm({ old_password: '', new_password: '', new_password_confirm: '' });
      setMessage('Mot de passe mis à jour.');
    } catch {
      setMessage('Impossible de changer le mot de passe.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage('Entrez votre mot de passe pour confirmer.');
      return;
    }
    setDeletingAccount(true);
    setMessage(null);
    try {
      await deleteAccount(deletePassword);
      await logout();
      window.location.href = '/';
    } catch {
      setMessage('Suppression impossible. Vérifiez votre mot de passe.');
    } finally {
      setDeletingAccount(false);
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

      <div className="max-w-2xl mx-auto mb-6">
        <Link
          to="/messages"
          className="flex items-center gap-4 p-4 bg-homify-card border border-homify-border rounded-modal hover:border-homify-primary/20 transition"
        >
          <div className="w-12 h-12 bg-homify-primary/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-homify-primary" />
          </div>
          <div>
            <p className="font-bold text-homify-text">Messages reçus</p>
            <p className="text-sm text-homify-muted">Conversations avec locataires et propriétaires</p>
          </div>
        </Link>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="max-w-2xl mx-auto mb-6">
          <Link
            to="/admin"
            className="flex items-center gap-4 p-4 bg-homify-primary/10 border border-homify-primary/20 rounded-modal hover:bg-homify-primary/15 transition"
          >
            <div className="w-12 h-12 bg-homify-primary/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-homify-primary" />
            </div>
            <div>
              <p className="font-bold text-homify-text">Modération admin</p>
              <p className="text-sm text-homify-muted">Approuver ou rejeter les annonces en attente</p>
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
      </div>

      <div className="space-y-4 max-w-2xl mx-auto mt-6 bg-homify-card p-6 md:p-8 rounded-modal shadow-card border border-homify-border">
        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-homify-border">
          <Lock className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">Mot de passe</h2>
        </div>
        <div>
          <label className={labelClass}>Mot de passe actuel</label>
          <input
            type="password"
            value={passwordForm.old_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nouveau mot de passe</label>
          <input
            type="password"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            value={passwordForm.new_password_confirm}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirm: e.target.value })}
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={handleChangePassword}
          disabled={changingPassword}
          className="w-full border border-homify-border text-homify-primary font-semibold py-3 rounded-btn hover:bg-homify-surface transition disabled:opacity-50"
        >
          {changingPassword ? 'Mise à jour...' : 'Changer le mot de passe'}
        </button>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto mt-6 bg-homify-card p-6 md:p-8 rounded-modal shadow-card border border-red-100">
        <h2 className="font-bold text-red-600">Zone dangereuse</h2>
        <p className="text-sm text-homify-muted">
          La suppression de votre compte est définitive. Vos annonces seront retirées.
        </p>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full border border-red-200 text-red-600 font-semibold py-3 rounded-btn hover:bg-red-50 transition"
          >
            Supprimer mon compte
          </button>
        ) : (
          <>
            <input
              type="password"
              placeholder="Mot de passe actuel"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className={inputClass}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                className="flex-1 py-3 rounded-btn border border-homify-border text-homify-muted font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-3 rounded-btn bg-red-600 text-white font-semibold disabled:opacity-50"
              >
                {deletingAccount ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-6">
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
