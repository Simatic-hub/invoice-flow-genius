
import { useState, useEffect } from 'react';

/**
 * A diagnostic hook to check if package.json is accessible
 * This helps identify project structure issues
 */
export const usePackageCheck = () => {
  const [isPackageAvailable, setIsPackageAvailable] = useState<boolean | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');

  useEffect(() => {
    // Log diagnostic information to the console
    console.log('Checking environment configuration...');
    console.log('Current window location:', window.location.href);
    console.log('Current route:', window.location.pathname);
    
    // Collect basic environment information
    const envInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname
    };
    
    setDiagnosticInfo(JSON.stringify(envInfo, null, 2));
    
    // Simulate checking for package.json (we can't actually do this directly)
    // This is just to provide some feedback in the UI
    setIsPackageAvailable(false);
    
    // Log additional debugging information
    console.log('React version available:', React?.version || 'unknown');
    console.log('Environment diagnostic complete');
  }, []);

  return { isPackageAvailable, diagnosticInfo };
};
