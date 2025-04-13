import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Download, 
  Send, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  X,
  Mail,
  Edit,
  XCircle,
  Copy,
  Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import EmailModal from '@/components/invoices/EmailModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import ConfirmDialog from '@/components/clients/ConfirmDialog';

interface Quote {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  date: string;
  due_date: string | null;
  amount: string | number;
  status: 'accepted' | 'pending' | 'rejected' | string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  delivery_date?: string | null;
  po_number?: string | null;
  notes?: string | null;
  payment_info?: string | null;
  payment_terms?: string | null;
  attachment_path?: string | null;
}

interface QuoteData {
  id: string;
  invoice_number: string;
  client_id: string;
  date: string;
  due_date: string | null;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  delivery_date?: string | null;
  po_number?: string | null;
  notes?: string | null;
  payment_info?: string | null;
  payment_terms?: string | null;
  attachment_path?: string | null;
}

const StatusBadge = ({ status }: { status: Quote['status'] }) => {
  return (
    <div className={cn(
      "flex items-center",
      status === 'accepted' && "text-green-600",
      status === 'pending' && "text-yellow-600",
      status === 'rejected' && "text-red-600"
    )}>
      {status === 'accepted' && <CheckCircle2 className="mr-2 h-4 w-4" />}
      {status === 'pending' && <Clock className="mr-2 h-4 w-4" />}
      {status === 'rejected' && <X className="mr-2 h-4 w-4" />}
      <span className="capitalize">{status}</span>
    </div>
  );
};

const Quotes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateQuoteDialog, setShowCreateQuoteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (quotesError) throw quotesError;
        if (!quotesData || quotesData.length === 0) return [];

        const clientIds = quotesData
          .map((quote: QuoteData) => quote.client_id)
          .filter(id => id);
        
        let clientMap: Record<string, string> = {};
        
        if (clientIds.length > 0) {
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('id, name')
            .in('id', clientIds);

          if (clientsError) throw clientsError;

          if (clientsData) {
            clientsData?.forEach(client => {
              if (client && client.id) {
                clientMap[client.id] = client.name || 'Unknown Client';
              }
            });
          }
        }

        return quotesData.map((quote: QuoteData) => ({
          ...quote,
          date: quote.date || quote.created_at,
          client_name: clientMap[quote.client_id] || 'Unknown Client'
        })) as Quote[];
      } catch (error) {
        console.error('Error fetching quotes:', error);
        toast({
          title: t('error') || 'Error',
          description: t('failed_to_load_quotes') || 'Failed to load quotes',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!user
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      try {
        setIsDeleting(true);
        console.log('Deleting quote with ID:', quoteId);
        
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', quoteId);
        
        if (error) throw error;
        
        return { success: true, quoteId };
      } catch (error) {
        console.error('Error in deleteQuoteMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: t('quote_deleted') || 'Quote Deleted',
        description: t('quote_deleted_description') || 'The quote has been successfully deleted.',
      });
      
      setSelectedQuote(null);
      setShowDeleteDialog(false);
      setIsDeleting(false);
    },
    onError: (error) => {
      console.error('Error deleting quote:', error);
      
      toast({
        title: t('error') || 'Error',
        description: t('failed_to_delete_quote') || 'Failed to delete quote',
        variant: 'destructive',
      });
      
      setIsDeleting(false);
    },
  });

  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: 'Quote Updated',
        description: 'The quote status has been updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quote status',
        variant: 'destructive',
      });
    },
  });

  const duplicateQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { data: quote, error: fetchError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newQuote = {
        ...quote,
        id: undefined,
        invoice_number: `${quote.invoice_number}-COPY`,
        date: new Date().toISOString(),
        status: 'pending',
        created_at: undefined,
        updated_at: undefined,
        // Ensure line_items is valid
        line_items: quote.line_items || []
      };
      
      const { data: createdQuote, error: createError } = await supabase
        .from('quotes')
        .insert(newQuote)
        .select()
        .single();
      
      if (createError) throw createError;
      
      return createdQuote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: 'Quote Duplicated',
        description: 'A copy of the quote has been created.',
      });
      
      setSelectedQuote(data as unknown as Quote);
      setShowCreateQuoteDialog(true);
    },
    onError: (error) => {
      console.error('Error duplicating quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate quote',
        variant: 'destructive',
      });
    },
  });

  const handleSendEmail = (emailData: any) => {
    console.log('Sending email:', emailData);

    toast({
      title: t('email_sent'),
      description: `${t('email_sent_description')} ${emailData.to}.`,
    });

    setShowEmailDialog(false);
  };

  const handleGeneratePdf = (quote: Quote) => {
    toast({
      title: t('generating_pdf'),
      description: t('generating_pdf_description'),
    });
  };

  const handleDeleteQuote = () => {
    if (!selectedQuote || !selectedQuote.id) {
      console.warn('Attempted to delete quote but no quote was selected');
      setShowDeleteDialog(false);
      
      toast({
        title: t('error') || 'Error',
        description: t('no_quote_selected') || 'No quote selected for deletion',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Initiating delete for quote:', selectedQuote.id);
    deleteQuoteMutation.mutate(selectedQuote.id);
  };

  const filteredQuotes = React.useMemo(() => {
    if (!quotes || !Array.isArray(quotes)) return [];
    
    return quotes.filter(quote => 
      quote.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [quotes, searchQuery]);

  useEffect(() => {
    setSelectedQuote(null);
    setShowCreateQuoteDialog(false);
    setShowEmailDialog(false);
    setShowDeleteDialog(false);
    setIsDeleting(false);
  }, [user]);

  useEffect(() => {
    if (!isDeleting && showDeleteDialog && !selectedQuote) {
      setShowDeleteDialog(false);
    }
  }, [isDeleting, showDeleteDialog, selectedQuote]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('quotes.title') || 'Quotes'}</h1>
        <Button onClick={() => {
          setSelectedQuote(null);
          setShowCreateQuoteDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('quotes.add') || 'Add Quote'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>{t('quotes.all') || 'All Quotes'}</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={t('quotes.search') || 'Search quotes'} 
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
              <p className="text-muted-foreground">{t('loading') || 'Loading...'}</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? (t('quotes.no_match_search') || 'No quotes match your search') : (t('quotes.none_found') || 'No quotes found.')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quotes.number') || 'Quote Number'}</TableHead>
                  <TableHead>{t('client') || 'Client'}</TableHead>
                  <TableHead>{t('date') || 'Date'}</TableHead>
                  <TableHead>{t('quotes.expiry_date') || 'Expiry Date'}</TableHead>
                  <TableHead>{t('amount') || 'Amount'}</TableHead>
                  <TableHead>{t('status') || 'Status'}</TableHead>
                  <TableHead>{t('actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.invoice_number}</TableCell>
                    <TableCell>{quote.client_name}</TableCell>
                    <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                    <TableCell>{quote.due_date ? new Date(quote.due_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>${parseFloat(quote.amount.toString()).toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge status={quote.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleGeneratePdf(quote)}
                          title={t('download_pdf') || 'Download PDF'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowEmailDialog(true);
                          }}
                          title={t('send_email') || 'Send Email'}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedQuote(quote);
                              setShowEmailDialog(true);
                            }}>
                              <Mail className="mr-2 h-4 w-4" />
                              {t('email') || 'Email'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedQuote(quote);
                              setShowCreateQuoteDialog(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('edit') || 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              updateQuoteStatusMutation.mutate({
                                quoteId: quote.id,
                                status: 'rejected'
                              });
                            }}>
                              <XCircle className="mr-2 h-4 w-4" />
                              {t('quotes.cancel') || 'Cancel Quote'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              duplicateQuoteMutation.mutate(quote.id);
                            }}>
                              <Copy className="mr-2 h-4 w-4" />
                              {t('duplicate') || 'Duplicate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                console.log('Setting selected quote for deletion:', quote);
                                setSelectedQuote(quote);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              {t('delete') || 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateQuoteDialog} onOpenChange={(open) => {
        if (!open) {
          queryClient.invalidateQueries({ queryKey: ['quotes'] });
        }
        setShowCreateQuoteDialog(open);
      }}>
        <DialogContent className="max-w-4xl">
          <InvoiceForm 
            onClose={() => {
              setShowCreateQuoteDialog(false);
              queryClient.invalidateQueries({ queryKey: ['quotes'] });
            }} 
            existingInvoice={selectedQuote}
            isQuote={true}
          />
        </DialogContent>
      </Dialog>

      <EmailModal 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        recipient={selectedQuote?.client_name}
        documentType="quote"
        documentNumber={selectedQuote?.invoice_number || ''}
        onSend={handleSendEmail}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setShowDeleteDialog(false);
          }
        }}
        title={t('quotes.delete') || 'Delete Quote'}
        description={
          selectedQuote
            ? `${t('quotes.confirm_delete') || 'Are you sure you want to delete quote'} ${selectedQuote.invoice_number}? 
               ${t('this_action_cannot_be_undone') || 'This action cannot be undone.'}`
            : t('no_quote_selected') || 'No quote selected'
        }
        onConfirm={handleDeleteQuote}
        confirmButtonText={t('delete') || 'Delete'}
        cancelButtonText={t('cancel') || 'Cancel'}
        isLoading={isDeleting || deleteQuoteMutation.isPending}
      />
    </div>
  );
};

export default Quotes;
