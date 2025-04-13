
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Invoice } from '@/components/invoices/useInvoiceOperations';

export const useInvoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: invoices = [], isLoading, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!user) return [];

      try {
        console.log('Fetching invoices for user:', user.id);
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (invoicesError) throw invoicesError;
        console.log('Fetched invoices:', invoicesData);

        if (!invoicesData || invoicesData.length === 0) {
          return [];
        }

        const clientIds = invoicesData
          .map(invoice => invoice.client_id)
          .filter(id => id);
        
        let clientMap: Record<string, string> = {};
        
        if (clientIds.length > 0) {
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('id, name')
            .in('id', clientIds);

          if (clientsError) throw clientsError;

          if (clientsData) {
            clientsData.forEach(client => {
              if (client && client.id) {
                clientMap[client.id] = client.name || 'Unknown Client';
              }
            });
          }
        }

        return invoicesData.map(invoice => ({
          ...invoice,
          invoice_number: invoice.invoice_number || `INV-${invoice.id.substring(0, 8)}`,
          date: invoice.date || invoice.created_at,
          client_name: invoice.client_id ? (clientMap[invoice.client_id] || 'Unknown Client') : 'No Client'
        })) as Invoice[];
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: t('error') || 'Error',
          description: t('failed_to_load_invoices') || 'Failed to load invoices',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!user
  });

  const filteredInvoices = useMemo(() => {
    if (!invoices || !Array.isArray(invoices)) return [];
    
    return invoices.filter(invoice => 
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery]);

  return {
    invoices,
    filteredInvoices,
    isLoading,
    refetch,
    searchQuery,
    setSearchQuery
  };
};
