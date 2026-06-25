import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { SettingsLayout, SettingsPanel, SettingsMessage } from '@/components/settings/SettingsLayout';
import { inputClass, labelClass } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { updateMe } from '@/services/authService';

export default function PersonalInfoScreen() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
      setMessage({ text: 'Profil mis à jour.', type: 'success' });
    } catch {
      setMessage({ text: 'Erreur lors de la mise à jour.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Informations personnelles"
      subtitle="Ces informations sont visibles lors de vos échanges sur Homify."
    >
      <SettingsPanel>
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-homify-border">
          <User className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">Identité</h2>
        </div>

        {message && <SettingsMessage message={message.text} type={message.type} />}

        <div className="mb-4">
          <label className={labelClass}>Email</label>
          <input type="email" value={user?.email ?? ''} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
          <p className="text-xs text-homify-muted mt-1">L&apos;email ne peut pas être modifié ici.</p>
        </div>

        <div className="space-y-4">
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
            <p className="text-xs text-homify-muted mt-1">Format Cameroun recommandé (237…).</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-homify-primary text-white font-bold py-3.5 rounded-btn mt-6 hover:bg-homify-primary-light transition disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </SettingsPanel>
    </SettingsLayout>
  );
}
