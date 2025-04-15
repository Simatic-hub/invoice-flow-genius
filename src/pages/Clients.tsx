
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash } from 'lucide-react';
import ConfirmDialog from '@/components/clients/ConfirmDialog';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language';

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

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return [];
      }

      return data as Client[];
    },
    enabled: !!user,
  });

  const createClientMutation = useMutation({
    mutationFn: async (newClient: Omit<Client, 'id'>) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...newClient, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      toast({
        title: t("client.added") || "Client Created",
        description: t("client.added.description") || "The client has been created successfully.",
      });
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast({
        title: t("error") || "Error",
        description: t("failed.to.create.client") || "Failed to create client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (updatedClient: Client) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updatedClient)
        .eq('id', updatedClient.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      toast({
        title: t("client.updated") || "Client Updated",
        description: t("client.updated.description") || "The client has been updated successfully.",
      });
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      toast({
        title: t("error") || "Error",
        description: t("failed.to.update.client") || "Failed to update client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      toast({
        title: t("client.deleted") || "Client Deleted",
        description: t("client.deleted.description") || "The client has been deleted successfully.",
      });
      setConfirmDeleteDialogOpen(false);
      setSelectedClient(null);
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      toast({
        title: t("error") || "Error",
        description: t("failed.to.delete.client") || "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateClient = async (newClient: Omit<Client, 'id'>) => {
    createClientMutation.mutate(newClient);
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    updateClientMutation.mutate(updatedClient);
  };

  const handleDeleteClient = async (clientId: string) => {
    deleteClientMutation.mutate(clientId);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('clients.title') || 'Clients'}</h1>
        <Button onClick={() => {
          setSelectedClient(null);
          setOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('add.new.client') || 'Add Client'}
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>{t('all_clients') || 'All Clients'}</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('search') || "Search clients..."}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">{t('loading') || "Loading clients..."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name') || 'Name'}</TableHead>
                  <TableHead>{t('company') || 'Company'}</TableHead>
                  <TableHead>{t('email') || 'Email'}</TableHead>
                  <TableHead>{t('phone') || 'Phone'}</TableHead>
                  <TableHead className="text-right">{t('actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedClient(client);
                        setOpen(true);
                      }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedClient(client);
                        setConfirmDeleteDialogOpen(true);
                      }}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientFormDialog
        open={open}
        onOpenChange={setOpen}
        existingClient={selectedClient}
        onClientCreated={(clientId) => {
          console.log(`Client operation completed with ID: ${clientId}`);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteDialogOpen}
        onOpenChange={setConfirmDeleteDialogOpen}
        onConfirm={() => {
          if (selectedClient) {
            handleDeleteClient(selectedClient.id);
          }
        }}
        title={t('delete.client') || "Delete Client"}
        description={t('delete.client.confirmation') || "Are you sure you want to delete this client? This action cannot be undone."}
        confirmButtonText={t('delete') || "Delete"}
        cancelButtonText={t('cancel') || "Cancel"}
        isLoading={deleteClientMutation.isPending}
      />
    </div>
  );
};

export default Clients;
