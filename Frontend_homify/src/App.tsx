// Fichier: src/App.tsx
import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import { Hotel } from './types';
import MainAi from './screens/Aisection/MainAi';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isChatting, setIsChatting] = useState(false);

  const renderContent = () => {
    if (isChatting) {
      return (
        <ChatScreen
          onBack={() => setIsChatting(false)}
          agentName="John Doe"
        />
      );
    }

    if (selectedHotel) {
      return (
        <PropertyDetailsScreen
          hotel={selectedHotel}
          onBack={() => setSelectedHotel(null)}
          onBookNow={() => setIsChatting(true)}
        />
      );
    }

    switch (activeTab) {
      case 'Home':
        return <HomeScreen onHotelClick={setSelectedHotel} />;
      case 'Favorites':
        return <FavoritesScreen onHotelClick={setSelectedHotel} />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Search':
      case 'Assist':
        return <MainAi />;
      default:
        return <HomeScreen onHotelClick={setSelectedHotel} />;
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedHotel(null);
    setActiveTab(tab);
  };

  const isHomeLayout = activeTab === 'Home' && !selectedHotel && !isChatting;
  const isDetailsLayout = !!selectedHotel && !isChatting;

  return (
    <div className="min-h-screen bg-homify-surface font-sans">
      {!isChatting && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      <main
        className={
          isHomeLayout
            ? 'md:ml-64 md:w-[calc(100%-16rem)] md:h-screen md:overflow-hidden'
            : isDetailsLayout
              ? 'pt-4 md:pt-8 md:ml-64 md:w-[calc(100%-16rem)] md:max-w-6xl md:mx-auto md:px-6 lg:px-8'
              : 'pt-6 md:pt-8 md:ml-64 md:w-[calc(100%-16rem)] md:max-w-5xl md:mx-auto md:px-8'
        }
      >
        {renderContent()}
      </main>
    </div>
  );
}
