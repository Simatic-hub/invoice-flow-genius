
import { Invoice } from './types';
import { useDeleteInvoice } from './useDeleteInvoice';
import { useUpdateInvoiceStatus } from './useUpdateInvoiceStatus';
import { useDuplicateInvoice } from './useDuplicateInvoice';
import { usePdfGeneration } from './usePdfGeneration';

// Re-export the types
export * from './types';

// Main hook that combines all operations
export const useInvoiceOperations = () => {
  const deleteInvoiceMutation = useDeleteInvoice();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();
  const duplicateInvoiceMutation = useDuplicateInvoice();
  const { handleGeneratePdf } = usePdfGeneration();

  return {
    deleteInvoiceMutation,
    updateInvoiceStatusMutation,
    duplicateInvoiceMutation,
    handleGeneratePdf
  };
};
