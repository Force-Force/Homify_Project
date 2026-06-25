import { Bell, Mail, MessageSquare, Home } from 'lucide-react';
import { SettingsLayout, SettingsPanel } from '@/components/settings/SettingsLayout';
import { useSettings } from '@/context/SettingsContext';

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
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
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-homify-primary' : 'bg-homify-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <SettingsLayout
      title="Notifications"
      subtitle="Choisissez comment Homify vous contacte. Les préférences sont enregistrées sur cet appareil."
    >
      <SettingsPanel>
        <ToggleRow
          icon={Mail}
          title="Emails Homify"
          description="Confirmations, vérification de compte et alertes importantes."
          checked={settings.emailNotifications}
          onChange={(emailNotifications) => updateSettings({ emailNotifications })}
        />
        <ToggleRow
          icon={MessageSquare}
          title="Alertes messages"
          description="Notification lors d'un nouveau message sur une annonce."
          checked={settings.messageAlerts}
          onChange={(messageAlerts) => updateSettings({ messageAlerts })}
        />
        <ToggleRow
          icon={Home}
          title="Nouvelles annonces"
          description="Recevoir un résumé des biens correspondant à votre ville par défaut."
          checked={settings.newListingAlerts}
          onChange={(newListingAlerts) => updateSettings({ newListingAlerts })}
        />
      </SettingsPanel>

      <p className="text-xs text-homify-muted mt-4 px-1">
        Les emails transactionnels (sécurité, modération) restent envoyés indépendamment de ces réglages.
      </p>
    </SettingsLayout>
  );
}
