
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useDeleteQuote = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      try {
        console.log('Deleting quote with ID:', quoteId);
        
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', quoteId);
        
        if (error) throw error;
        
        return { success: true, quoteId };
      } catch (error) {
        console.error('Error in deleteQuoteMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: t('quote_deleted') || 'Quote Deleted',
        description: t('quote_deleted_description') || 'The quote has been successfully deleted.',
      });
    },
    onError: (error) => {
      console.error('Error deleting quote:', error);
      
      toast({
        title: t('error') || 'Error',
        description: t('failed_to_delete_quote') || 'Failed to delete quote',
        variant: 'destructive',
      });
    },
  });
};
