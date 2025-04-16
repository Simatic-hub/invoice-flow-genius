
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useDuplicateQuote = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { data: quote, error: fetchError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newQuote = {
        ...quote,
        id: undefined,
        invoice_number: `${quote.invoice_number}-COPY`,
        date: new Date().toISOString(),
        status: 'pending',
        created_at: undefined,
        updated_at: undefined,
        line_items: quote.line_items || []
      };
      
      const { data: createdQuote, error: createError } = await supabase
        .from('quotes')
        .insert(newQuote)
        .select()
        .single();
      
      if (createError) throw createError;
      
      return createdQuote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: t('quote_duplicated') || 'Quote Duplicated',
        description: t('quote_duplicated_description') || 'A copy of the quote has been created.',
      });
    },
    onError: (error) => {
      console.error('Error duplicating quote:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failed_to_duplicate_quote') || 'Failed to duplicate quote',
        variant: 'destructive',
      });
    },
  });
};
