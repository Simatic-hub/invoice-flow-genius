
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useDuplicateInvoice = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newInvoice = {
        ...invoice,
        id: undefined,
        invoice_number: `${invoice.invoice_number}-COPY`,
        date: new Date().toISOString(),
        status: 'draft',
        created_at: undefined,
        updated_at: undefined,
        line_items: invoice.line_items || []
      };
      
      const { data: createdInvoice, error: createError } = await supabase
        .from('invoices')
        .insert(newInvoice)
        .select()
        .single();
      
      if (createError) throw createError;
      
      return createdInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: t('invoice_duplicated') || 'Invoice Duplicated',
        description: t('invoice_duplicated_description') || 'A copy of the invoice has been created.',
      });
      
      return data;
    },
    onError: (error) => {
      console.error('Error duplicating invoice:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failed_to_duplicate_invoice') || 'Failed to duplicate invoice',
        variant: 'destructive',
      });
    },
  });
};
