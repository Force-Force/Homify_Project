import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { useSettings } from '@/context/SettingsContext';
import { getDateLocale } from '@/lib/locale';

export default function ProfileHubScreen() {
  const { t } = useTranslation();
  const { locale } = useSettings();
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
      setBanner(t('profile.verificationSent'));
    } catch {
      setBanner(t('profile.verificationFailed'));
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
        <p className="text-homify-muted mb-4">{t('profile.signInPrompt')}</p>
        <Link to="/signin" className="text-homify-primary font-semibold hover:underline">{t('profile.signInLink')}</Link>
      </div>
    );
  }

  const isLandlord = user.role === 'LANDLORD' || user.role === 'ADMIN';

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-2xl mx-auto">
      <PageHeader greeting={t('profile.greeting')} title={t('profile.title')} showNotifications={false} />

      {banner && (
        <div className="mb-4 p-3 bg-homify-surface text-homify-primary text-sm rounded-btn border border-homify-border">
          {banner}
        </div>
      )}

      {user && !user.email_verified && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-modal flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{t('profile.emailUnverified')}</p>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1">
              {t('profile.emailUnverifiedHint')}
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-homify-primary hover:underline disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {resending ? t('common.sending') : t('profile.resendEmail')}
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
                {t(`roles.${user.role}`, { defaultValue: user.role })}
              </span>
              <span className="text-[11px] text-homify-muted">
                {t('profile.memberSince', {
                  date: new Date(user.created_at).toLocaleDateString(getDateLocale(locale), {
                    month: 'long',
                    year: 'numeric',
                  }),
                })}
              </span>
            </div>
          </div>
          <Link
            to="/profile/personal"
            className="p-2 rounded-btn border border-homify-border text-homify-muted hover:text-homify-primary hover:border-homify-primary/30 transition shrink-0"
            aria-label={t('profile.editProfile')}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-homify-border">
          <Link to="/favorites" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
            <p className="text-lg font-bold text-homify-primary">{favoriteIds.size}</p>
            <p className="text-[11px] text-homify-muted">{t('profile.statsFavorites')}</p>
          </Link>
          <Link to="/messages" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
            <p className="text-lg font-bold text-homify-primary">{unreadMessages}</p>
            <p className="text-[11px] text-homify-muted">{t('profile.statsMessages')}</p>
          </Link>
          <Link to="/notifications" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
            <p className="text-lg font-bold text-homify-primary">{unreadNotifications}</p>
            <p className="text-[11px] text-homify-muted">{t('profile.statsAlerts')}</p>
          </Link>
          {isLandlord ? (
            <Link to="/my-properties" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
              <p className="text-lg font-bold text-homify-primary">{user.properties_count ?? 0}</p>
              <p className="text-[11px] text-homify-muted">{t('profile.statsListings')}</p>
            </Link>
          ) : (
            <Link to="/assist" className="text-center p-2 rounded-btn hover:bg-homify-surface transition">
              <Sparkles className="w-5 h-5 text-homify-primary mx-auto" />
              <p className="text-[11px] text-homify-muted mt-1">{t('profile.statsAssistant')}</p>
            </Link>
          )}
        </div>
      </div>

      <SettingsSection title={t('profile.sectionAccount')}>
        <SettingsRow
          icon={User}
          title={t('profile.personalInfo')}
          subtitle={t('profile.personalInfoSub')}
          to="/profile/personal"
        />
        <SettingsRow
          icon={Lock}
          title={t('profile.security')}
          subtitle={t('profile.securitySub')}
          to="/profile/security"
        />
      </SettingsSection>

      <SettingsSection title={t('profile.sectionApp')}>
        <SettingsRow
          icon={Bell}
          title={t('profile.notificationCenter')}
          subtitle={t('profile.notificationCenterSub')}
          to="/notifications"
          badge={unreadNotifications}
        />
        <SettingsRow
          icon={Bell}
          title={t('profile.notificationPrefs')}
          subtitle={t('profile.notificationPrefsSub')}
          to="/profile/notifications"
        />
        <SettingsRow
          icon={SlidersHorizontal}
          title={t('profile.preferences')}
          subtitle={t('profile.preferencesSub')}
          to="/profile/preferences"
        />
      </SettingsSection>

      <SettingsSection title={t('profile.sectionActivity')}>
        <SettingsRow
          icon={MessageSquare}
          title={t('nav.messages')}
          subtitle={t('profile.messagesSub')}
          to="/messages"
          badge={unreadMessages}
        />
        <SettingsRow
          icon={Heart}
          title={t('profile.myFavorites')}
          subtitle={t('profile.myFavoritesSub', { count: favoriteIds.size })}
          to="/favorites"
        />
        {isLandlord && (
          <SettingsRow
            icon={Building2}
            title={t('profile.myListings')}
            subtitle={t('profile.myListingsSub')}
            to="/my-properties"
            iconClassName="bg-homify-accent/10"
          />
        )}
        {user.role === 'ADMIN' && (
          <SettingsRow
            icon={Shield}
            title={t('profile.adminModeration')}
            subtitle={t('profile.adminModerationSub')}
            to="/admin"
          />
        )}
      </SettingsSection>

      <SettingsSection title={t('profile.sectionHelp')}>
        <SettingsRow
          icon={Sparkles}
          title={t('profile.homifyAssistant')}
          subtitle={t('profile.homifyAssistantSub')}
          to="/assist"
        />
        <SettingsRow
          icon={HelpCircle}
          title={t('profile.about')}
          subtitle={t('profile.aboutSub')}
          to="/profile/about"
        />
      </SettingsSection>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border border-homify-border text-homify-muted font-semibold py-3.5 rounded-modal hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900 transition mt-2"
      >
        <LogOut className="w-4 h-4" />
        {t('profile.logout')}
      </button>
    </div>
  );
}
