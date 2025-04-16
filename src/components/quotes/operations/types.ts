
import { z } from 'zod';

// Main Quote type
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

// Types for mutation parameters
export interface UpdateQuoteStatusParams {
  quoteId: string;
  status: string;
}

// PDF generation parameters
export interface PdfGenerationParams {
  quote: Quote;
}
