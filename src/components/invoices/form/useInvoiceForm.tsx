
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
  
  // Need to get clients
  const clients: Client[] | undefined = queryClient.getQueryData(['clients']);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: async () => initializeForm(existingInvoice, isQuote || false, user?.id),
    mode: 'onChange',
  });

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
