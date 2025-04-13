
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentNumber } from '@/utils/documentNumbering';
import { InvoiceFormValues } from './invoiceFormSchemas';

export const getNextInvoiceNumber = async (isQuote: boolean, userId: string | undefined) => {
  if (!userId) return isQuote ? 'QUO-000000-1' : 'INV-000000-1';
  return generateDocumentNumber(isQuote ? 'quote' : 'invoice', supabase, userId);
};

export const transformExistingInvoice = (existingInvoice: any): InvoiceFormValues | null => {
  if (!existingInvoice) return null;
  
  const rawLineItems = existingInvoice.line_items || [];
  const lineItemsArray = Array.isArray(rawLineItems) ? rawLineItems : [];
  
  const transformedLineItems = lineItemsArray.map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    description: item.description || '',
    quantity: Number(item.quantity) || 1,
    unit: item.unit || 'pieces',
    unitPrice: Number(item.unit_price) || 0,
    vatRate: String(item.vat_rate) || '21',
    total: Number(item.quantity) * Number(item.unit_price) || 0
  }));
  
  return {
    invoice_number: existingInvoice.invoice_number || '',
    client_id: existingInvoice.client_id || '',
    date: existingInvoice.date ? new Date(existingInvoice.date) : new Date(),
    due_date: existingInvoice.due_date ? new Date(existingInvoice.due_date) : null,
    delivery_date: existingInvoice.delivery_date ? new Date(existingInvoice.delivery_date) : null,
    po_number: existingInvoice.po_number || '',
    notes: existingInvoice.notes || '',
    payment_info: existingInvoice.payment_info || '',
    payment_terms: existingInvoice.payment_terms || '',
    subtotal: 0,
    vat_amount: 0,
    total: Number(existingInvoice.amount) || 0,
    line_items: transformedLineItems.length > 0 ? transformedLineItems : [
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unit: 'pieces',
        unitPrice: 0,
        vatRate: '21',
        total: 0
      }
    ]
  };
};

export const initializeForm = async (existingInvoice: any, isQuote: boolean, userId: string | undefined): Promise<InvoiceFormValues> => {
  if (existingInvoice) {
    return transformExistingInvoice(existingInvoice) as InvoiceFormValues;
  } else {
    const invoiceNumber = await getNextInvoiceNumber(isQuote, userId);
    return {
      invoice_number: invoiceNumber,
      client_id: '',
      date: new Date(),
      due_date: new Date(new Date().setDate(new Date().getDate() + 14)),
      delivery_date: null,
      po_number: '',
      notes: '',
      payment_info: '',
      payment_terms: '',
      line_items: [
        {
          id: crypto.randomUUID(),
          description: '',
          quantity: 1,
          unit: 'pieces',
          unitPrice: 0,
          vatRate: '21',
          total: 0
        }
      ],
      subtotal: 0,
      vat_amount: 0,
      total: 0,
    };
  }
};
