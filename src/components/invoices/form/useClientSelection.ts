
import { useState, useEffect } from 'react';
import { Client } from './invoiceFormSchemas';
import { UseFormReturn } from 'react-hook-form';
import { InvoiceFormValues } from './invoiceFormSchemas';

export const useClientSelection = (form: UseFormReturn<InvoiceFormValues>, clients: Client[]) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  useEffect(() => {
    const clientId = form.getValues('client_id');
    if (clientId) {
      const client = clients?.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [clients, form]);

  const handleClientChange = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      form.setValue('client_id', clientId);
    }
  };

  return {
    selectedClient,
    handleClientChange
  };
};
