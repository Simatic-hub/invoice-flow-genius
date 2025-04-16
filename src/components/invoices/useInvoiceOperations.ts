
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { generatePdf, downloadPdf, getBusinessSettings, getCompanyLogo } from '@/utils/pdf';
import { useAuth } from '@/hooks/useAuth';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  date: string;
  due_date: string | null;
  amount: string | number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  paid_date?: string | null;
  delivery_date?: string | null;
  po_number?: string | null;
  notes?: string | null;
  payment_info?: string | null;
  payment_terms?: string | null;
  attachment_path?: string | null;
  line_items?: any[];
}

export const useInvoiceOperations = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const deleteInvoiceMutation = useMutation({
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

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: string }) => {
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

  const duplicateInvoiceMutation = useMutation({
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

  const handleGeneratePdf = async (invoice: Invoice) => {
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
      description: t('generating_pdf_description') || 'Your invoice PDF is being prepared for download.',
    });

    try {
      console.log('Starting PDF generation for invoice:', invoice.invoice_number);
      
      // Validate invoice data
      if (!invoice || !invoice.invoice_number) {
        throw new Error('Invalid invoice data');
      }
      
      // Ensure invoice has line items
      if (!invoice.line_items || !Array.isArray(invoice.line_items) || invoice.line_items.length === 0) {
        console.warn('Invoice has no line items, continuing with empty line items');
        invoice.line_items = [];
      }
      
      // Check Supabase connection before proceeding
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error before PDF generation:', sessionError);
          throw new Error('Authentication error');
        }
        
        if (!sessionData.session) {
          console.error('No active session found');
          throw new Error('No active session');
        }
      } catch (connectionError) {
        console.error('Connection check failed:', connectionError);
        throw new Error('Failed to connect to Supabase');
      }
      
      // Ensure storage buckets exist
      let { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Error checking buckets:', bucketsError);
        // Continue anyway, we might not need logo
      } else {
        console.log('Available buckets:', buckets?.map(b => b.name));
      }
      
      // Fetch business settings and logo
      const businessSettings = await getBusinessSettings(user.id);
      console.log('Business settings retrieved:', businessSettings);
      
      const logoUrl = await getCompanyLogo(user.id);
      console.log('Logo URL retrieved:', !!logoUrl);
      
      // Generate the PDF
      const pdfDataUrl = await generatePdf({
        document: invoice,
        isQuote: false,
        logoUrl,
        businessName: businessSettings?.business_name,
        businessAddress: businessSettings?.address,
        vatNumber: businessSettings?.vat_number,
      });
      
      // Download the PDF
      if (pdfDataUrl) {
        downloadPdf(pdfDataUrl, `Invoice-${invoice.invoice_number}.pdf`);
        
        toast({
          title: t('pdf_ready') || 'PDF Ready',
          description: t('pdf_ready_description') || 'Your PDF has been generated and downloaded.',
        });
      } else {
        throw new Error('PDF data URL is empty');
      }
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
    deleteInvoiceMutation,
    updateInvoiceStatusMutation,
    duplicateInvoiceMutation,
    handleGeneratePdf
  };
};
