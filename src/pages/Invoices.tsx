
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from '@/hooks/useInvoices';
import { useInvoiceOperations, Invoice } from '@/components/invoices/useInvoiceOperations';
import ProjectDiagnostics from '@/components/diagnostics/ProjectDiagnostics';
import InvoicePageHeader from '@/components/invoices/InvoicePageHeader';
import InvoiceListContainer from '@/components/invoices/InvoiceListContainer';
import InvoiceActions from '@/components/invoices/InvoiceActions';
import { useDiagnostics } from '@/components/invoices/useDiagnostics';

const Invoices = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { hasConfigError } = useDiagnostics();
  
  // State management for modals and selected invoice
  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom hooks for invoice data and operations
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

  // Handler functions
  const handleSendEmail = (emailData: any) => {
    console.log('Sending email:', emailData);

    toast({
      title: t('email_sent') || 'Email Sent',
      description: `${t('email_sent_description') || 'Email sent successfully to'} ${emailData.to}.`,
    });

    setShowEmailDialog(false);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    console.log('Edit invoice:', invoice);
    setSelectedInvoice(invoice);
    setTimeout(() => {
      setShowCreateInvoiceDialog(true);
    }, 0);
  };

  const handleDuplicateInvoice = async (invoiceId: string) => {
    try {
      console.log('Duplicating invoice:', invoiceId);
      const duplicatedInvoice = await duplicateInvoiceMutation.mutateAsync(invoiceId) as unknown as Invoice;
      if (duplicatedInvoice) {
        setSelectedInvoice(duplicatedInvoice);
        setTimeout(() => {
          setShowCreateInvoiceDialog(true);
        }, 0);
      }
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failed_to_duplicate_invoice') || 'Failed to duplicate invoice',
        variant: 'destructive',
      });
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
    
    deleteInvoiceMutation.mutate(selectedInvoice.id, {
      onSuccess: () => {
        console.log('Invoice deleted successfully');
        setShowDeleteDialog(false);
        setIsDeleting(false);
        setSelectedInvoice(null);
      },
      onError: (error) => {
        console.error('Error deleting invoice:', error);
        setIsDeleting(false);
        toast({
          title: t('error') || 'Error',
          description: t('failed_to_delete_invoice') || 'Failed to delete invoice',
          variant: 'destructive',
        });
      }
    });
  };

  const handleChangeStatus = (invoiceId: string, status: string) => {
    updateInvoiceStatusMutation.mutate({
      invoiceId,
      status
    });
  };

  // Reset state when user changes
  useEffect(() => {
    setSelectedInvoice(null);
    setShowCreateInvoiceDialog(false);
    setShowEmailDialog(false);
    setShowDeleteDialog(false);
    setIsDeleting(false);
  }, [user]);

  useEffect(() => {
    if (!isDeleting && showDeleteDialog && !selectedInvoice) {
      setShowDeleteDialog(false);
    }
  }, [isDeleting, showDeleteDialog, selectedInvoice]);

  // Show diagnostics if there are configuration errors
  if (hasConfigError) {
    return <ProjectDiagnostics />;
  }

  return (
    <div className="space-y-6">
      <InvoicePageHeader 
        onCreateInvoice={() => {
          setSelectedInvoice(null);
          setTimeout(() => {
            setShowCreateInvoiceDialog(true);
          }, 0);
        }} 
      />

      <InvoiceListContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredInvoices={filteredInvoices}
        isLoading={isLoading}
        onSendEmail={(invoice) => {
          setSelectedInvoice(invoice);
          setTimeout(() => {
            setShowEmailDialog(true);
          }, 0);
        }}
        onEditInvoice={handleEditInvoice}
        onChangeStatus={handleChangeStatus}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDeleteInvoice={(invoice) => {
          console.log('Setting selected invoice for deletion:', invoice);
          setSelectedInvoice(invoice);
          setTimeout(() => {
            setShowDeleteDialog(true);
          }, 0);
        }}
        onGeneratePdf={handleGeneratePdf}
      />

      <InvoiceActions
        selectedInvoice={selectedInvoice}
        setSelectedInvoice={setSelectedInvoice}
        showCreateInvoiceDialog={showCreateInvoiceDialog}
        setShowCreateInvoiceDialog={setShowCreateInvoiceDialog}
        showEmailDialog={showEmailDialog}
        setShowEmailDialog={setShowEmailDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        handleSendEmail={handleSendEmail}
        handleDeleteInvoice={handleDeleteInvoice}
        deleteInvoiceMutation={deleteInvoiceMutation}
      />
    </div>
  );
};

export default Invoices;
