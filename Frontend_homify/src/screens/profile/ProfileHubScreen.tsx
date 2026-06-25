import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, LogOut, Mail, Building2, AlertTriangle, Shield, MessageSquare,
  Heart, Lock, Bell, SlidersHorizontal, HelpCircle, ChevronRight,
  Loader2, Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsRow';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getUnreadCount } from '@/services/messageService';
import { getNotificationUnreadCount } from '@/services/notificationService';
import { resendVerification } from '@/services/authService';

const ROLE_LABELS: Record<string, string> = {
  TENANT: 'Locataire',
  LANDLORD: 'Propriétaire',
  ADMIN: 'Administrateur',
  VISITOR: 'Visiteur',
};

function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export default function ProfileHubScreen() {
  const { user, loading, logout } = useAuth();
  const { favoriteIds } = useFavorites();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [resending, setResending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    getUnreadCount().then(setUnreadMessages).catch(() => setUnreadMessages(0));
    getNotificationUnreadCount().then(setUnreadNotifications).catch(() => setUnreadNotifications(0));
  }, []);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResending(true);
    setBanner(null);
    try {
      await resendVerification(user.email);
      setBanner('Email de vérification renvoyé.');
    } catch {
      setBanner('Impossible de renvoyer l\'email.');
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

  if (!user) {
    return (
      <div className="px-5 pt-8 text-center">
        <p className="text-homify-muted mb-4">Connectez-vous pour accéder à votre compte.</p>
        <Link to="/signin" className="text-homify-primary font-semibold hover:underline">Se connecter</Link>
      </div>
    );
  }

  const isLandlord = user.role === 'LANDLORD' || user.role === 'ADMIN';

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-2xl mx-auto">
      <PageHeader greeting="Mon espace" title="Compte & paramètres" showNotifications={false} />

      {banner && (
        <div className="mb-4 p-3 bg-homify-surface text-homify-primary text-sm rounded-btn border border-homify-border">
          {banner}
        </div>
      )}

      {user && !user.email_verified && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-modal flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Email non vérifié</p>
            <p className="text-xs text-amber-800 mt-1">
              Vérifiez votre adresse pour contacter les propriétaires et publier des annonces.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-homify-primary hover:underline disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {resending ? 'Envoi...' : 'Renvoyer l\'email'}
            </button>
          </div>
        </div>
      )}

      {/* Carte profil */}
      <div className="bg-homify-card rounded-modal border border-homify-border shadow-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-homify-primary/10 flex items-center justify-center ring-2 ring-homify-primary/20 shrink-0">
            <User className="w-8 h-8 text-homify-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-homify-text truncate">{user.full_name || `${user.first_name} ${user.last_name}`}</h2>
            <p className="text-sm text-homify-muted truncate">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide bg-homify-primary/10 text-homify-primary px-2 py-0.5 rounded-full">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
              <span className="text-[11px] text-homify-muted">
                Membre depuis {formatMemberSince(user.created_at)}
              </span>
            </div>
          </div>
          <Link
            to="/profile/personal"
            className="p-2 rounded-btn border border-homify-border text-homify-muted hover:text-homify-primary hover:border-homify-primary/30 transition shrink-0"
            aria-label="Modifier le profil"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-homify-border">
          <Link to="/favorites" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
            <p className="text-lg font-bold text-homify-primary">{favoriteIds.size}</p>
            <p className="text-[11px] text-homify-muted">Favoris</p>
          </Link>
          <Link to="/messages" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
            <p className="text-lg font-bold text-homify-primary">{unreadMessages}</p>
            <p className="text-[11px] text-homify-muted">Messages</p>
          </Link>
          <Link to="/notifications" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
            <p className="text-lg font-bold text-homify-primary">{unreadNotifications}</p>
            <p className="text-[11px] text-homify-muted">Alertes</p>
          </Link>
          {isLandlord ? (
            <Link to="/my-properties" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
              <p className="text-lg font-bold text-homify-primary">{user.properties_count ?? 0}</p>
              <p className="text-[11px] text-homify-muted">Annonces</p>
            </Link>
          ) : (
            <Link to="/assist" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
              <Sparkles className="w-5 h-5 text-homify-primary mx-auto" />
              <p className="text-[11px] text-homify-muted mt-1">Assistant</p>
            </Link>
          )}
        </div>
      </div>

      <SettingsSection title="Mon compte">
        <SettingsRow
          icon={User}
          title="Informations personnelles"
          subtitle="Nom, téléphone, email"
          to="/profile/personal"
        />
        <SettingsRow
          icon={Lock}
          title="Sécurité"
          subtitle="Mot de passe et suppression du compte"
          to="/profile/security"
        />
      </SettingsSection>

      <SettingsSection title="Application">
        <SettingsRow
          icon={Bell}
          title="Centre de notifications"
          subtitle="Historique de vos alertes"
          to="/notifications"
          badge={unreadNotifications}
        />
        <SettingsRow
          icon={Bell}
          title="Préférences de notification"
          subtitle="Emails et alertes messages"
          to="/profile/notifications"
        />
        <SettingsRow
          icon={SlidersHorizontal}
          title="Préférences"
          subtitle="Thème, ville par défaut, affichage carte"
          to="/profile/preferences"
        />
      </SettingsSection>

      <SettingsSection title="Activité">
        <SettingsRow
          icon={MessageSquare}
          title="Messages"
          subtitle="Conversations avec propriétaires et locataires"
          to="/messages"
          badge={unreadMessages}
        />
        <SettingsRow
          icon={Heart}
          title="Mes favoris"
          subtitle={`${favoriteIds.size} annonce(s) sauvegardée(s)`}
          to="/favorites"
        />
        {isLandlord && (
          <SettingsRow
            icon={Building2}
            title="Mes annonces"
            subtitle="Créer, modifier et suivre vos biens"
            to="/my-properties"
            iconClassName="bg-homify-accent/10"
          />
        )}
        {user.role === 'ADMIN' && (
          <SettingsRow
            icon={Shield}
            title="Modération admin"
            subtitle="Annonces, signalements, utilisateurs"
            to="/admin"
          />
        )}
      </SettingsSection>

      <SettingsSection title="Aide">
        <SettingsRow
          icon={Sparkles}
          title="Assistant Homify"
          subtitle="Calculateur loyer, analyse marché, FAQ"
          to="/assist"
        />
        <SettingsRow
          icon={HelpCircle}
          title="À propos"
          subtitle="Version, support et informations légales"
          to="/profile/about"
        />
      </SettingsSection>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border border-homify-border text-homify-muted font-semibold py-3.5 rounded-modal hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900 transition mt-2"
      >
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </button>
    </div>
  );
}
