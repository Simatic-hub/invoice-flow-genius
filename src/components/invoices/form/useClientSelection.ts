
import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from './invoiceFormSchemas';
import { UseFormReturn } from 'react-hook-form';
import { InvoiceFormValues } from './invoiceFormSchemas';

export const useClientSelection = (form: UseFormReturn<InvoiceFormValues>, clients: Client[]) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const initialized = useRef(false);
  
  // Initialize client selection when form loads or client_id changes
  useEffect(() => {
    // This should only run once when clients are loaded or when client_id changes in the form
    const clientId = form.getValues('client_id');
    console.log('useClientSelection useEffect - client_id from form:', clientId);
    
    if (clientId && clients?.length) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        console.log('Found client from ID, setting selectedClient:', client.name);
        setSelectedClient(client);
        initialized.current = true;
      } else {
        console.log('Client with ID not found in clients array:', clientId);
      }
    } else {
      console.log('No client ID or no clients array');
      if (selectedClient) {
        console.log('Clearing selectedClient as there is no clientId');
        setSelectedClient(null);
      }
    }
  }, [clients, form, selectedClient]);

  // Handle client change
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
    } else {
      console.warn('Client with ID not found:', clientId);
      setSelectedClient(null);
    }
  }, [clients]);

  return {
    selectedClient,
    handleClientChange
  };
};
