
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import your components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Quotes from './pages/Quotes';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import { useLanguage } from './contexts/LanguageContext';

// Define the correct interfaces for the route components
interface PrivateRouteProps {
  children: React.ReactNode;
}

interface PublicRouteProps {
  children: React.ReactNode;
}

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  
  console.log('PrivateRoute - user:', user);
  console.log('PrivateRoute - loading:', loading);

  // Show loading state or placeholder while authentication status is being determined
  if (loading) {
    return <div className="flex items-center justify-center h-screen">{t('loading')}</div>;
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// PublicRoute component to redirect authenticated users away from public pages
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  
  console.log('PublicRoute - user:', user);
  console.log('PublicRoute - loading:', loading);
  
  // Show loading state or placeholder while authentication status is being determined
  if (loading) {
    return <div className="flex items-center justify-center h-screen">{t('loading')}</div>;
  }
  
  if (user) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { user, loading } = useAuth();
  const { language, t } = useLanguage();
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    console.log('App rendered with language:', language);
    console.log('Auth state in App - user:', user);
    console.log('Auth state in App - loading:', loading);
  }, [user, loading, language]);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language change detected in App');
      forceUpdate({});
    };
    
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Root path redirects to dashboard if authenticated, login if not */}
        <Route 
          path="/" 
          element={
            loading ? (
              <div className="flex items-center justify-center h-screen">{t('loading')}</div>
            ) : user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Protected routes with Layout */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Catch-all route - redirects to login if not authenticated */}
        <Route path="*" element={
          loading ? (
            <div className="flex items-center justify-center h-screen">{t('loading')}</div>
          ) : user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
