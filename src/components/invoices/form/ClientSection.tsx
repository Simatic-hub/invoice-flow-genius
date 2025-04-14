
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface Client {
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

interface ClientSectionProps {
  clients: Client[];
  selectedClient: Client | null;
  form: any;
  handleClientChange: (clientId: string) => void;
}

const ClientSection: React.FC<ClientSectionProps> = ({ 
  clients, 
  selectedClient, 
  form, 
  handleClientChange 
}) => {
  const { t } = useLanguage();
  
  // Monitor form value changes for debugging
  const clientId = form.watch('client_id');
  
  useEffect(() => {
    console.log('Client ID in form changed to:', clientId);
    console.log('Selected client is:', selectedClient);
  }, [clientId, selectedClient]);

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{t("client_information")}</h3>
        
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>{t("client")}</FormLabel>
              <Select 
                onValueChange={(value) => {
                  console.log('Select onValueChange called with:', value);
                  // First update the form value
                  field.onChange(value);
                  // Then handle client change which will update the selectedClient state
                  setTimeout(() => handleClientChange(value), 0);
                }}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="w-full bg-white border border-input">
                    <SelectValue 
                      placeholder={t("select_client")} 
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent 
                  position="popper" 
                  className="z-[9999] max-h-80 overflow-y-auto w-full bg-white"
                  align="start"
                  sideOffset={4}
                >
                  {clients && clients.length > 0 ? (
                    clients.map((client) => (
                      <SelectItem 
                        key={client.id} 
                        value={client.id} 
                        className="cursor-pointer hover:bg-slate-100"
                      >
                        {client.name} {client.company ? `(${client.company})` : ''}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">
                      {t("no_clients_found")}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedClient && (
          <div className="space-y-2 text-sm">
            {selectedClient.company && (
              <p className="font-medium">{selectedClient.company}</p>
            )}
            <p>{selectedClient.name}</p>
            {selectedClient.address && (
              <p>{selectedClient.address}</p>
            )}
            {(selectedClient.postal_code || selectedClient.city) && (
              <p>
                {selectedClient.postal_code && `${selectedClient.postal_code} `}
                {selectedClient.city}
              </p>
            )}
            {selectedClient.country && (
              <p>{selectedClient.country}</p>
            )}
            {selectedClient.vat_number && (
              <p className="mt-2">{t("vat")}: {selectedClient.vat_number}</p>
            )}
            {selectedClient.email && (
              <p>{t("email")}: {selectedClient.email}</p>
            )}
            {selectedClient.phone && (
              <p>{t("phone")}: {selectedClient.phone}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientSection;
