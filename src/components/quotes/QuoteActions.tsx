
import React, { useState, Suspense } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import EmailModal from '@/components/invoices/EmailModal';
import ConfirmDialog from '@/components/clients/ConfirmDialog';
import { Quote } from '@/components/quotes/useQuoteOperations';
import { useLanguage } from '@/contexts/LanguageContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

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
  
  // State to control lazy loading of form
  const [formLoaded, setFormLoaded] = useState(false);
  
  // Only load form content when dialog is actually open
  React.useEffect(() => {
    if (showCreateQuoteDialog) {
      // Small delay to ensure dialog animation completes first
      console.log('Dialog opened, preparing to load form');
      const timer = setTimeout(() => {
        setFormLoaded(true);
        console.log('Form loaded state set to true');
      }, 200); // Increased delay to ensure UI is ready
      return () => clearTimeout(timer);
    } else {
      console.log('Dialog closed, setting form loaded to false');
      setFormLoaded(false);
    }
  }, [showCreateQuoteDialog]);

  const handleDialogOpenChange = (open: boolean) => {
    console.log('Dialog open change:', open);
    
    if (!open) {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      // Add a small delay before closing to prevent state updates during unmounting
      setTimeout(() => {
        setShowCreateQuoteDialog(false);
      }, 50);
    }
  };

  return (
    <>
      <Dialog 
        open={showCreateQuoteDialog} 
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="max-w-4xl">
          <DialogTitle>{selectedQuote ? (t('quotes.edit') || 'Edit Quote') : (t('quotes.add') || 'Add Quote')}</DialogTitle>
          <ErrorBoundary>
            {formLoaded && showCreateQuoteDialog ? (
              <Suspense fallback={
                <div className="flex items-center justify-center p-6 min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">{t("loading") || "Loading..."}</span>
                </div>
              }>
                <InvoiceForm 
                  onClose={() => {
                    console.log('Form close handler called');
                    setFormLoaded(false);
                    setTimeout(() => {
                      setShowCreateQuoteDialog(false);
                      queryClient.invalidateQueries({ queryKey: ['quotes'] });
                    }, 50);
                  }} 
                  existingInvoice={selectedQuote}
                  isQuote={true}
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
