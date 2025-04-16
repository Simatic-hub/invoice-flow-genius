
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Invoice } from '@/components/invoices/useInvoiceOperations';
import { Quote } from '@/components/quotes/useQuoteOperations';
import { supabase } from '@/integrations/supabase/client';

// Add the necessary typings for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Type to represent either an Invoice or a Quote
type Document = Invoice | Quote;

// Common interface for PDF generation options
interface GeneratePdfOptions {
  document: Document;
  isQuote: boolean;
  logoUrl?: string | null;
  businessName?: string;
  businessAddress?: string;
  vatNumber?: string;
}

/**
 * Generate a PDF for an invoice or quote
 */
export const generatePdf = async ({
  document,
  isQuote,
  logoUrl,
  businessName,
  businessAddress,
  vatNumber,
}: GeneratePdfOptions): Promise<string> => {
  try {
    console.log('Generating PDF with options:', { 
      documentId: document.id,
      documentNumber: document.invoice_number,
      isQuote,
      hasLogo: !!logoUrl,
      businessName,
    });
    
    const doc = new jsPDF();
    const documentType = isQuote ? 'Quote' : 'Invoice';
    const documentNumber = document.invoice_number;
    const lineItems = document.line_items || [];
    
    // Set default coordinates
    let yPos = 20;
    const leftMargin = 15;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add logo if provided
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'JPEG', leftMargin, yPos, 40, 20);
        yPos += 25;
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Continue without logo if there's an error
      }
    }
    
    // Add business information
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(businessName || 'Your Business', leftMargin, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (businessAddress) {
      const addressLines = businessAddress.split('\n');
      addressLines.forEach(line => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
    }
    
    if (vatNumber) {
      doc.text(`VAT: ${vatNumber}`, leftMargin, yPos);
      yPos += 5;
    }
    
    // Add document title and number
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${documentType} #${documentNumber}`, leftMargin, yPos);
    
    // Add dates
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(document.date).toLocaleDateString()}`, leftMargin, yPos);
    yPos += 5;
    
    if (document.due_date) {
      const dateLabel = isQuote ? 'Expiry Date' : 'Due Date';
      doc.text(`${dateLabel}: ${new Date(document.due_date).toLocaleDateString()}`, leftMargin, yPos);
      yPos += 5;
    }
    
    // Add client information
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', leftMargin, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(document.client_name, leftMargin, yPos);
    
    // Add line items table
    yPos += 15;
    
    if (lineItems && lineItems.length > 0) {
      const tableColumn = ["Description", "Qty", "Unit", "Price", "VAT %", "Total"];
      const tableRows = lineItems.map((item: any) => [
        item.description,
        item.quantity,
        item.unit || '',
        `$${parseFloat(item.unit_price || item.unitPrice).toFixed(2)}`,
        `${(item.vat_rate || item.vatRate) || 0}%`,
        `$${(parseFloat(item.quantity) * parseFloat(item.unit_price || item.unitPrice)).toFixed(2)}`
      ]);
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 66, 66] },
        margin: { left: leftMargin, right: leftMargin },
      });
      
      // Update yPos to after the table
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Add totals
    doc.setFontSize(10);
    doc.text(`Subtotal: $${calculateSubtotal(lineItems).toFixed(2)}`, pageWidth - 60, yPos);
    yPos += 6;
    doc.text(`VAT: $${calculateVat(lineItems).toFixed(2)}`, pageWidth - 60, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${document.amount}`, pageWidth - 60, yPos);
    
    // Add payment terms and notes
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Terms:', leftMargin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(document.payment_terms || 'N/A', leftMargin, yPos);
    
    if (document.notes) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', leftMargin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(document.notes, 180);
      doc.text(noteLines, leftMargin, yPos);
    }
    
    // Create data URL from the PDF
    const pdfDataUrl = doc.output('datauristring');
    console.log('PDF generation successful');
    return pdfDataUrl;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Helper function to calculate subtotal
 */
const calculateSubtotal = (lineItems: any[]): number => {
  if (!lineItems || !lineItems.length) return 0;
  
  return lineItems.reduce((total, item) => {
    const price = parseFloat(item.unit_price || item.unitPrice || 0);
    const quantity = parseFloat(item.quantity || 0);
    return total + (price * quantity);
  }, 0);
};

/**
 * Helper function to calculate VAT
 */
const calculateVat = (lineItems: any[]): number => {
  if (!lineItems || !lineItems.length) return 0;
  
  return lineItems.reduce((total, item) => {
    const price = parseFloat(item.unit_price || item.unitPrice || 0);
    const quantity = parseFloat(item.quantity || 0);
    const vatRate = parseFloat(item.vat_rate || item.vatRate || 0) / 100;
    return total + (price * quantity * vatRate);
  }, 0);
};

/**
 * Download a generated PDF
 */
export const downloadPdf = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get business settings from Supabase
 */
export const getBusinessSettings = async (userId: string) => {
  try {
    console.log('Fetching business settings for user:', userId);
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching business settings:', error);
      return null;
    }
    
    console.log('Business settings retrieved:', data);
    return data;
  } catch (error) {
    console.error('Exception in getBusinessSettings:', error);
    return null;
  }
};

/**
 * Fetch company logo from storage
 */
export const getCompanyLogo = async (userId: string): Promise<string | null> => {
  try {
    console.log('Fetching company logo for user:', userId);
    
    // First check if the bucket exists
    let { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return null;
    }
    
    const companyLogosBucketExists = buckets?.some(bucket => bucket.name === 'company_logos');
    
    if (!companyLogosBucketExists) {
      console.log('company_logos bucket does not exist, creating it now');
      const { error: createBucketError } = await supabase.storage.createBucket('company_logos', {
        public: false
      });
      
      if (createBucketError) {
        console.error('Error creating company_logos bucket:', createBucketError);
        return null;
      }
      
      console.log('company_logos bucket created successfully');
      return null; // No logo yet since we just created the bucket
    }
    
    // Check if the user has a folder in the bucket
    const { data, error } = await supabase
      .storage
      .from('company_logos')
      .list(userId, {
        limit: 1,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error('Error listing company logos:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No logo found for user');
      return null;
    }
    
    console.log('Logo file found:', data[0].name);
    
    const { data: logoData, error: logoError } = await supabase
      .storage
      .from('company_logos')
      .download(`${userId}/${data[0].name}`);
      
    if (logoError || !logoData) {
      console.error('Error downloading logo:', logoError);
      return null;
    }
    
    console.log('Logo downloaded successfully');
    return URL.createObjectURL(logoData);
  } catch (error) {
    console.error('Exception in getCompanyLogo:', error);
    return null;
  }
};
