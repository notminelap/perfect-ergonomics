import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SplashScreen from './components/SplashScreen';
import CustomCursor from './components/CustomCursor';
import './index.css';

function AppRoutes({ isAuthenticated, handleLogin, handleLogout, theme, setTheme }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isAuthenticated
            ? <Dashboard onLogout={handleLogout} theme={theme} setTheme={setTheme} />
            : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('auth') === 'true');
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashed'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = () => {
    localStorage.setItem('auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashed', 'true');
    setShowSplash(false);
  };

  return (
    <BrowserRouter>
      <CustomCursor />
      <Toaster position="top-right" toastOptions={{ className: 'glass-toast' }} />
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onComplete={handleSplashComplete} />}
      </AnimatePresence>
      {!showSplash && (
        <AppRoutes
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </BrowserRouter>
  );
}

export default App;
