
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { extendedSupabase } from '@/integrations/supabase/extended-client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

// Define types for our activity items
interface ActivityItem {
  id: string;
  type: 'invoice' | 'quote' | 'client' | 'payment';
  title: string;
  date: string;
  status?: 'paid' | 'pending' | 'overdue' | 'created' | 'accepted' | 'rejected';
  amount?: string;
}

// Define interfaces for API responses to ensure type safety
interface InvoiceData {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  client_id: string;
  invoice_number: string;
  date: string;
}

interface QuoteData {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  client_id: string;
  invoice_number: string;
  date: string;
}

interface ClientData {
  id: string;
  name: string;
  created_at: string;
}

const ActivityIcon = ({ type, status }: { type: ActivityItem['type'], status?: ActivityItem['status'] }) => {
  switch (type) {
    case 'invoice':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'quote':
      return <FileText className="h-4 w-4 text-orange-500" />;
    case 'client':
      return <User className="h-4 w-4 text-purple-500" />;
    case 'payment':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

const StatusBadge = ({ status }: { status?: ActivityItem['status'] }) => {
  if (!status) return null;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      status === 'paid' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      status === 'overdue' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      status === 'created' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      status === 'accepted' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      status === 'rejected' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
    )}>
      {status}
    </span>
  );
};

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

const RecentActivity = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Fetch recent activity data
  const { data: activityData = [], isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Get recent invoices
        const invoicesResponse = await supabase
          .from('invoices')
          .select('id, amount, status, created_at, client_id, invoice_number, date')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (invoicesResponse.error) {
          console.error('Error fetching recent invoices:', invoicesResponse.error);
          throw invoicesResponse.error;
        }

        const invoices = invoicesResponse.data || [];

        // Get recent quotes - use type assertion to ensure TypeScript knows this is valid
        const quotesResponse = await supabase
          .from('quotes')
          .select('id, amount, status, created_at, client_id, invoice_number, date')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (quotesResponse.error) {
          console.error('Error fetching recent quotes:', quotesResponse.error);
          throw quotesResponse.error;
        }

        const quotes = quotesResponse.data || [];

        // Get recent clients
        const clientsResponse = await supabase
          .from('clients')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (clientsResponse.error) {
          console.error('Error fetching recent clients:', clientsResponse.error);
          throw clientsResponse.error;
        }

        const clients = clientsResponse.data || [];

        // Get all unique client IDs to fetch their details
        const invoiceClientIds = invoices.map(invoice => invoice.client_id);
        const quoteClientIds = quotes.map(quote => quote.client_id);
        const uniqueClientIds = [...new Set([...invoiceClientIds, ...quoteClientIds])];

        // Get client details if there are any client IDs
        let clientLookup: Record<string, string> = {};
        
        if (uniqueClientIds.length > 0) {
          const clientDetailsResponse = await supabase
            .from('clients')
            .select('id, name')
            .in('id', uniqueClientIds);

          if (clientDetailsResponse.error) {
            console.error('Error fetching client details:', clientDetailsResponse.error);
            throw clientDetailsResponse.error;
          }
          
          const clientDetails = clientDetailsResponse.data || [];
          
          // Map client names to a lookup object
          clientDetails.forEach(client => {
            clientLookup[client.id] = client.name;
          });
        }

        // Convert invoices to activity items with explicit type assertion
        const invoiceItems: ActivityItem[] = invoices.map((invoice: InvoiceData) => ({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          title: `Invoice ${invoice.invoice_number} sent to ${clientLookup[invoice.client_id] || 'Client'}`,
          date: formatRelativeTime(invoice.created_at),
          status: invoice.status as ActivityItem['status'],
          amount: `$${parseFloat(invoice.amount.toString()).toFixed(2)}`
        }));

        // Convert quotes to activity items with explicit type assertion
        const quoteItems: ActivityItem[] = quotes.map((quote: QuoteData) => ({
          id: `quote-${quote.id}`,
          type: 'quote',
          title: `Quote ${quote.invoice_number} sent to ${clientLookup[quote.client_id] || 'Client'}`,
          date: formatRelativeTime(quote.created_at),
          status: quote.status as ActivityItem['status'],
          amount: `$${parseFloat(quote.amount.toString()).toFixed(2)}`
        }));

        // Convert clients to activity items with explicit type assertion
        const clientItems: ActivityItem[] = clients.map((client: ClientData) => ({
          id: `client-${client.id}`,
          type: 'client',
          title: `New client ${client.name} added`,
          date: formatRelativeTime(client.created_at),
          status: 'created'
        }));

        // Combine and sort by date
        const allActivities = [...invoiceItems, ...quoteItems, ...clientItems]
          .sort((a, b) => {
            // Sort items with "Just now" and minutes first, then hours, then days
            const aValue = a.date.includes('Just now') 
              ? 0 
              : a.date.includes('minute') 
                ? 1 
                : a.date.includes('hour') 
                  ? 2 
                  : 3;
            
            const bValue = b.date.includes('Just now') 
              ? 0 
              : b.date.includes('minute') 
                ? 1 
                : b.date.includes('hour') 
                  ? 2 
                  : 3;
                
            return aValue - bValue;
          })
          .slice(0, 5); // Limit to 5 items

        return allActivities;
      } catch (error) {
        console.error('Error fetching activity data:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Fallback data if no activities found
  const fallbackActivityData: ActivityItem[] = [
    {
      id: 'fallback-1',
      type: 'invoice',
      title: t('activity.create.first.invoice'),
      date: t('activity.just.now'),
      status: 'pending',
    },
    {
      id: 'fallback-2',
      type: 'client',
      title: t('activity.add.first.client'),
      date: t('activity.just.now'),
      status: 'created',
    }
  ];

  const displayData = activityData.length > 0 ? activityData : fallbackActivityData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {displayData.map((item, index) => (
        <div 
          key={item.id} 
          className="activity-item flex items-start gap-4" 
          style={{ 
            animationDelay: `${index * 100}ms`,
            opacity: 0,
            animation: 'fade-in 0.5s ease-out forwards',
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <ActivityIcon type={item.type} status={item.status} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium line-clamp-1">{item.title}</p>
              {item.amount && (
                <p className={cn(
                  "text-sm font-medium ml-2",
                  item.status === 'paid' && "text-green-600 dark:text-green-400",
                  item.status === 'pending' && "text-yellow-600 dark:text-yellow-400",
                  item.status === 'overdue' && "text-red-600 dark:text-red-400"
                )}>
                  {item.amount}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-muted-foreground">{item.date}</p>
              <StatusBadge status={item.status} />
            </div>
          </div>
        </div>
      ))}

      {displayData.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{t('activity.no.recent')}</p>
      )}
    </div>
  );
};

export default RecentActivity;
