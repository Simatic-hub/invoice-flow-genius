
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Quote } from '@/components/quotes/operations';
import { useLanguage } from '@/contexts/language';

export const useQuotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (quotesError) throw quotesError;
        if (!quotesData || quotesData.length === 0) return [];

        const clientIds = quotesData
          .map((quote: any) => quote.client_id)
          .filter(id => id);
        
        let clientMap: Record<string, string> = {};
        
        if (clientIds.length > 0) {
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('id, name')
            .in('id', clientIds);

          if (clientsError) throw clientsError;

          if (clientsData) {
            clientsData?.forEach(client => {
              if (client && client.id) {
                clientMap[client.id] = client.name || 'Unknown Client';
              }
            });
          }
        }

        return quotesData.map((quote: any) => ({
          ...quote,
          date: quote.date || quote.created_at,
          client_name: clientMap[quote.client_id] || 'Unknown Client'
        })) as Quote[];
      } catch (error) {
        console.error('Error fetching quotes:', error);
        toast({
          title: t('error') || 'Error',
          description: t('failed_to_load_quotes') || 'Failed to load quotes',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!user
  });

  const filteredQuotes = quotes.filter(quote => 
    quote.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    quotes,
    filteredQuotes,
    isLoading,
    searchQuery,
    setSearchQuery
  };
};
