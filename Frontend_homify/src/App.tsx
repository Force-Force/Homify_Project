import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import PropertyFormScreen from './screens/PropertyFormScreen';
import MyPropertiesScreen from './screens/MyPropertiesScreen';
import MessagesScreen from './screens/MessagesScreen';
import AdminModerationScreen from './screens/AdminModerationScreen';
import ProfileHubScreen from './screens/profile/ProfileHubScreen';
import PersonalInfoScreen from './screens/profile/PersonalInfoScreen';
import SecurityScreen from './screens/profile/SecurityScreen';
import NotificationsScreen from './screens/profile/NotificationsScreen';
import PreferencesScreen from './screens/profile/PreferencesScreen';
import AboutScreen from './screens/profile/AboutScreen';
import ChatScreen from './screens/ChatScreen';
import MainAi from './screens/Aisection/MainAi';
import { FavoritesProvider } from './context/FavoritesContext';
import { RoleGuard } from './components/RoleGuard';
import NotFoundScreen from './screens/NotFoundScreen';

const TAB_PATHS: Record<string, string> = {
  Home: '/home',
  Favorites: '/favorites',
  Search: '/home',
  MyProperties: '/my-properties',
  Assist: '/assist',
  Profile: '/profile',
};

function tabFromPath(pathname: string): string {
  if (pathname.startsWith('/messages')) return 'Messages';
  if (pathname.startsWith('/admin')) return 'Admin';
  if (pathname.startsWith('/my-properties') || pathname.startsWith('/property/new') || pathname.includes('/edit')) return 'MyProperties';
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
  const isDetailRoute =
    location.pathname.startsWith('/property/') &&
    !isChatRoute &&
    !location.pathname.endsWith('/new') &&
    !location.pathname.endsWith('/edit');
  const isHomeLayout = location.pathname === '/home' || location.pathname === '/';

  const handleTabChange = (tab: string) => {
    navigate(TAB_PATHS[tab] ?? '/home');
  };

  return (
    <FavoritesProvider>
      <div className="min-h-screen bg-homify-surface font-sans">
        {!isChatRoute && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}

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
            <Route path="/profile" element={<ProfileHubScreen />} />
            <Route path="/profile/personal" element={<PersonalInfoScreen />} />
            <Route path="/profile/security" element={<SecurityScreen />} />
            <Route path="/profile/notifications" element={<NotificationsScreen />} />
            <Route path="/profile/preferences" element={<PreferencesScreen />} />
            <Route path="/profile/about" element={<AboutScreen />} />
            <Route path="/assist" element={<MainAi />} />
            <Route path="/my-properties" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><MyPropertiesScreen /></RoleGuard>} />
            <Route path="/messages" element={<MessagesScreen />} />
            <Route path="/admin" element={<RoleGuard roles={['ADMIN']}><AdminModerationScreen /></RoleGuard>} />
            <Route path="/property/new" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><PropertyFormScreen /></RoleGuard>} />
            <Route path="/property/:id/edit" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><PropertyFormScreen /></RoleGuard>} />
            <Route path="/property/:id" element={<PropertyDetailRoute />} />
            <Route path="/property/:id/chat" element={<PropertyChatRoute />} />
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </main>
      </div>
    </FavoritesProvider>
  );
}
