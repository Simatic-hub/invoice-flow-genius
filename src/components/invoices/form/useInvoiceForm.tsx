
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentNumber } from '@/utils/documentNumbering';
import { useLanguage } from '@/contexts/LanguageContext';

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string(),
  unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
  vatRate: z.string(),
  total: z.number().optional(),
});

export type LineItem = z.infer<typeof lineItemSchema>;

const invoiceSchema = z.object({
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

interface UseInvoiceFormProps {
  onClose: () => void;
  existingInvoice?: any;
  isQuote?: boolean;
}

export const useInvoiceForm = ({ onClose, existingInvoice, isQuote = false }: UseInvoiceFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Need to get clients - MOVED THIS UP before it's referenced
  const clients: Client[] | undefined = queryClient.getQueryData(['clients']);

  useEffect(() => {
    if (existingInvoice && existingInvoice.id) {
      setIsEditMode(true);
    }
  }, [existingInvoice]);

  const getNextInvoiceNumber = async () => {
    if (!user) return isQuote ? 'QUO-000000-1' : 'INV-000000-1';
    return generateDocumentNumber(isQuote ? 'quote' : 'invoice', supabase, user.id);
  };

  const transformExistingInvoice = () => {
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

  const initializeForm = async () => {
    if (existingInvoice) {
      return transformExistingInvoice();
    } else {
      const invoiceNumber = await getNextInvoiceNumber();
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

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: async () => initializeForm(),
    mode: 'onChange',
  });

  const lineItems = form.watch('line_items') || [];
  
  // Watch for all form changes to ensure calculations update
  form.watch();

  useEffect(() => {
    const clientId = form.getValues('client_id');
    if (clientId) {
      const client = clients?.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [clients, form]);
  
  // Enhanced calculation effect to ensure proper updates
  useEffect(() => {
    if (!lineItems || !Array.isArray(lineItems)) return;
    
    let subtotal = 0;
    let vatAmount = 0;
    
    lineItems.forEach(item => {
      if (!item) return;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const vatRate = parseInt(item.vatRate || '0');
      
      const lineTotal = quantity * unitPrice;
      subtotal += lineTotal;
      vatAmount += lineTotal * (vatRate / 100);
    });
    
    const total = subtotal + vatAmount;
    
    // Update the form with the new calculated values
    form.setValue('subtotal', subtotal, { shouldValidate: false });
    form.setValue('vat_amount', vatAmount, { shouldValidate: false });
    form.setValue('total', total, { shouldValidate: false });
    
    // Update individual line item totals
    lineItems.forEach((item, index) => {
      if (!item) return;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      form.setValue(`line_items.${index}.total`, quantity * unitPrice, { shouldValidate: false });
    });
    
    // Force re-render by triggering form state update
    form.trigger();
  }, [lineItems, form]);

  const handleClientChange = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      form.setValue('client_id', clientId);
    }
  };

  const addLineItem = () => {
    const currentItems = form.getValues('line_items') || [];
    form.setValue('line_items', [
      ...currentItems,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unit: 'pieces',
        unitPrice: 0,
        vatRate: '21',
        total: 0
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues('line_items') || [];
    if (currentItems.length > 1) {
      form.setValue(
        'line_items',
        currentItems.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: t("cannot_remove") || "Cannot remove",
        description: t("need_one_line_item") || "You need at least one line item",
        variant: "destructive"
      });
    }
  };

  const moveLineItemUp = (index: number) => {
    if (index === 0) return;
    const items = [...(form.getValues('line_items') || [])];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    form.setValue('line_items', items);
  };

  const moveLineItemDown = (index: number) => {
    const items = form.getValues('line_items') || [];
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    form.setValue('line_items', newItems);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const upsertInvoice = useMutation({
    mutationFn: async (data: InvoiceFormValues) => {
      if (!user) throw new Error("User not authenticated");
      
      const tableName = isQuote ? 'quotes' : 'invoices';
      const invoiceData = {
        user_id: user.id,
        client_id: data.client_id,
        invoice_number: data.invoice_number,
        date: data.date.toISOString(),
        due_date: data.due_date ? data.due_date.toISOString() : null,
        delivery_date: data.delivery_date ? data.delivery_date.toISOString() : null,
        po_number: data.po_number || '',
        notes: data.notes || '',
        amount: data.total,
        status: isQuote ? 'pending' : (isEditMode ? existingInvoice.status : 'draft'),
        payment_info: data.payment_info || '',
        payment_terms: data.payment_terms || '',
        line_items: (data.line_items || []).map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          vat_rate: item.vatRate,
          total: item.quantity * item.unitPrice
        }))
      };
      
      let response;
      
      try {
        if (isEditMode) {
          const { data: updatedDoc, error } = await supabase
            .from(tableName)
            .update(invoiceData)
            .eq('id', existingInvoice.id)
            .select()
            .single();
          
          if (error) throw error;
          response = updatedDoc;
          
          if (file) {
            const fileName = `${user.id}/${tableName}_${existingInvoice.id}_${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('attachments')
              .upload(fileName, file, { upsert: true });
              
            if (uploadError) throw uploadError;
            
            const { error: updateError } = await supabase
              .from(tableName)
              .update({ attachment_path: fileName })
              .eq('id', existingInvoice.id);
              
            if (updateError) throw updateError;
          }
        } else {
          const { data: newDoc, error } = await supabase
            .from(tableName)
            .insert(invoiceData)
            .select()
            .single();
          
          if (error) throw error;
          response = newDoc;
          
          if (file) {
            const fileName = `${user.id}/${tableName}_${newDoc.id}_${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('attachments')
              .upload(fileName, file);
              
            if (uploadError) throw uploadError;
            
            const { error: updateError } = await supabase
              .from(tableName)
              .update({ attachment_path: fileName })
              .eq('id', newDoc.id);
              
            if (updateError) throw updateError;
          }
        }
        
        return response;
      } catch (error) {
        console.error('Error in upsertInvoice:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditMode 
          ? isQuote ? t("quote_updated") || "Quote Updated" : t("invoice_updated") || "Invoice Updated"
          : isQuote ? t("quote_created") || "Quote Created" : t("invoice_created") || "Invoice Created",
        description: isEditMode
          ? isQuote ? t("quote_updated_description") || "Your quote has been updated successfully." : t("invoice_updated_description") || "Your invoice has been updated successfully."
          : isQuote ? t("quote_created_description") || "Your quote has been created successfully." : t("invoice_created_description") || "Your invoice has been created successfully.",
      });
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [isQuote ? 'quotes' : 'invoices'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['invoice-chart-data'] });
        queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
        
        setIsSubmitting(false);
        onClose();
      }, 100);
    },
    onError: (error) => {
      console.error('Error saving document:', error);
      toast({
        title: t("error") || "Error",
        description: `${t("failed_to_save") || "Failed to save"} ${isQuote ? t("quote") || "quote" : t("invoice") || "invoice"}: ${error.message}`,
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: InvoiceFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const formattedData = {
      ...data,
      due_date: data.due_date ? data.due_date : null,
      delivery_date: data.delivery_date ? data.delivery_date : null,
      po_number: data.po_number || '',
      notes: data.notes || '',
      payment_info: data.payment_info || '',
      payment_terms: data.payment_terms || '',
      line_items: data.line_items || []
    };
    
    upsertInvoice.mutate(formattedData);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Force recalculation when Enter is pressed
      const currentItems = form.getValues('line_items') || [];
      form.setValue('line_items', [...currentItems], { shouldDirty: true });
    }
  };

  return {
    form,
    lineItems,
    selectedClient,
    file,
    isSubmitting,
    isEditMode,
    onSubmit,
    handleClientChange,
    addLineItem,
    removeLineItem,
    moveLineItemUp,
    moveLineItemDown,
    handleFileChange,
    handleKeyDown,
    clients: clients || [],
    upsertInvoice,
  };
};
