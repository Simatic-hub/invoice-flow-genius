
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { InvoiceFormValues, LineItem } from './invoiceFormSchemas';

export const useInvoiceCalculations = (form: UseFormReturn<InvoiceFormValues>) => {
  // Watch for all form changes to ensure calculations update
  const lineItems = form.watch('line_items') || [];
  form.watch();

  // Enhanced calculation effect to ensure proper updates
  useEffect(() => {
    if (!lineItems || !Array.isArray(lineItems)) return;
    
    let subtotal = 0;
    let vatAmount = 0;
    
    lineItems.forEach(item => {
      if (!item) return;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const vatRate = parseInt(item.vatRate || '0');
      
      const lineTotal = quantity * unitPrice;
      subtotal += lineTotal;
      vatAmount += lineTotal * (vatRate / 100);
    });
    
    const total = subtotal + vatAmount;
    
    // Update the form with the new calculated values
    form.setValue('subtotal', subtotal, { shouldValidate: false });
    form.setValue('vat_amount', vatAmount, { shouldValidate: false });
    form.setValue('total', total, { shouldValidate: false });
    
    // Update individual line item totals
    lineItems.forEach((item, index) => {
      if (!item) return;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      form.setValue(`line_items.${index}.total`, quantity * unitPrice, { shouldValidate: false });
    });
    
    // Force re-render by triggering form state update
    form.trigger();
  }, [lineItems, form]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Force recalculation when Enter is pressed
      const currentItems = form.getValues('line_items') || [];
      form.setValue('line_items', [...currentItems], { shouldDirty: true });
    }
  };

  return {
    handleKeyDown
  };
};
