import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Mail, MessageSquare, Home, Building2, Loader2, ChevronRight } from 'lucide-react';
import { SettingsLayout, SettingsPanel, SettingsMessage } from '@/components/settings/SettingsLayout';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from '@/services/notificationService';

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 border-b border-homify-border last:border-0">
      <div className="w-10 h-10 rounded-xl bg-homify-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-homify-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-homify-text">{title}</p>
        <p className="text-xs text-homify-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
          checked ? 'bg-homify-primary' : 'bg-homify-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-homify-card rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPrefs(await getNotificationPreferences());
    } catch {
      setPrefs(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (update: Partial<NotificationPreferences>) => {
    if (!prefs) return;
    setSaving(true);
    setMessage(null);
    const optimistic = { ...prefs, ...update };
    setPrefs(optimistic);
    try {
      const saved = await updateNotificationPreferences(update);
      setPrefs(saved);
      setMessage('Préférences enregistrées.');
    } catch {
      setPrefs(prefs);
      setMessage('Impossible de sauvegarder les préférences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Notifications"
      subtitle="Gérez vos alertes in-app et par email — synchronisées avec votre compte."
    >
      <Link
        to="/notifications"
        className="flex items-center gap-3 p-4 mb-6 bg-homify-card rounded-modal border border-homify-border shadow-card hover:border-homify-primary/30 transition"
      >
        <div className="w-10 h-10 rounded-xl bg-homify-accent/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-homify-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-homify-text">Voir toutes les notifications</p>
          <p className="text-xs text-homify-muted">Historique des alertes reçues</p>
        </div>
        <ChevronRight className="w-4 h-4 text-homify-muted" />
      </Link>

      {message && (
        <SettingsMessage message={message} type={message.includes('Impossible') ? 'error' : 'success'} />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : prefs ? (
        <SettingsPanel>
          <ToggleRow
            icon={Mail}
            title="Emails Homify"
            description="Alertes par email (messages, annonces, rappels)."
            checked={prefs.email_notifications}
            disabled={saving}
            onChange={(email_notifications) => patch({ email_notifications })}
          />
          <ToggleRow
            icon={MessageSquare}
            title="Alertes messages"
            description="Notification in-app et email lors d'un nouveau message."
            checked={prefs.message_alerts}
            disabled={saving}
            onChange={(message_alerts) => patch({ message_alerts })}
          />
          <ToggleRow
            icon={Building2}
            title="Mises à jour annonces"
            description="Approbation, rejet et publication de vos biens (propriétaires)."
            checked={prefs.property_updates}
            disabled={saving}
            onChange={(property_updates) => patch({ property_updates })}
          />
          <ToggleRow
            icon={Home}
            title="Nouvelles annonces"
            description="Alertes lors de nouvelles publications dans votre ville."
            checked={prefs.new_listing_alerts}
            disabled={saving}
            onChange={(new_listing_alerts) => patch({ new_listing_alerts })}
          />
        </SettingsPanel>
      ) : (
        <SettingsMessage message="Impossible de charger vos préférences." type="error" />
      )}

      <p className="text-xs text-homify-muted mt-4 px-1">
        Les emails de sécurité (vérification, mot de passe) sont toujours envoyés.
      </p>
    </SettingsLayout>
  );
}
