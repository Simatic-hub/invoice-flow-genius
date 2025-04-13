
import { useState, useEffect, useCallback } from 'react';
import { Client } from './invoiceFormSchemas';
import { UseFormReturn } from 'react-hook-form';
import { InvoiceFormValues } from './invoiceFormSchemas';

export const useClientSelection = (form: UseFormReturn<InvoiceFormValues>, clients: Client[]) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Initialize client selection when form loads or client_id changes
  useEffect(() => {
    try {
      const clientId = form.getValues('client_id');
      console.log('Initial client_id from form:', clientId);
      
      if (clientId && clients?.length) {
        const client = clients.find(c => c.id === clientId);
        if (client) {
          console.log('Found initial client:', client.name);
          setSelectedClient(client);
        } else {
          console.log('Initial client not found in clients array');
        }
      }
    } catch (error) {
      console.error('Error in useClientSelection useEffect:', error);
    }
  }, [clients, form]);

  // Handle client change with memoized callback to prevent rerenders
  const handleClientChange = useCallback((clientId: string) => {
    console.log('handleClientChange called with clientId:', clientId);
    
    if (!clientId) {
      console.log('No client ID provided, clearing selection');
      setSelectedClient(null);
      return;
    }
    
    const client = clients?.find(c => c.id === clientId);
    if (client) {
      console.log('Client selected:', client.name);
      setSelectedClient(client);
      
      // Update form value with validation
      form.setValue('client_id', clientId, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
    } else {
      console.warn('Client with ID not found:', clientId);
    }
  }, [clients, form]);

  return {
    selectedClient,
    handleClientChange
  };
};
