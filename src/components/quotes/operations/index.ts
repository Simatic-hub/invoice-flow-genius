
import { Quote } from './types';
import { useDeleteQuote } from './useDeleteQuote';
import { useUpdateQuoteStatus } from './useUpdateQuoteStatus';
import { useDuplicateQuote } from './useDuplicateQuote';
import { usePdfGeneration } from './usePdfGeneration';

// Re-export the types
export * from './types';

// Main hook that combines all operations
export const useQuoteOperations = () => {
  const deleteQuoteMutation = useDeleteQuote();
  const updateQuoteStatusMutation = useUpdateQuoteStatus();
  const duplicateQuoteMutation = useDuplicateQuote();
  const { handleGeneratePdf } = usePdfGeneration();

  return {
    deleteQuoteMutation,
    updateQuoteStatusMutation,
    duplicateQuoteMutation,
    handleGeneratePdf
  };
};
