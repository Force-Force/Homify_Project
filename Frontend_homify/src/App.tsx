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

  return (
    <div className="min-h-screen bg-homify-surface font-sans">
      <div className="pt-6 md:pt-8 md:ml-64 md:mr-8 max-w-7xl">
        {renderContent()}
      </div>

      {!selectedHotel && !isChatting && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}
