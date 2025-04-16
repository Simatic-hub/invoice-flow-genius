
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { generatePdf, downloadPdf, getBusinessSettings, getCompanyLogo } from '@/utils/pdf';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Quote } from './types';

export const usePdfGeneration = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

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
      description: t('generating_pdf_description') || 'Your quote PDF is being prepared for download.',
    });

    try {
      console.log('Starting PDF generation for quote:', quote.invoice_number);
      
      // Validate quote data
      if (!quote || !quote.invoice_number) {
        throw new Error('Invalid quote data');
      }
      
      // Ensure quote has line items
      if (!quote.line_items || !Array.isArray(quote.line_items) || quote.line_items.length === 0) {
        console.warn('Quote has no line items, continuing with empty line items');
        quote.line_items = [];
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
        document: quote,
        isQuote: true,
        logoUrl,
        businessName: businessSettings?.business_name,
        businessAddress: businessSettings?.address,
        vatNumber: businessSettings?.vat_number,
      });
      
      // Download the PDF
      if (pdfDataUrl) {
        downloadPdf(pdfDataUrl, `Quote-${quote.invoice_number}.pdf`);
        
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
