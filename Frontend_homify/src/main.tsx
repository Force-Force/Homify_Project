import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import LandingPage from './screens/LandingPage';
import HomifiSignIn from './components/Authentification/HomifiSignIn';
import HomifiSignUp from './components/Authentification/HomifiSignUp';
import ForgotPassword from './components/Authentification/ForgotPassword';
import ResetPass from './components/Authentification/ResetPass';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import VerifyPendingScreen from './screens/VerifyPendingScreen';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { isAuthenticated } from './services/apiClient';
import './index.css';

function AuthenticatedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function Root() {
  const authed = isAuthenticated();

  return (
    <React.StrictMode>
      <BrowserRouter>
        <SettingsProvider>
          <Routes>
            {authed ? (
              <>
                <Route path="/*" element={<AuthenticatedApp />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<HomifiSignIn />} />
                <Route path="/signup" element={<HomifiSignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPass />} />
                <Route path="/verify-email" element={<VerifyEmailScreen />} />
                <Route path="/verify-pending" element={<VerifyPendingScreen />} />
                <Route path="/Reset-passode" element={<Navigate to="/reset-password" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </SettingsProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
