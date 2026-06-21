import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LandingPage from "./screens/LandingPage";
import HomifiSignIn from "./components/Authentification/HomifiSignIn";
import HomifiSignUp from "./components/Authentification/HomifiSignUp";
import ForgotPassword from "./components/Authentification/ForgotPassword";
import ResetPass from "./components/Authentification/ResetPass";
import "./index.css";

function Root() {
  const isAuthenticated = localStorage.getItem("access_token") !== null;

  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/*" element={<App />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<HomifiSignIn />} />
              <Route path="/signup" element={<HomifiSignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/Reset-passode" element={<ResetPass />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
