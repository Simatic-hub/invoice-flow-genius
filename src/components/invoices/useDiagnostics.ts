
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
      // Just check if the jsPDF module is available without instantiating
      if (typeof require !== 'undefined') {
        const jsPdfAvailable = !!require('jspdf');
        setIsPdfLibraryLoaded(jsPdfAvailable);
        console.log('jsPDF library check:', jsPdfAvailable ? 'Available' : 'Not available');
      } else {
        // In ESM environment
        try {
          await import('jspdf');
          setIsPdfLibraryLoaded(true);
          console.log('jsPDF library check: Available');
        } catch (err) {
          console.error('Failed to load jsPDF:', err);
          setIsPdfLibraryLoaded(false);
        }
      }
    } catch (error) {
      console.error('jsPDF library check failed:', error);
      setIsPdfLibraryLoaded(false);
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
    // Collect environment information
    const envInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname
    };
    setDiagnosticInfo(envInfo);
    
    // First check Supabase connection
    const connected = await checkSupabaseConnection();
    
    // Only check PDF library if Supabase is connected
    if (connected) {
      await checkPdfLibrary();
    }
    
    // Set the final diagnosis flag
    setHasConfigError(!connected);
  }, [checkPdfLibrary, checkSupabaseConnection]);

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('Running diagnostics...');
      
      // Collect environment information first
      const envInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname
      };
      setDiagnosticInfo(envInfo);
      
      // Check Supabase connection
      await checkSupabaseConnection();
    };
    
    runDiagnostics();
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
