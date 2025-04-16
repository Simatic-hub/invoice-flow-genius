
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { generatePdf, downloadPdf, getBusinessSettings, getCompanyLogo } from '@/utils/pdf';
import { Invoice } from './types';

export const usePdfGeneration = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

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

  return { handleGeneratePdf };
};

// Need to import supabase after the function definition to avoid circular dependency
import { supabase } from '@/integrations/supabase/client';
