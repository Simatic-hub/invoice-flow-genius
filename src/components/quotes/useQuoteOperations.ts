import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { generatePdf, downloadPdf, getBusinessSettings, getCompanyLogo } from '@/utils/pdfGenerator';
import { useAuth } from '@/hooks/useAuth';

export interface Quote {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  date: string;
  due_date: string | null;
  amount: string | number;
  status: 'accepted' | 'pending' | 'rejected' | string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  delivery_date?: string | null;
  po_number?: string | null;
  notes?: string | null;
  payment_info?: string | null;
  payment_terms?: string | null;
  attachment_path?: string | null;
  line_items?: any[];
}

export const useQuoteOperations = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const deleteQuoteMutation = useMutation({
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

  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
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

  const duplicateQuoteMutation = useMutation({
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

  const handleGeneratePdf = async (quote: Quote) => {
    if (!user) {
      toast({
        title: t('error') || 'Error',
        description: t('not_logged_in') || 'You must be logged in to generate PDFs',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('generating_pdf') || 'Generating PDF',
      description: t('generating_pdf_description') || 'Your PDF is being generated and will be ready shortly.',
    });

    try {
      const businessSettings = await getBusinessSettings(user.id);
      const logoUrl = await getCompanyLogo(user.id);
      
      const pdfDataUrl = await generatePdf({
        document: quote,
        isQuote: true,
        logoUrl,
        businessName: businessSettings?.business_name,
        businessAddress: businessSettings?.address,
        vatNumber: businessSettings?.vat_number,
      });
      
      downloadPdf(pdfDataUrl, `Quote-${quote.invoice_number}.pdf`);
      
      toast({
        title: t('pdf_ready') || 'PDF Ready',
        description: t('pdf_ready_description') || 'Your PDF has been generated and downloaded.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('error') || 'Error',
        description: t('pdf_generation_failed') || 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    deleteQuoteMutation,
    updateQuoteStatusMutation,
    duplicateQuoteMutation,
    handleGeneratePdf
  };
};
