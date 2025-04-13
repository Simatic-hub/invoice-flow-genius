
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { 
  invoiceSchema, 
  UseInvoiceFormProps, 
  InvoiceFormValues, 
  Client 
} from './invoiceFormSchemas';
import { initializeForm } from './invoiceFormUtils';
import { useLineItems } from './useLineItems';
import { useInvoiceCalculations } from './useInvoiceCalculations';
import { useFileAttachment } from './useFileAttachment';
import { useInvoiceMutation } from './useInvoiceMutation';
import { useClientSelection } from './useClientSelection';

export const useInvoiceForm = ({ onClose, existingInvoice, isQuote = false }: UseInvoiceFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Memoize clients to prevent unnecessary re-renders
  const clients: Client[] | undefined = queryClient.getQueryData(['clients']);

  // Initialize the form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    // Use a synchronous default value initially, then update it in useEffect
    defaultValues: {
      invoice_number: '',
      client_id: '',
      date: new Date(),
      line_items: [{
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unit: 'pieces',
        unitPrice: 0,
        vatRate: '21',
        total: 0
      }],
      subtotal: 0,
      vat_amount: 0,
      total: 0,
      user_id: user?.id || '',
    },
    mode: 'onChange',
  });
  
  // Update form values with proper initialization after component mounts
  useEffect(() => {
    const initializeFormValues = async () => {
      try {
        const initialValues = await initializeForm(existingInvoice, isQuote || false, user?.id);
        
        // Set each field individually to prevent whole form re-render
        Object.entries(initialValues).forEach(([key, value]) => {
          form.setValue(key as any, value, { shouldDirty: false });
        });
      } catch (error) {
        console.error('Error initializing form:', error);
      }
    };
    
    initializeFormValues();
  }, [form, existingInvoice, isQuote, user?.id]);

  const lineItems = form.watch('line_items') || [];
  
  const { 
    addLineItem, 
    removeLineItem, 
    moveLineItemUp, 
    moveLineItemDown 
  } = useLineItems(form);
  
  const { handleKeyDown } = useInvoiceCalculations(form);
  
  const { file, handleFileChange } = useFileAttachment();
  
  const { 
    upsertInvoice, 
    isEditMode 
  } = useInvoiceMutation({ 
    onClose, 
    existingInvoice, 
    isQuote, 
    file 
  });
  
  const { 
    selectedClient, 
    handleClientChange 
  } = useClientSelection(form, clients || []);

  // Set edit mode based on existing invoice
  useEffect(() => {
    if (existingInvoice && existingInvoice.id) {
      // We rely on isEditMode from useInvoiceMutation now
    }
  }, [existingInvoice]);

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
    // The onSuccess from the mutation will handle closing and invalidating queries
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
