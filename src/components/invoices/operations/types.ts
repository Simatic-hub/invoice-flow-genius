
import { z } from 'zod';

// Main Invoice type
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

// Types for mutation parameters
export interface UpdateInvoiceStatusParams {
  invoiceId: string;
  status: string;
}

// PDF generation parameters
export interface PdfGenerationParams {
  invoice: Invoice;
}
