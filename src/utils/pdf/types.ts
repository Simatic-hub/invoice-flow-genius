
import { Invoice } from '@/components/invoices/useInvoiceOperations';
import { Quote } from '@/components/quotes/useQuoteOperations';

// Type to represent either an Invoice or a Quote
export type Document = Invoice | Quote;

// Common interface for PDF generation options
export interface GeneratePdfOptions {
  document: Document;
  isQuote: boolean;
  logoUrl?: string | null;
  businessName?: string;
  businessAddress?: string;
  vatNumber?: string;
}
