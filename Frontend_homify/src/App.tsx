import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import MainAi from './screens/Aisection/MainAi';
import { FavoritesProvider } from './context/FavoritesContext';

const TAB_PATHS: Record<string, string> = {
  Home: '/home',
  Favorites: '/favorites',
  Search: '/home',
  Assist: '/assist',
  Profile: '/profile',
};

function tabFromPath(pathname: string): string {
  if (pathname.startsWith('/favorites')) return 'Favorites';
  if (pathname.startsWith('/assist')) return 'Assist';
  if (pathname.startsWith('/profile')) return 'Profile';
  return 'Home';
}

function PropertyDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const propertyId = Number(id);

  if (!propertyId) return <Navigate to="/home" replace />;

  return (
    <PropertyDetailsScreen
      propertyId={propertyId}
      onBack={() => navigate(-1)}
      onOpenChat={() => navigate(`/property/${propertyId}/chat`)}
    />
  );
}

function PropertyChatRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const propertyId = Number(id);

  if (!propertyId) return <Navigate to="/home" replace />;

  return <ChatScreen propertyId={propertyId} onBack={() => navigate(`/property/${propertyId}`)} />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabFromPath(location.pathname);
  const isChatRoute = location.pathname.includes('/chat');
  const isDetailRoute = location.pathname.startsWith('/property/') && !isChatRoute;
  const isHomeLayout = location.pathname === '/home' || location.pathname === '/';

  const handleTabChange = (tab: string) => {
    navigate(TAB_PATHS[tab] ?? '/home');
  };

  return (
    <FavoritesProvider>
      <div className="min-h-screen bg-homify-surface font-sans">
        {!isChatRoute && (
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        )}

        <main
          className={
            isHomeLayout && !isDetailRoute
              ? 'md:ml-64 md:w-[calc(100%-16rem)] md:h-screen md:overflow-hidden'
              : isDetailRoute
                ? 'pt-4 md:pt-8 md:ml-64 md:w-[calc(100%-16rem)] md:max-w-6xl md:mx-auto md:px-6 lg:px-8'
                : 'pt-6 md:pt-8 md:ml-64 md:w-[calc(100%-16rem)] md:max-w-5xl md:mx-auto md:px-8'
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/favorites" element={<FavoritesScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/assist" element={<MainAi />} />
            <Route path="/property/:id" element={<PropertyDetailRoute />} />
            <Route path="/property/:id/chat" element={<PropertyChatRoute />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </FavoritesProvider>
  );
}
