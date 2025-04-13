
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import EmailModal from '@/components/invoices/EmailModal';
import ConfirmDialog from '@/components/clients/ConfirmDialog';
import { Invoice } from '@/components/invoices/useInvoiceOperations';
import { useLanguage } from '@/contexts/LanguageContext';

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

  return (
    <>
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
    </>
  );
};

export default InvoiceActions;
