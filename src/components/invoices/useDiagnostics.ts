
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDiagnostics = () => {
  const [hasConfigError, setHasConfigError] = useState(false);
  const [isPdfLibraryLoaded, setIsPdfLibraryLoaded] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<Record<string, any>>({});
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const checkPdfLibrary = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        console.log('Running in non-browser environment, skipping PDF library check');
        return false;
      }
      
      // First check if window.jsPDF is available (global usage)
      if ((window as any).jsPDF) {
        console.log('jsPDF library check: Available (global)');
        setIsPdfLibraryLoaded(true);
        return true;
      }
      
      // Then try dynamic import to check availability
      try {
        const jsPDF = await import('jspdf');
        const autoTable = await import('jspdf-autotable');
        
        if (jsPDF && typeof jsPDF.default === 'function') {
          console.log('jsPDF library check: Available (module)');
          setIsPdfLibraryLoaded(true);
          return true;
        } else {
          console.error('jsPDF imported but constructor not available');
          setIsPdfLibraryLoaded(false);
          return false;
        }
      } catch (importError) {
        console.error('Failed to load jsPDF:', importError);
        setIsPdfLibraryLoaded(false);
        return false;
      }
    } catch (error) {
      console.error('jsPDF library check failed:', error);
      setIsPdfLibraryLoaded(false);
      return false;
    }
  }, []);

  const checkSupabaseConnection = useCallback(async () => {
    try {
      setIsCheckingConnection(true);
      console.log('Checking Supabase connection...');
      
      // Simple health check - just try to get session info
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        setIsSupabaseConnected(false);
        return false;
      }
      
      console.log('Supabase connection test: Successful');
      setIsSupabaseConnected(true);
      
      // Only try to check tables if connection succeeded
      try {
        const tables = [
          'business_settings',
          'invoices',
          'quotes',
          'clients'
        ] as const; // Type this as a readonly tuple of specific strings
        
        const tableResults: Record<string, boolean> = {};
        
        for (const table of tables) {
          try {
            const { error: tableError } = await supabase
              .from(table)
              .select('count')
              .limit(1);
            
            tableResults[table] = !tableError;
            console.log(`Table check for ${table}:`, tableError ? 'Failed' : 'Successful');
          } catch (tableCheckError) {
            console.error(`Error checking table ${table}:`, tableCheckError);
            tableResults[table] = false;
          }
        }
        
        setDiagnosticInfo(prev => ({ ...prev, tables: tableResults }));
      } catch (tablesCheckError) {
        console.error('Error checking tables:', tablesCheckError);
      }
      
      return true;
    } catch (connectionError) {
      console.error('Supabase connection check error:', connectionError);
      setIsSupabaseConnected(false);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  }, []);

  // Function to manually trigger a connection check
  const checkConnection = useCallback(async () => {
    if (isCheckingConnection) return;
    
    // Collect environment information
    const envInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname,
      jspdfVersion: '3.0.1', // Hardcoded since we can't easily access the version at runtime
    };
    setDiagnosticInfo(envInfo);
    
    // First check Supabase connection
    const connected = await checkSupabaseConnection();
    
    // Check PDF library regardless of connection status
    const pdfLibraryAvailable = await checkPdfLibrary();
    
    // Set the final diagnosis flag
    setHasConfigError(!connected || !pdfLibraryAvailable);
  }, [checkPdfLibrary, checkSupabaseConnection, isCheckingConnection]);

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('Running diagnostics...');
      
      // Don't check everything on mount, just collect basic info
      const envInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname
      };
      setDiagnosticInfo(envInfo);
      
      // Only check Supabase connection on mount, PDF library check can be deferred
      await checkSupabaseConnection();
    };
    
    // Delay diagnostics slightly to avoid blocking rendering
    const timer = setTimeout(() => {
      runDiagnostics();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [checkSupabaseConnection]);
  
  return {
    hasConfigError,
    isPdfLibraryLoaded,
    isSupabaseConnected,
    diagnosticInfo,
    isCheckingConnection,
    checkConnection
  };
};
