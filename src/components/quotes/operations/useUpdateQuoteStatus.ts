
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { UpdateQuoteStatusParams } from './types';

export const useUpdateQuoteStatus = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, status }: UpdateQuoteStatusParams) => {
      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: t('quote_updated') || 'Quote Updated',
        description: t('quote_status_updated') || 'The quote status has been updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating quote:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failed_to_update_quote') || 'Failed to update quote status',
        variant: 'destructive',
      });
    },
  });
};
