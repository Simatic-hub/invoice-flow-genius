
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoiceForm } from './form/useInvoiceForm';
import ClientSection from './form/ClientSection';
import DocumentDetailsSection from './form/DocumentDetailsSection';
import LineItemsSection from './form/LineItemsSection';
import NotesAttachmentsSection from './form/NotesAttachmentsSection';
import PaymentInfoSection from './form/PaymentInfoSection';

interface InvoiceFormProps {
  onClose: () => void;
  existingInvoice?: any;
  isQuote?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose, existingInvoice, isQuote = false }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  // Defer form initialization with React.lazy and Suspense
  const [isFormReady, setIsFormReady] = React.useState(false);
  
  React.useEffect(() => {
    // Use setTimeout to defer heavy initialization to the next tick
    // This prevents UI freezing as it allows browser to complete rendering first
    const timer = setTimeout(() => {
      setIsFormReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isFormReady) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">
          {t("loading") || "Loading..."}
        </div>
      </div>
    );
  }
  
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
  } = useInvoiceForm({ onClose, existingInvoice, isQuote });

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
