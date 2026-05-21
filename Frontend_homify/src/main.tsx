import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import AuthPage from "./components/Authentification/authpage";   // <-- create this page
import HomifiSignIn from "./components/Authentification/HomifiSignIn";
import HomifiSignUp from "./components/Authentification/HomifiSignUp";
import ForgotPassword from "./components/Authentification/ForgotPassword";
import "./index.css";
import ResetPass from "./components/Authentification/ResetPass";
function Root() {
  // Example auth check — replace with your real logic
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
              <Route path="/signin" element={<HomifiSignIn />} />
              <Route path="/signup" element={<HomifiSignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path =  "/Reset-passode" element= {<ResetPass/>} />
              <Route path="/" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/signin" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
