
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Send, 
  MoreHorizontal, 
  Mail,
  Edit,
  XCircle,
  Copy,
  Trash
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/quotes/StatusBadge';
import { Quote } from '@/components/quotes/useQuoteOperations';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuoteTableProps {
  quotes: Quote[];
  isLoading: boolean;
  searchQuery: string;
  onSendEmail: (quote: Quote) => void;
  onEditQuote: (quote: Quote) => void;
  onChangeStatus: (quoteId: string, status: string) => void;
  onDuplicateQuote: (quoteId: string) => void;
  onDeleteQuote: (quote: Quote) => void;
  onGeneratePdf: (quote: Quote) => void;
}

const QuoteTable: React.FC<QuoteTableProps> = ({
  quotes,
  isLoading,
  searchQuery,
  onSendEmail,
  onEditQuote,
  onChangeStatus,
  onDuplicateQuote,
  onDeleteQuote,
  onGeneratePdf
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-muted-foreground">{t('loading') || 'Loading...'}</p>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {searchQuery ? 
            (t('quotes.no_match_search') || 'No quotes match your search') : 
            (t('quotes.none_found') || 'No quotes found.')}
        </p>
      </div>
    );
  }

  return (
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
        {quotes.map((quote) => (
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
                  onClick={() => onGeneratePdf(quote)}
                  title={t('download_pdf') || 'Download PDF'}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onSendEmail(quote)}
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
                    <DropdownMenuItem onClick={() => onSendEmail(quote)}>
                      <Mail className="mr-2 h-4 w-4" />
                      {t('email') || 'Email'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditQuote(quote)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('edit') || 'Edit'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangeStatus(quote.id, 'rejected')}>
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('quotes.cancel') || 'Cancel Quote'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicateQuote(quote.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('duplicate') || 'Duplicate'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteQuote(quote)}
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
  );
};

export default QuoteTable;
