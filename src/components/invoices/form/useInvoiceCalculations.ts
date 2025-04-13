
import { useEffect, useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { InvoiceFormValues, LineItem } from './invoiceFormSchemas';

export const useInvoiceCalculations = (form: UseFormReturn<InvoiceFormValues>) => {
  // Watch for line items changes to ensure calculations update
  const lineItems = form.watch('line_items') || [];
  
  // Debounce calculation to prevent excessive updates
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate totals with a more efficient algorithm
  const calculateTotals = useCallback(() => {
    if (!lineItems || !Array.isArray(lineItems)) return;
    
    // Use reduce for a single iteration through the line items
    const totals = lineItems.reduce((acc, item) => {
      if (!item) return acc;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const vatRate = parseInt(item.vatRate || '0');
      
      const lineTotal = quantity * unitPrice;
      acc.subtotal += lineTotal;
      acc.vatAmount += lineTotal * (vatRate / 100);
      
      return acc;
    }, { subtotal: 0, vatAmount: 0 });
    
    const total = totals.subtotal + totals.vatAmount;
    
    // Batch updates to minimize re-renders
    form.setValue('subtotal', totals.subtotal, { shouldValidate: false });
    form.setValue('vat_amount', totals.vatAmount, { shouldValidate: false });
    form.setValue('total', total, { shouldValidate: false });
    
    // Update individual line item totals
    lineItems.forEach((item, index) => {
      if (!item) return;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      form.setValue(`line_items.${index}.total`, quantity * unitPrice, { shouldValidate: false });
    });
    
    // Trigger validation with minimal form updates
    form.trigger(['subtotal', 'vat_amount', 'total']);
  }, [lineItems, form]);

  // Enhanced calculation effect with debounce to prevent frequent recalculations
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a small delay to batch multiple changes
    timeoutRef.current = setTimeout(() => {
      calculateTotals();
    }, 50);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lineItems, calculateTotals]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Force recalculation when Enter is pressed
      calculateTotals();
    }
  };

  return {
    handleKeyDown
  };
};
