
import { useState, useEffect, useCallback } from 'react';
import { Client } from './invoiceFormSchemas';
import { UseFormReturn } from 'react-hook-form';
import { InvoiceFormValues } from './invoiceFormSchemas';

export const useClientSelection = (form: UseFormReturn<InvoiceFormValues>, clients: Client[]) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Initialize client selection when form loads or client_id changes
  useEffect(() => {
    const clientId = form.getValues('client_id');
    if (clientId && clients?.length) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [clients, form]);

  // Handle client change with memoized callback to prevent rerenders
  const handleClientChange = useCallback((clientId: string) => {
    if (!clientId) {
      setSelectedClient(null);
      return;
    }
    
    const client = clients?.find(c => c.id === clientId);
    if (client) {
      console.log('Client selected:', client.name);
      setSelectedClient(client);
      form.setValue('client_id', clientId, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
    }
  }, [clients, form]);

  return {
    selectedClient,
    handleClientChange
  };
};
