
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useDeleteInvoice = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      try {
        console.log('Deleting invoice with ID:', invoiceId);
        
        const { error } = await supabase
          .from('invoices')
          .delete()
          .eq('id', invoiceId);
        
        if (error) throw error;
        
        return { success: true, invoiceId };
      } catch (error) {
        console.error('Error in deleteInvoiceMutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Delete successful:', data);
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-chart-data'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      
      toast({
        title: t('invoice_deleted') || 'Invoice Deleted',
        description: t('invoice_deleted_description') || 'The invoice has been successfully deleted.',
      });
    },
    onError: (error) => {
      console.error('Error deleting invoice:', error);
      
      toast({
        title: t('error') || 'Error',
        description: t('failed_to_delete_invoice') || 'Failed to delete invoice',
        variant: 'destructive',
      });
    },
  });
};
