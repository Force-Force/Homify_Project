import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import PropertyFormScreen from './screens/PropertyFormScreen';
import MyPropertiesScreen from './screens/MyPropertiesScreen';
import LandlordBillingScreen from './screens/LandlordBillingScreen';
import LandlordStatsScreen from './screens/LandlordStatsScreen';
import LandlordVerificationScreen from './screens/LandlordVerificationScreen';
import BillingReturnScreen from './screens/BillingReturnScreen';
import MessagesLayout from './screens/MessagesLayout';
import MessagesChatRoute from './screens/MessagesChatRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminPropertiesScreen from './screens/admin/AdminPropertiesScreen';
import AdminKycScreen from './screens/admin/AdminKycScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminBillingScreen from './screens/admin/AdminBillingScreen';
import ProfileHubScreen from './screens/profile/ProfileHubScreen';
import PersonalInfoScreen from './screens/profile/PersonalInfoScreen';
import SecurityScreen from './screens/profile/SecurityScreen';
import NotificationsScreen from './screens/profile/NotificationsScreen';
import PreferencesScreen from './screens/profile/PreferencesScreen';
import AboutScreen from './screens/profile/AboutScreen';
import NotificationsInboxScreen from './screens/NotificationsInboxScreen';
import MainAi from './screens/Aisection/MainAi';
import { FavoritesProvider } from './context/FavoritesContext';
import { RoleGuard } from './components/RoleGuard';
import NotFoundScreen from './screens/NotFoundScreen';

const TAB_PATHS: Record<string, string> = {
  Home: '/home',
  Favorites: '/favorites',
  Messages: '/messages',
  MyProperties: '/my-properties',
  Assist: '/assist',
  Profile: '/profile',
};

function tabFromPath(pathname: string): string {
  if (pathname.startsWith('/messages')) return 'Messages';
  if (pathname.includes('/chat')) return 'Messages';
  if (pathname.startsWith('/notifications')) return 'Notifications';
  if (pathname.startsWith('/admin')) return 'Admin';
  if (pathname.startsWith('/my-properties') || pathname.startsWith('/landlord/') || pathname.startsWith('/property/new') || pathname.includes('/edit')) return 'MyProperties';
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
      onOpenChat={() => navigate(`/messages/${propertyId}`)}
    />
  );
}

function PropertyChatRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/messages" replace />;
  return <Navigate to={`/messages/${id}`} replace />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabFromPath(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMessagesChatPath = /^\/messages\/\d+/.test(location.pathname);
  const isMessagesRoute = location.pathname.startsWith('/messages');
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
        {!isAdminRoute && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            suppressMobileDock={isMessagesChatPath}
          />
        )}

        {isAdminRoute ? (
          <Routes>
            <Route
              path="/admin/*"
              element={
                <RoleGuard roles={['ADMIN']}>
                  <AdminLayout />
                </RoleGuard>
              }
            >
              <Route index element={<AdminDashboardScreen />} />
              <Route path="properties" element={<AdminPropertiesScreen />} />
              <Route path="kyc" element={<AdminKycScreen />} />
              <Route path="reports" element={<AdminReportsScreen />} />
              <Route path="users" element={<AdminUsersScreen />} />
              <Route path="billing" element={<AdminBillingScreen />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        ) : (
        <main
          className={
            isHomeLayout && !isDetailRoute
              ? 'md:ml-64 md:w-[calc(100%-16rem)] md:h-screen md:overflow-hidden'
              : isMessagesRoute
                ? isMessagesChatPath
                  ? 'h-dvh overflow-hidden md:ml-64 md:w-[calc(100%-16rem)] md:h-screen md:overflow-hidden md:p-0 md:max-w-none'
                  : 'px-5 pt-2 pb-28 md:ml-64 md:w-[calc(100%-16rem)] md:h-screen md:overflow-hidden md:p-0 md:pb-0 md:max-w-none'
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
            <Route path="/landlord/billing" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><LandlordBillingScreen /></RoleGuard>} />
            <Route path="/landlord/billing/return" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><BillingReturnScreen /></RoleGuard>} />
            <Route path="/landlord/stats" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><LandlordStatsScreen /></RoleGuard>} />
            <Route path="/landlord/verification" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><LandlordVerificationScreen /></RoleGuard>} />
            <Route path="/messages" element={<MessagesLayout />}>
              <Route path=":propertyId" element={<MessagesChatRoute />} />
            </Route>
            <Route path="/notifications" element={<NotificationsInboxScreen />} />
            <Route path="/property/new" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><PropertyFormScreen /></RoleGuard>} />
            <Route path="/property/:id/edit" element={<RoleGuard roles={['LANDLORD', 'ADMIN']}><PropertyFormScreen /></RoleGuard>} />
            <Route path="/property/:id" element={<PropertyDetailRoute />} />
            <Route path="/property/:id/chat" element={<PropertyChatRoute />} />
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </main>
        )}
      </div>
    </FavoritesProvider>
  );
}
