// Fichier: src/components/BottomNav.tsx
import React from 'react';
import { Home, Heart, Search, User } from 'lucide-react';
import { Bot } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Favorites', icon: Heart },
    { name: 'Search', icon: Search },
    { name: 'Assist', icon: Bot },
    { name: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 px-6 pb-6 md:hidden z-50">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <button 
              key={item.name}
              onClick={() => onTabChange(item.name)}
              className={`flex items-center gap-2 p-2 rounded-full transition-all duration-300 ${
                activeTab === item.name 
                  ? 'bg-blue-900 text-white px-4' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className={`w-6 h-6 ${activeTab === item.name ? 'fill-current' : ''}`} />
              {activeTab === item.name && <span className="text-sm font-medium">{item.name}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop left sidebar navigation */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col md:pt-10 md:px-4 bg-blue-950 border-r border-blue-900 shadow-xl gap-4 md:mr-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onTabChange(item.name)}
            className={`
              flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300
              ${activeTab === item.name
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 transform scale-102'
                : 'text-slate-300 hover:bg-blue-900/50 hover:text-white'}
            `}
          >
            <item.icon
              className={`w-5 h-5 transition-colors duration-300 ${
                activeTab === item.name ? 'text-white' : 'text-slate-400'
              }`}
            />
            <span className="truncate">{item.name}</span>
          </button>
        ))}
      </div>

    </>
  );
};