import { useEffect, useState, useMemo } from 'react';
import { Home, Heart, Bot, User, Building2, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Dock from '@/components/ui/Dock/Dock';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { getUnreadCount } from '@/services/messageService';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  suppressMobileDock?: boolean;
}

type NavItem = {
  name: string;
  label: string;
  icon: typeof Home;
  badge?: number;
};

export const BottomNav = ({ activeTab, onTabChange, suppressMobileDock = false }: BottomNavProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isLandlord = user?.role === 'LANDLORD' || user?.role === 'ADMIN';
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    getUnreadCount()
      .then(setUnreadMessages)
      .catch(() => setUnreadMessages(0));
  }, [user, activeTab]);

  const NAV_ITEMS: NavItem[] = useMemo(() => [
    { name: 'Home', label: t('nav.home'), icon: Home },
    { name: 'Favorites', label: t('nav.favorites'), icon: Heart },
    { name: 'Messages', label: t('nav.messages'), icon: MessageSquare, badge: unreadMessages },
    ...(isLandlord
      ? [{ name: 'MyProperties', label: t('nav.myListings'), icon: Building2 }]
      : [{ name: 'Assist', label: t('nav.assistant'), icon: Bot }]),
    { name: 'Profile', label: t('nav.account'), icon: User },
  ], [t, isLandlord, unreadMessages]);

  const dockItems = NAV_ITEMS.map((item) => ({
    icon: (
      <div className="relative">
        <item.icon className={activeTab === item.name ? 'text-white' : 'text-homify-primary'} />
        {(item.badge ?? 0) > 0 && activeTab !== item.name && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-homify-accent text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {(item.badge ?? 0) > 9 ? '9+' : item.badge}
          </span>
        )}
      </div>
    ),
    label: item.label,
    onClick: () => onTabChange(item.name),
    active: activeTab === item.name,
  }));

  return (
    <>
      {!suppressMobileDock && <Dock items={dockItems} />}

      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col md:border-r md:border-homify-border md:bg-homify-card md:px-4 md:pt-10 md:shadow-sm">
        <div className="mb-8 px-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-homify-primary">Homify</h1>
          <p className="mt-0.5 text-xs text-homify-muted">{t('nav.tagline')}</p>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.name;
            const badge = item.badge ?? 0;
            return (
              <button
                key={item.name}
                onClick={() => onTabChange(item.name)}
                className={cn(
                  'flex items-center gap-3 rounded-btn px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-homify-primary text-white shadow-sm'
                    : 'text-homify-muted hover:bg-homify-surface hover:text-homify-primary',
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-white')} />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px]',
                    isActive ? 'bg-white/20 text-white' : 'bg-homify-accent text-white',
                  )}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {isLandlord && (
          <div className="mt-6 px-3">
            <button
              onClick={() => onTabChange('MyProperties')}
              className="w-full text-left rounded-card bg-homify-accent/10 border border-homify-accent/20 p-4 hover:bg-homify-accent/15 transition"
            >
              <p className="text-xs font-semibold text-homify-accent">{t('nav.landlordSpace')}</p>
              <p className="mt-1 text-[11px] text-homify-muted">
                {t('nav.landlordHint', { count: user?.properties_count ?? 0 })}
              </p>
            </button>
          </div>
        )}

        <div className="mt-auto mb-8 px-3">
          <div className="rounded-card bg-homify-surface p-4">
            <p className="text-xs font-semibold text-homify-primary">{t('nav.aiAssistant')}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-homify-muted">
              {t('nav.aiHint')}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
