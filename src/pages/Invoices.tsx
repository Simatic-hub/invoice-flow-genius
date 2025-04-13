
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import EmailModal from '@/components/invoices/EmailModal';
import ConfirmDialog from '@/components/clients/ConfirmDialog';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import { useInvoices } from '@/hooks/useInvoices';
import { useInvoiceOperations, Invoice } from '@/components/invoices/useInvoiceOperations';
import { useToast } from '@/hooks/use-toast';

const Invoices = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { 
    filteredInvoices, 
    isLoading, 
    searchQuery, 
    setSearchQuery 
  } = useInvoices();

  const {
    deleteInvoiceMutation,
    updateInvoiceStatusMutation,
    duplicateInvoiceMutation,
    handleGeneratePdf
  } = useInvoiceOperations();

  const handleSendEmail = (emailData: any) => {
    console.log('Sending email:', emailData);

    toast({
      title: t('email_sent') || 'Email Sent',
      description: `${t('email_sent_description') || 'Email sent successfully to'} ${emailData.to}.`,
    });

    setShowEmailDialog(false);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowCreateInvoiceDialog(true);
  };

  const handleDuplicateInvoice = async (invoiceId: string) => {
    const duplicatedInvoice = await duplicateInvoiceMutation.mutate(invoiceId) as unknown as Invoice;
    if (duplicatedInvoice) {
      setSelectedInvoice(duplicatedInvoice);
      setShowCreateInvoiceDialog(true);
    }
  };

  const handleDeleteInvoice = () => {
    if (!selectedInvoice || !selectedInvoice.id) {
      console.warn('Attempted to delete invoice but no invoice was selected');
      setShowDeleteDialog(false);
      
      toast({
        title: t('error') || 'Error',
        description: t('no_invoice_selected') || 'No invoice selected for deletion',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDeleting(true);
    console.log('Initiating delete for invoice:', selectedInvoice.id);
    deleteInvoiceMutation.mutate(selectedInvoice.id);
    setShowDeleteDialog(false);
    setIsDeleting(false);
    setSelectedInvoice(null);
  };

  const handleChangeStatus = (invoiceId: string, status: string) => {
    updateInvoiceStatusMutation.mutate({
      invoiceId,
      status
    });
  };

  useEffect(() => {
    // Reset state when user changes
    setSelectedInvoice(null);
    setShowCreateInvoiceDialog(false);
    setShowEmailDialog(false);
    setShowDeleteDialog(false);
    setIsDeleting(false);
  }, [user]);

  // Prevent rerendering issues during deletion
  useEffect(() => {
    if (!isDeleting && showDeleteDialog && !selectedInvoice) {
      setShowDeleteDialog(false);
    }
  }, [isDeleting, showDeleteDialog, selectedInvoice]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('invoices') || 'Invoices'}</h1>
        <Button onClick={() => {
          setSelectedInvoice(null);
          setShowCreateInvoiceDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('create_invoice') || 'Create Invoice'}
        </Button>
      </div>

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
            onSendEmail={(invoice) => {
              setSelectedInvoice(invoice);
              setShowEmailDialog(true);
            }}
            onEditInvoice={handleEditInvoice}
            onChangeStatus={handleChangeStatus}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={(invoice) => {
              console.log('Setting selected invoice for deletion:', invoice);
              setSelectedInvoice(invoice);
              setShowDeleteDialog(true);
            }}
            onGeneratePdf={handleGeneratePdf}
          />
        </CardContent>
      </Card>

      <Dialog 
        open={showCreateInvoiceDialog} 
        onOpenChange={(open) => {
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
          }
          setShowCreateInvoiceDialog(open);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogTitle>{selectedInvoice ? (t('edit_invoice') || 'Edit Invoice') : (t('create_invoice') || 'Create Invoice')}</DialogTitle>
          <InvoiceForm 
            onClose={() => {
              setShowCreateInvoiceDialog(false);
              queryClient.invalidateQueries({ queryKey: ['invoices'] });
            }} 
            existingInvoice={selectedInvoice}
          />
        </DialogContent>
      </Dialog>

      <EmailModal 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        recipient={selectedInvoice?.client_name}
        documentType="invoice"
        documentNumber={selectedInvoice?.invoice_number || ''}
        onSend={handleSendEmail}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setShowDeleteDialog(false);
          }
        }}
        title={t('delete_invoice') || 'Delete Invoice'}
        description={
          selectedInvoice
            ? `${t('delete_invoice_confirmation') || 'Are you sure you want to delete invoice'} ${selectedInvoice.invoice_number}? 
               ${t('this_action_cannot_be_undone') || 'This action cannot be undone.'}`
            : t('no_invoice_selected') || 'No invoice selected'
        }
        onConfirm={handleDeleteInvoice}
        confirmButtonText={t('delete') || 'Delete'}
        cancelButtonText={t('cancel') || 'Cancel'}
        isLoading={isDeleting || deleteInvoiceMutation.isPending}
      />
    </div>
  );
};

export default Invoices;
