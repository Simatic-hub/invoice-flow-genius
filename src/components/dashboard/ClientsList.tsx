
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from "@/contexts/language";

interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  vat_number?: string | null;
  total_spent?: string;
  last_invoice?: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getRandomColor = (text: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
  ];
  const index = text.charCodeAt(0) % colors.length;
  return colors[index];
};

const ClientsList = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['recent-clients'],
    queryFn: async () => {
      if (!user) return [];

      // Get the most recent 4 clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email, company, vat_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (clientsError) {
        console.error('Error fetching recent clients:', clientsError);
        return [];
      }

      // For each client, get their total spent and last invoice date
      const clientsWithDetails = await Promise.all(
        clientsData.map(async (client) => {
          // Get all invoices for this client
          const { data: invoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('amount, created_at, status')
            .eq('client_id', client.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (invoicesError) {
            console.error(`Error fetching invoices for client ${client.id}:`, invoicesError);
            return {
              ...client,
              total_spent: '$0.00',
              last_invoice: t('clients.no.invoices') || 'No invoices yet'
            };
          }

          // Calculate total spent (only count paid invoices)
          const totalSpent = invoices
            .filter(invoice => invoice.status === 'paid')
            .reduce((sum, invoice) => sum + parseFloat(invoice.amount.toString()), 0);

          // Get the date of the most recent invoice
          const lastInvoice = invoices.length > 0 
            ? formatRelativeTime(invoices[0].created_at) 
            : t('clients.no.invoices') || 'No invoices yet';

          return {
            ...client,
            total_spent: `$${totalSpent.toFixed(2)}`,
            last_invoice: lastInvoice
          };
        })
      );

      return clientsWithDetails;
    },
    enabled: !!user
  });

  // Format the relative time (e.g., "2 hours ago", "Yesterday")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 7) {
      return date.toLocaleDateString();
    } else if (diffDays > 1) {
      return `${diffDays} days ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffHours >= 1) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMinutes >= 1) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('clients.recent')}</CardTitle>
        <Button asChild variant="ghost" size="sm" className="btn-hover">
          <Link to="/clients">
            {t('view.all')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('clients.client')}</TableHead>
                {!isMobile && <TableHead>{t('clients.email')}</TableHead>}
                <TableHead>{t('clients.total.spent')}</TableHead>
                {!isMobile && <TableHead>{t('clients.last.invoice')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 2 : 4} className="text-center py-4">
                    {t('loading')}
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 2 : 4} className="text-center py-4">
                    {t('no_clients_found')}
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={getRandomColor(client.name)}>
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </TableCell>
                    {!isMobile && <TableCell>{client.email || 'N/A'}</TableCell>}
                    <TableCell>{client.total_spent || '$0.00'}</TableCell>
                    {!isMobile && <TableCell>{client.last_invoice || t('clients.no.invoices')}</TableCell>}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientsList;
