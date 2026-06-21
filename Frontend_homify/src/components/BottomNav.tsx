import React from 'react';
import { Home, Heart, Search, User, Bot } from 'lucide-react';
import Dock from '@/components/ui/Dock/Dock';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_ITEMS = [
  { name: 'Home', label: 'Accueil', icon: Home },
  { name: 'Favorites', label: 'Favoris', icon: Heart },
  { name: 'Search', label: 'Recherche', icon: Search },
  { name: 'Assist', label: 'Assistant', icon: Bot },
  { name: 'Profile', label: 'Profil', icon: User },
];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const dockItems = NAV_ITEMS.map((item) => ({
    icon: <item.icon className={activeTab === item.name ? 'text-white' : 'text-homify-primary'} />,
    label: item.label,
    onClick: () => onTabChange(item.name),
    active: activeTab === item.name,
  }));

  return (
    <>
      <Dock items={dockItems} />

      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col md:border-r md:border-homify-border md:bg-homify-card md:px-4 md:pt-10 md:shadow-sm">
        <div className="mb-8 px-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-homify-primary">Homify</h1>
          <p className="mt-0.5 text-xs text-homify-muted">Trouvez votre chez-vous</p>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => onTabChange(item.name)}
                className={cn(
                  'flex items-center gap-3 rounded-btn px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-homify-primary text-white shadow-sm'
                    : 'text-homify-muted hover:bg-homify-surface hover:text-homify-primary'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-white')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto mb-8 px-3">
          <div className="rounded-card bg-homify-surface p-4">
            <p className="text-xs font-semibold text-homify-primary">Assistant IA</p>
            <p className="mt-1 text-[11px] leading-relaxed text-homify-muted">
              Analyse de marché, recherche intelligente et plus encore.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
