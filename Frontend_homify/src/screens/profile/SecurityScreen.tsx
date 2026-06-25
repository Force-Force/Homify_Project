import { useState } from 'react';
import { Lock, Trash2 } from 'lucide-react';
import { SettingsLayout, SettingsPanel, SettingsMessage } from '@/components/settings/SettingsLayout';
import { inputClass, labelClass } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { changePassword, deleteAccount } from '@/services/authService';

export default function SecurityScreen() {
  const { logout } = useAuth();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setMessage({ text: 'Les nouveaux mots de passe ne correspondent pas.', type: 'error' });
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
      setMessage({ text: 'Mot de passe mis à jour.', type: 'success' });
    } catch {
      setMessage({ text: 'Impossible de changer le mot de passe. Vérifiez l\'ancien mot de passe.', type: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage({ text: 'Entrez votre mot de passe pour confirmer.', type: 'error' });
      return;
    }
    setDeletingAccount(true);
    setMessage(null);
    try {
      await deleteAccount(deletePassword);
      await logout();
      window.location.href = '/';
    } catch {
      setMessage({ text: 'Suppression impossible. Vérifiez votre mot de passe.', type: 'error' });
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <SettingsLayout title="Sécurité" subtitle="Protégez votre compte et gérez vos accès.">
      {message && <SettingsMessage message={message.text} type={message.type} />}

      <SettingsPanel className="mb-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-homify-border">
          <Lock className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">Mot de passe</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Mot de passe actuel</label>
            <input
              type="password"
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className={labelClass}>Nouveau mot de passe</label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className={labelClass}>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={passwordForm.new_password_confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirm: e.target.value })}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleChangePassword}
          disabled={changingPassword}
          className="w-full border border-homify-border text-homify-primary font-semibold py-3 rounded-btn mt-6 hover:bg-homify-surface transition disabled:opacity-50"
        >
          {changingPassword ? 'Mise à jour...' : 'Changer le mot de passe'}
        </button>
      </SettingsPanel>

      <SettingsPanel className="border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h2 className="font-bold text-red-600">Supprimer le compte</h2>
        </div>
        <p className="text-sm text-homify-muted mb-4">
          Cette action est irréversible. Vos annonces seront retirées et vos données seront marquées comme supprimées.
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
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Mot de passe actuel"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
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
          </div>
        )}
      </SettingsPanel>
    </SettingsLayout>
  );
}
