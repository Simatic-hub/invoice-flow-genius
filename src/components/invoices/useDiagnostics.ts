
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDiagnostics = () => {
  const [hasConfigError, setHasConfigError] = useState(false);
  const [isPdfLibraryLoaded, setIsPdfLibraryLoaded] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('Running diagnostics...');
      
      // Check jsPDF library
      try {
        // Just check if the jsPDF module is available without instantiating
        if (typeof require !== 'undefined') {
          const jsPdfAvailable = !!require('jspdf');
          setIsPdfLibraryLoaded(jsPdfAvailable);
          console.log('jsPDF library check:', jsPdfAvailable ? 'Available' : 'Not available');
        } else {
          // In ESM environment
          import('jspdf')
            .then(() => {
              setIsPdfLibraryLoaded(true);
              console.log('jsPDF library check: Available');
            })
            .catch(err => {
              console.error('Failed to load jsPDF:', err);
              setIsPdfLibraryLoaded(false);
            });
        }
      } catch (error) {
        console.error('jsPDF library check failed:', error);
        setIsPdfLibraryLoaded(false);
      }
      
      // Check Supabase connection
      try {
        const { data, error } = await supabase.auth.getSession();
        setIsSupabaseConnected(!error);
        console.log('Supabase connection test:', error ? 'Failed' : 'Successful');
        
        // Check for required tables
        if (!error) {
          const tables = [
            'business_settings',
            'invoices',
            'quotes',
            'clients'
          ] as const; // Type this as a readonly tuple of specific strings
          
          const tableResults: Record<string, boolean> = {};
          
          for (const table of tables) {
            const { error: tableError } = await supabase
              .from(table)
              .select('count')
              .limit(1);
            
            tableResults[table] = !tableError;
            console.log(`Table check for ${table}:`, tableError ? 'Failed' : 'Successful');
          }
          
          setDiagnosticInfo(prev => ({ ...prev, tables: tableResults }));
        }
        
        // Check storage buckets
        try {
          const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
          const bucketList = buckets?.map(b => b.name) || [];
          console.log('Available buckets:', bucketList);
          setDiagnosticInfo(prev => ({ ...prev, buckets: bucketList }));
        } catch (bucketError) {
          console.error('Error checking buckets:', bucketError);
        }
        
      } catch (error) {
        console.error('Supabase connection test failed:', error);
        setIsSupabaseConnected(false);
      }
      
      // Final diagnostics result - only consider Supabase connection as critical
      // Don't flag PDF library as a critical error since it's only needed when actually generating PDFs
      const hasError = !isSupabaseConnected;
      setHasConfigError(hasError);
      console.log('Diagnostics complete. Critical error detected:', hasError);
    };
    
    runDiagnostics();
  }, []);
  
  return {
    hasConfigError,
    isPdfLibraryLoaded,
    isSupabaseConnected,
    diagnosticInfo
  };
};
