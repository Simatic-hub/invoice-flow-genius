
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { UpdateInvoiceStatusParams } from './types';

export const useUpdateInvoiceStatus = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, status }: UpdateInvoiceStatusParams) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: t('invoice_updated') || 'Invoice Updated',
        description: t('invoice_status_updated') || 'The invoice status has been updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating invoice:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failed_to_update_invoice_status') || 'Failed to update invoice status',
        variant: 'destructive',
      });
    },
  });
};
