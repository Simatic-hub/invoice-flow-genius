
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface InvoicePageHeaderProps {
  onCreateInvoice: () => void;
}

const InvoicePageHeader: React.FC<InvoicePageHeaderProps> = ({ onCreateInvoice }) => {
  const { t } = useLanguage();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">{t('invoices') || 'Invoices'}</h1>
      <Button onClick={onCreateInvoice}>
        <Plus className="mr-2 h-4 w-4" />
        {t('create_invoice') || 'Create Invoice'}
      </Button>
    </div>
  );
};

export default InvoicePageHeader;
