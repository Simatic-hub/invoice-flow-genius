
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import { Invoice } from '@/components/invoices/useInvoiceOperations';
import { useLanguage } from '@/contexts/LanguageContext';

interface InvoiceListContainerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredInvoices: Invoice[];
  isLoading: boolean;
  onSendEmail: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onChangeStatus: (invoiceId: string, status: string) => void;
  onDuplicateInvoice: (invoiceId: string) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
  onGeneratePdf: (invoice: Invoice) => void;
}

const InvoiceListContainer: React.FC<InvoiceListContainerProps> = ({
  searchQuery,
  setSearchQuery,
  filteredInvoices,
  isLoading,
  onSendEmail,
  onEditInvoice,
  onChangeStatus,
  onDuplicateInvoice,
  onDeleteInvoice,
  onGeneratePdf
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>{t('all_invoices') || 'All Invoices'}</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder={t('search_invoices') || 'Search invoices'} 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <InvoiceTable
          invoices={filteredInvoices}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSendEmail={onSendEmail}
          onEditInvoice={onEditInvoice}
          onChangeStatus={onChangeStatus}
          onDuplicateInvoice={onDuplicateInvoice}
          onDeleteInvoice={onDeleteInvoice}
          onGeneratePdf={onGeneratePdf}
        />
      </CardContent>
    </Card>
  );
};

export default InvoiceListContainer;
