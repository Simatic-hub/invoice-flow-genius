
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import StatusBadge from './StatusBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Invoice } from './useInvoiceOperations';

interface InvoiceTableProps {
  invoices: Invoice[];
  onSendEmail: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onChangeStatus: (invoiceId: string, status: string) => void;
  onDuplicateInvoice: (invoiceId: string) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
  onGeneratePdf: (invoice: Invoice) => void;
  isLoading: boolean;
  searchQuery: string;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onSendEmail,
  onEditInvoice,
  onChangeStatus,
  onDuplicateInvoice,
  onDeleteInvoice,
  onGeneratePdf,
  isLoading,
  searchQuery
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-muted-foreground">{t('loading_invoices') || 'Loading invoices...'}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {searchQuery 
            ? (t('no_invoices_match_search') || 'No invoices match your search')
            : (t('no_invoices_found') || 'No invoices found. Create your first invoice!')}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('invoice_number') || 'Invoice Number'}</TableHead>
          <TableHead>{t('client') || 'Client'}</TableHead>
          <TableHead>{t('date') || 'Date'}</TableHead>
          <TableHead>{t('due_date') || 'Due Date'}</TableHead>
          <TableHead>{t('amount') || 'Amount'}</TableHead>
          <TableHead>{t('status') || 'Status'}</TableHead>
          <TableHead>{t('actions') || 'Actions'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
            <TableCell>{invoice.client_name}</TableCell>
            <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
            <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</TableCell>
            <TableCell>${parseFloat(invoice.amount.toString()).toFixed(2)}</TableCell>
            <TableCell>
              <StatusBadge status={invoice.status} />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onGeneratePdf(invoice)}
                  title={t('download_pdf') || 'Download PDF'}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onSendEmail(invoice)}
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
                    <DropdownMenuItem onClick={() => onSendEmail(invoice)}>
                      <Mail className="mr-2 h-4 w-4" />
                      {t('email') || 'Email'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditInvoice(invoice)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('edit') || 'Edit'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangeStatus(invoice.id, 'cancelled')}>
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('cancel_via_credit_note') || 'Cancel via Credit Note'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicateInvoice(invoice.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('duplicate') || 'Duplicate'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteInvoice(invoice)}
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

export default InvoiceTable;
