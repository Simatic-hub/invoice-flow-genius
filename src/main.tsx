
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './contexts/language';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Create a client
const queryClient = new QueryClient();

// Add a global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add a handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Application Error</h1>
        <p>The application failed to initialize. Please try refreshing the page.</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" 
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    }>
      <Router>
        <ThemeProvider defaultTheme="light" storageKey="invoiceflow-theme">
          <LanguageProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <App />
                <Toaster />
              </AuthProvider>
            </QueryClientProvider>
          </LanguageProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>,
);
