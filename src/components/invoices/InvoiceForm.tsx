
import React, { Suspense, useState, useEffect } from 'react';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoiceForm } from './form/useInvoiceForm';
import ClientSection from './form/ClientSection';
import DocumentDetailsSection from './form/DocumentDetailsSection';
import LineItemsSection from './form/LineItemsSection';
import NotesAttachmentsSection from './form/NotesAttachmentsSection';
import PaymentInfoSection from './form/PaymentInfoSection';
import ErrorBoundary from '@/components/ErrorBoundary';

interface InvoiceFormProps {
  onClose: () => void;
  existingInvoice?: any;
  isQuote?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose, existingInvoice, isQuote = false }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  // Initialize form inside ErrorBoundary to catch any issues
  return (
    <ErrorBoundary>
      <InvoiceFormContent onClose={onClose} existingInvoice={existingInvoice} isQuote={isQuote} />
    </ErrorBoundary>
  );
};

// Separate component to handle form content
const InvoiceFormContent: React.FC<InvoiceFormProps> = ({ onClose, existingInvoice, isQuote = false }) => {
  const { t } = useLanguage();
  const [isFormReady, setIsFormReady] = useState(false);
  
  // Defer form initialization with setTimeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isFormReady) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t("loading") || "Loading..."}</span>
      </div>
    );
  }
  
  // Suspense boundary for form hooks that might have async initialization
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-6 min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t("loading") || "Loading..."}</span>
      </div>
    }>
      <InvoiceFormWithHooks onClose={onClose} existingInvoice={existingInvoice} isQuote={isQuote} />
    </Suspense>
  );
};

// Component that loads and uses the form hooks
const InvoiceFormWithHooks: React.FC<InvoiceFormProps> = ({ onClose, existingInvoice, isQuote = false }) => {
  const { t } = useLanguage();
  
  const {
    form,
    lineItems,
    selectedClient,
    file,
    isSubmitting,
    onSubmit,
    handleClientChange,
    addLineItem,
    removeLineItem,
    moveLineItemUp,
    moveLineItemDown,
    handleFileChange,
    handleKeyDown,
    clients,
    upsertInvoice,
    isInitialized,
  } = useInvoiceForm({ onClose, existingInvoice, isQuote });
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t("initializing") || "Initializing..."}</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        onKeyDown={handleKeyDown}
        className="space-y-6 overflow-y-auto max-h-[80vh] p-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClientSection 
            clients={clients} 
            selectedClient={selectedClient} 
            form={form} 
            handleClientChange={handleClientChange} 
          />

          <DocumentDetailsSection form={form} isQuote={isQuote} />
        </div>

        <LineItemsSection 
          form={form} 
          lineItems={lineItems}
          addLineItem={addLineItem}
          removeLineItem={removeLineItem}
          moveLineItemUp={moveLineItemUp}
          moveLineItemDown={moveLineItemDown}
        />

        <NotesAttachmentsSection 
          form={form} 
          file={file} 
          handleFileChange={handleFileChange} 
        />

        <PaymentInfoSection form={form} />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose} type="button">
            {t("cancel") || "Cancel"}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || upsertInvoice.isPending}
          >
            {isSubmitting || upsertInvoice.isPending 
              ? (existingInvoice ? t("saving") || "Saving..." : t("creating") || "Creating...") 
              : (existingInvoice 
                  ? isQuote ? t("save_quote") || "Save Quote" : t("save_invoice") || "Save Invoice" 
                  : isQuote ? t("create_quote") || "Create Quote" : t("create_invoice") || "Create Invoice")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;
