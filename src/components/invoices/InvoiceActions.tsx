
import React, { useState, Suspense, lazy } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EmailModal from '@/components/invoices/EmailModal';
import ConfirmDialog from '@/components/clients/ConfirmDialog';
import { Invoice } from '@/components/invoices/useInvoiceOperations';
import { useLanguage } from '@/contexts/LanguageContext';

// Lazy load the InvoiceForm component
const InvoiceForm = lazy(() => import('@/components/invoices/InvoiceForm'));

interface InvoiceActionsProps {
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  showCreateInvoiceDialog: boolean;
  setShowCreateInvoiceDialog: (show: boolean) => void;
  showEmailDialog: boolean;
  setShowEmailDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
  handleSendEmail: (emailData: any) => void;
  handleDeleteInvoice: () => void;
  deleteInvoiceMutation: any;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  selectedInvoice,
  setSelectedInvoice,
  showCreateInvoiceDialog,
  setShowCreateInvoiceDialog,
  showEmailDialog,
  setShowEmailDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  isDeleting,
  setIsDeleting,
  handleSendEmail,
  handleDeleteInvoice,
  deleteInvoiceMutation
}) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  // State to control when to render the form content
  const [shouldRenderForm, setShouldRenderForm] = useState(false);
  
  // Only load form content when dialog is actually open
  React.useEffect(() => {
    if (showCreateInvoiceDialog) {
      // Small delay to ensure dialog animation completes first
      const timer = setTimeout(() => {
        setShouldRenderForm(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderForm(false);
    }
  }, [showCreateInvoiceDialog]);

  // Handle dialog close safely
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Small delay to allow animation to complete before changing state
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        setShowCreateInvoiceDialog(false);
      }, 50);
    } else {
      setShowCreateInvoiceDialog(open);
    }
  };

  return (
    <>
      <Dialog 
        open={showCreateInvoiceDialog} 
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="max-w-4xl">
          <DialogTitle>
            {selectedInvoice ? (t('edit_invoice') || 'Edit Invoice') : (t('create_invoice') || 'Create Invoice')}
          </DialogTitle>
          
          <ErrorBoundary 
            fallback={
              <div className="p-6 m-4 border border-red-500 bg-red-50 rounded-md">
                <p className="text-red-600">An error occurred while loading the form. Please try again.</p>
              </div>
            }
          >
            {shouldRenderForm ? (
              <Suspense fallback={
                <div className="flex items-center justify-center p-6 min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">{t("loading") || "Loading..."}</span>
                </div>
              }>
                <InvoiceForm 
                  onClose={() => {
                    setShowCreateInvoiceDialog(false);
                    queryClient.invalidateQueries({ queryKey: ['invoices'] });
                  }} 
                  existingInvoice={selectedInvoice}
                />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center p-6 min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">{t("loading") || "Loading..."}</span>
              </div>
            )}
          </ErrorBoundary>
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
    </>
  );
};

export default InvoiceActions;
