
import { z } from 'zod';

export const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string(),
  unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
  vatRate: z.string(),
  total: z.number().optional(),
});

export type LineItem = z.infer<typeof lineItemSchema>;

export const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  client_id: z.string().min(1, "Client is required"),
  date: z.date(),
  due_date: z.date().optional().nullable(),
  delivery_date: z.date().optional().nullable(),
  po_number: z.string().optional().nullable().default(""),
  notes: z.string().optional().nullable().default(""),
  payment_info: z.string().optional().nullable().default(""),
  payment_terms: z.string().optional().nullable().default(""),
  subtotal: z.number().optional(),
  vat_amount: z.number().optional(),
  total: z.number().optional(),
  line_items: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  vat_number?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export interface UseInvoiceFormProps {
  onClose: () => void;
  existingInvoice?: any;
  isQuote?: boolean;
}
