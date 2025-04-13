
import { useState, useEffect } from 'react';

export const useDiagnostics = () => {
  const [hasConfigError, setHasConfigError] = useState(false);
  
  useEffect(() => {
    const checkForErrors = () => {
      try {
        console.log('Checking for configuration errors...');
        console.log('Current route:', window.location.pathname);
        
        const hasErrors = !!document.querySelector('.error-message');
        setHasConfigError(hasErrors);
      } catch (error) {
        console.error('Error checking configuration:', error);
        setHasConfigError(true);
      }
    };
    
    checkForErrors();
    
    const originalConsoleError = console.error;
    console.error = function(...args) {
      setHasConfigError(true);
      originalConsoleError.apply(console, args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return { hasConfigError };
};
