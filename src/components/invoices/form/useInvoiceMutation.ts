
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { InvoiceFormValues } from './invoiceFormSchemas';

interface UseInvoiceMutationProps {
  onClose: () => void;
  existingInvoice?: any;
  isQuote?: boolean;
  file: File | null;
}

export const useInvoiceMutation = ({ onClose, existingInvoice, isQuote = false, file }: UseInvoiceMutationProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(existingInvoice && existingInvoice.id);

  const upsertInvoice = useMutation({
    mutationFn: async (data: InvoiceFormValues) => {
      try {
        // Get the current user session 
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) throw new Error("User not authenticated");
        
        const tableName = isQuote ? 'quotes' : 'invoices';
        const invoiceData = {
          user_id: session.user.id,
          client_id: data.client_id,
          invoice_number: data.invoice_number,
          date: data.date.toISOString(),
          due_date: data.due_date ? data.due_date.toISOString() : null,
          delivery_date: data.delivery_date ? data.delivery_date.toISOString() : null,
          po_number: data.po_number || '',
          notes: data.notes || '',
          amount: data.total,
          status: isQuote ? 'pending' : (isEditMode ? existingInvoice.status : 'draft'),
          payment_info: data.payment_info || '',
          payment_terms: data.payment_terms || '',
          line_items: (data.line_items || []).map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unitPrice,
            vat_rate: item.vatRate,
            total: item.quantity * item.unitPrice
          }))
        };
        
        let response;
        
        // Check if the attachments bucket exists before attempting upload
        const { data: buckets } = await supabase.storage.listBuckets();
        const attachmentsBucketExists = buckets?.some(bucket => bucket.name === 'attachments');
        
        // Create attachments bucket if it doesn't exist
        if (file && !attachmentsBucketExists) {
          console.log('Creating attachments bucket');
          await supabase.storage.createBucket('attachments', {
            public: false
          });
        }
        
        if (isEditMode) {
          const { data: updatedDoc, error } = await supabase
            .from(tableName)
            .update(invoiceData)
            .eq('id', existingInvoice.id)
            .select()
            .single();
          
          if (error) throw error;
          response = updatedDoc;
          
          if (file) {
            try {
              // File upload path
              const fileName = `${session.user.id}/${tableName}_${existingInvoice.id}_${file.name}`;
              const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(fileName, file, { upsert: true });
                
              if (uploadError) throw uploadError;
              
              const { error: updateError } = await supabase
                .from(tableName)
                .update({ attachment_path: fileName })
                .eq('id', existingInvoice.id);
                
              if (updateError) throw updateError;
            } catch (uploadError) {
              console.error('File upload error:', uploadError);
              // Continue even if file upload fails
            }
          }
        } else {
          const { data: newDoc, error } = await supabase
            .from(tableName)
            .insert(invoiceData)
            .select()
            .single();
          
          if (error) throw error;
          response = newDoc;
          
          if (file) {
            try {
              // File upload path
              const fileName = `${session.user.id}/${tableName}_${newDoc.id}_${file.name}`;
              const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(fileName, file);
                
              if (uploadError) throw uploadError;
              
              const { error: updateError } = await supabase
                .from(tableName)
                .update({ attachment_path: fileName })
                .eq('id', newDoc.id);
                
              if (updateError) throw updateError;
            } catch (uploadError) {
              console.error('File upload error:', uploadError);
              // Continue even if file upload fails
            }
          }
        }
        
        return response;
      } catch (error) {
        console.error('Error in upsertInvoice:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditMode 
          ? isQuote ? t("quote_updated") || "Quote Updated" : t("invoice_updated") || "Invoice Updated"
          : isQuote ? t("quote_created") || "Quote Created" : t("invoice_created") || "Invoice Created",
        description: isEditMode
          ? isQuote ? t("quote_updated_description") || "Your quote has been updated successfully." : t("invoice_updated_description") || "Your invoice has been updated successfully."
          : isQuote ? t("quote_created_description") || "Your quote has been created successfully." : t("invoice_created_description") || "Your invoice has been created successfully.",
      });
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [isQuote ? 'quotes' : 'invoices'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['invoice-chart-data'] });
        queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
        
        onClose();
      }, 100);
    },
    onError: (error) => {
      console.error('Error saving document:', error);
      toast({
        title: t("error") || "Error",
        description: `${t("failed_to_save") || "Failed to save"} ${isQuote ? t("quote") || "quote" : t("invoice") || "invoice"}: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    upsertInvoice,
    isEditMode
  };
};
