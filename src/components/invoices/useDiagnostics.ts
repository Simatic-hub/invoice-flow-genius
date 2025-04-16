
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';

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
        const doc = new jsPDF();
        const testOutput = doc.output('datauristring');
        setIsPdfLibraryLoaded(!!testOutput);
        console.log('jsPDF test successful');
      } catch (error) {
        console.error('jsPDF test failed:', error);
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
          ];
          
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
      
      // Final diagnostics result
      const hasError = !isPdfLibraryLoaded || !isSupabaseConnected;
      setHasConfigError(hasError);
      console.log('Diagnostics complete. Error detected:', hasError);
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
