
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  
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
    },
    mode: 'onChange',
  });
  
  // Memoize form initialization to prevent repeated calculations
  const initializeFormValues = useCallback(async () => {
    if (!user?.id || isInitialized) return;
    
    try {
      console.log('Initializing form values...');
      const initialValues = await initializeForm(existingInvoice, isQuote || false, user.id);
      
      // Set each field individually to prevent whole form re-render
      Object.entries(initialValues).forEach(([key, value]) => {
        if (key !== 'user_id') { // Skip user_id as it's not in the form schema
          form.setValue(key as any, value, { shouldDirty: false });
        }
      });
      
      setIsInitialized(true);
      console.log('Form initialization complete');
    } catch (error) {
      console.error('Error initializing form:', error);
    }
  }, [form, existingInvoice, isQuote, user?.id, isInitialized]);
  
  // Update form values with proper initialization after component mounts
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted && !isInitialized) {
      // Small delay to prevent UI freeze during initial render
      const timer = setTimeout(() => {
        initializeFormValues();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [initializeFormValues, isInitialized]);

  // Memoize line items to prevent unnecessary renders
  const lineItems = useMemo(() => {
    return form.watch('line_items') || [];
  }, [form.watch('line_items')]);
  
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

  const onSubmit = useCallback((data: InvoiceFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        ...data,
        user_id: user?.id, // Add user_id here instead of in the form values
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
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.id, upsertInvoice]);

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
    isInitialized,
  };
};
