
/**
 * Helper function to calculate subtotal
 */
export const calculateSubtotal = (lineItems: any[]): number => {
  if (!lineItems || !lineItems.length) return 0;
  
  return lineItems.reduce((total, item) => {
    const price = parseFloat(item.unit_price || item.unitPrice || 0);
    const quantity = parseFloat(item.quantity || 0);
    return total + (price * quantity);
  }, 0);
};

/**
 * Helper function to calculate VAT
 */
export const calculateVat = (lineItems: any[]): number => {
  if (!lineItems || !lineItems.length) return 0;
  
  return lineItems.reduce((total, item) => {
    const price = parseFloat(item.unit_price || item.unitPrice || 0);
    const quantity = parseFloat(item.quantity || 0);
    const vatRate = parseFloat(item.vat_rate || item.vatRate || 0) / 100;
    return total + (price * quantity * vatRate);
  }, 0);
};
