
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import EmailModal from '@/components/invoices/EmailModal';
import ConfirmDialog from '@/components/clients/ConfirmDialog';
import { Quote } from '@/components/quotes/useQuoteOperations';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuoteActionsProps {
  selectedQuote: Quote | null;
  setSelectedQuote: (quote: Quote | null) => void;
  showCreateQuoteDialog: boolean;
  setShowCreateQuoteDialog: (show: boolean) => void;
  showEmailDialog: boolean;
  setShowEmailDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
  handleSendEmail: (emailData: any) => void;
  handleDeleteQuote: () => void;
  deleteQuoteMutation: any;
}

const QuoteActions: React.FC<QuoteActionsProps> = ({
  selectedQuote,
  setSelectedQuote,
  showCreateQuoteDialog,
  setShowCreateQuoteDialog,
  showEmailDialog,
  setShowEmailDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  isDeleting,
  setIsDeleting,
  handleSendEmail,
  handleDeleteQuote,
  deleteQuoteMutation
}) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return (
    <>
      <Dialog 
        open={showCreateQuoteDialog} 
        onOpenChange={(open) => {
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
          }
          setShowCreateQuoteDialog(open);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogTitle>{selectedQuote ? (t('quotes.edit') || 'Edit Quote') : (t('quotes.add') || 'Add Quote')}</DialogTitle>
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
    </>
  );
};

export default QuoteActions;
