
import { Document, GeneratePdfOptions } from './types';
import { 
  createPdfDocument, 
  createPdfDataUrl, 
  downloadPdf 
} from './core';
import {
  addLogo,
  addCompanyInfo,
  addDocumentInfo,
  addClientInfo,
  addLineItemsTable,
  addTotals,
  addNotesAndTerms
} from './content';

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
    
    // Check if required document data exists
    if (!document || !document.invoice_number) {
      console.error('Missing required document data for PDF generation');
      throw new Error('Invalid document data');
    }
    
    const doc = createPdfDocument();
    const lineItems = document.line_items || [];
    
    // Initialize position tracker
    let yPos = 20;
    
    // Add logo if provided
    if (logoUrl) {
      yPos = addLogo(doc, logoUrl, yPos);
    }
    
    // Add business information
    yPos = addCompanyInfo(doc, businessName, businessAddress, vatNumber, yPos);
    
    // Add document information (title, dates)
    yPos = addDocumentInfo(doc, document, isQuote, yPos);
    
    // Add client information
    yPos = addClientInfo(doc, document.client_name, yPos);
    
    // Add line items table
    yPos = addLineItemsTable(doc, lineItems, yPos);
    
    // Add totals section
    yPos = addTotals(doc, lineItems, document.amount, yPos);
    
    // Add notes and payment terms
    yPos = addNotesAndTerms(doc, document.payment_terms, document.notes, yPos);
    
    // Generate the PDF data URL
    const pdfDataUrl = createPdfDataUrl(doc);
    console.log('PDF generation successful');
    return pdfDataUrl;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

// Re-export downloadPdf for backward compatibility
export { downloadPdf } from './core';
