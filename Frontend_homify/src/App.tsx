// Fichier: src/App.tsx
import React, { useState } from 'react';
import { User } from 'lucide-react';
// Imports
import { BottomNav } from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen'; // <--- Import du Chat
import { Hotel } from './types';
import MainAi from './screens/Aisection/MainAi';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  // Nouvel état pour savoir si on est dans le chat
  const [isChatting, setIsChatting] = useState(false); 

  const renderContent = () => {
    // 1. Si on est en mode Chat (Priorité absolue)
    if (isChatting) {
      return (
        <ChatScreen 
          onBack={() => setIsChatting(false)} 
          agentName="John Doe" 
        />
      );
    }

    // 2. Si un hôtel est sélectionné (Détails)
    if (selectedHotel) {
      return (
        <PropertyDetailsScreen 
          hotel={selectedHotel} 
          onBack={() => setSelectedHotel(null)} 
          onBookNow={() => setIsChatting(true)} // <--- Lance le chat
        />
      );
    }

    // 3. Navigation Principale
    switch (activeTab) {
      case 'Home':
        return <HomeScreen onHotelClick={setSelectedHotel} />;
      case 'Favorites':
        return <FavoritesScreen onHotelClick={setSelectedHotel} />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Search':
      case 'Assist':
        return <MainAi/>
      default:
        return <HomeScreen onHotelClick={setSelectedHotel} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <div className="pt-6 md:pt-10 md:ml-64 md:mr-6">
        {renderContent()}
      </div>

      {/* On cache la navigation si on est dans les détails ou dans le chat */}
      {!selectedHotel && !isChatting && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}