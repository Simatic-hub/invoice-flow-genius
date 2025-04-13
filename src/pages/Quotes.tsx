
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useQuotes } from '@/hooks/useQuotes';
import { useQuoteOperations, Quote } from '@/components/quotes/useQuoteOperations';
import QuotePageHeader from '@/components/quotes/QuotePageHeader';
import QuoteListContainer from '@/components/quotes/QuoteListContainer';
import QuoteActions from '@/components/quotes/QuoteActions';
import { useDiagnostics } from '@/components/invoices/useDiagnostics';
import ProjectDiagnostics from '@/components/diagnostics/ProjectDiagnostics';

const Quotes = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { hasConfigError } = useDiagnostics();
  
  // State management for modals and selected quote
  const [showCreateQuoteDialog, setShowCreateQuoteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom hooks for quote data and operations
  const { 
    filteredQuotes, 
    isLoading, 
    searchQuery, 
    setSearchQuery 
  } = useQuotes();

  const {
    deleteQuoteMutation,
    updateQuoteStatusMutation,
    duplicateQuoteMutation,
    handleGeneratePdf
  } = useQuoteOperations();

  // Handler functions
  const handleSendEmail = (emailData: any) => {
    console.log('Sending email:', emailData);

    toast({
      title: t('email_sent') || 'Email Sent',
      description: `${t('email_sent_description') || 'Email sent successfully to'} ${emailData.to}.`,
    });

    setShowEmailDialog(false);
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowCreateQuoteDialog(true);
  };

  const handleDuplicateQuote = async (quoteId: string) => {
    const duplicatedQuote = await duplicateQuoteMutation.mutate(quoteId) as unknown as Quote;
    if (duplicatedQuote) {
      setSelectedQuote(duplicatedQuote);
      setShowCreateQuoteDialog(true);
    }
  };

  const handleDeleteQuote = () => {
    if (!selectedQuote || !selectedQuote.id) {
      console.warn('Attempted to delete quote but no quote was selected');
      setShowDeleteDialog(false);
      
      toast({
        title: t('error') || 'Error',
        description: t('no_quote_selected') || 'No quote selected for deletion',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDeleting(true);
    console.log('Initiating delete for quote:', selectedQuote.id);
    deleteQuoteMutation.mutate(selectedQuote.id);
    setShowDeleteDialog(false);
    setIsDeleting(false);
    setSelectedQuote(null);
  };

  const handleChangeStatus = (quoteId: string, status: string) => {
    updateQuoteStatusMutation.mutate({
      quoteId,
      status
    });
  };

  // Reset state when user changes
  useEffect(() => {
    setSelectedQuote(null);
    setShowCreateQuoteDialog(false);
    setShowEmailDialog(false);
    setShowDeleteDialog(false);
    setIsDeleting(false);
  }, [user]);

  useEffect(() => {
    if (!isDeleting && showDeleteDialog && !selectedQuote) {
      setShowDeleteDialog(false);
    }
  }, [isDeleting, showDeleteDialog, selectedQuote]);

  // Show diagnostics if there are configuration errors
  if (hasConfigError) {
    return <ProjectDiagnostics />;
  }

  return (
    <div className="space-y-6">
      <QuotePageHeader 
        onCreateQuote={() => {
          setSelectedQuote(null);
          setShowCreateQuoteDialog(true);
        }} 
      />

      <QuoteListContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredQuotes={filteredQuotes}
        isLoading={isLoading}
        onSendEmail={(quote) => {
          setSelectedQuote(quote);
          setShowEmailDialog(true);
        }}
        onEditQuote={handleEditQuote}
        onChangeStatus={handleChangeStatus}
        onDuplicateQuote={handleDuplicateQuote}
        onDeleteQuote={(quote) => {
          console.log('Setting selected quote for deletion:', quote);
          setSelectedQuote(quote);
          setShowDeleteDialog(true);
        }}
        onGeneratePdf={handleGeneratePdf}
      />

      <QuoteActions
        selectedQuote={selectedQuote}
        setSelectedQuote={setSelectedQuote}
        showCreateQuoteDialog={showCreateQuoteDialog}
        setShowCreateQuoteDialog={setShowCreateQuoteDialog}
        showEmailDialog={showEmailDialog}
        setShowEmailDialog={setShowEmailDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        handleSendEmail={handleSendEmail}
        handleDeleteQuote={handleDeleteQuote}
        deleteQuoteMutation={deleteQuoteMutation}
      />
    </div>
  );
};

export default Quotes;
