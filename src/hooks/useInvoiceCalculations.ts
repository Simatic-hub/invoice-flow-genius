
import { useState, useEffect } from 'react';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  discount: number;
  amount: number;
}

export const useInvoiceCalculations = (initialItems: LineItem[] = []) => {
  const [items, setItems] = useState<LineItem[]>(Array.isArray(initialItems) ? initialItems : []);
  const [subtotal, setSubtotal] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(0);

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Calculate line item amount based on quantity, price, VAT, and discount
  const calculateLineAmount = (item: Partial<LineItem>): number => {
    if (!item) return 0;
    
    // Ensure all values are valid numbers or default to 0
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const vatRate = Number(item.vat_rate) || 0;
    const discount = Number(item.discount) || 0;
    
    // Base amount without VAT
    const baseAmount = quantity * unitPrice;
    
    // Apply discount
    const discountedAmount = baseAmount * (1 - discount / 100);
    
    // Calculate total with VAT
    const totalWithVat = discountedAmount * (1 + vatRate / 100);
    
    return Number(totalWithVat.toFixed(2));
  };

  // Update a line item and recalculate
  const updateLineItem = (index: number, updatedItem: Partial<LineItem>) => {
    // Safely handle cases where items might be null or undefined
    if (index < 0 || !Array.isArray(items)) {
      console.warn(`Attempted to update item at invalid index: ${index}`);
      return;
    }
    
    const newItems = [...items];
    
    // Create a new merged item with the updates
    const currentItem = newItems[index] || {
      description: '',
      quantity: 0,
      unit_price: 0,
      vat_rate: 0,
      discount: 0,
      amount: 0
    };
    
    const mergedItem = { ...currentItem, ...updatedItem };
    
    // Calculate the new amount
    mergedItem.amount = calculateLineAmount(mergedItem);
    
    // Update the item
    newItems[index] = mergedItem as LineItem;
    setItems(newItems);
    
    // Immediately recalculate totals
    calculateTotals(newItems);
  };

  // Add a new empty line item
  const addLineItem = () => {
    if (!Array.isArray(items)) {
      console.warn('Items is not an array, initializing as empty array');
      const newItems = [{
        description: '',
        quantity: 1,
        unit_price: 0,
        vat_rate: 0,
        discount: 0,
        amount: 0
      }];
      setItems(newItems);
      calculateTotals(newItems);
      return;
    }
    
    const newItems = [
      ...items,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        vat_rate: 0,
        discount: 0,
        amount: 0
      }
    ];
    setItems(newItems);
    
    // Immediately recalculate totals
    calculateTotals(newItems);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    // Validate input and handle cases where items might be null or undefined
    if (index < 0 || !Array.isArray(items) || index >= items.length) {
      console.warn(`Attempted to remove item at invalid index: ${index}`);
      return;
    }
    
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    
    // Immediately recalculate totals
    calculateTotals(newItems);
  };
  
  // Calculate totals based on provided items
  const calculateTotals = (itemsToCalculate: LineItem[] = []) => {
    // Ensure we have valid items to calculate - handle null, undefined, or non-array values
    if (!itemsToCalculate || !Array.isArray(itemsToCalculate)) {
      console.warn('Invalid items array provided to calculateTotals', itemsToCalculate);
      setSubtotal(0);
      setVatAmount(0);
      setDiscountAmount(0);
      setTotal(0);
      return;
    }
    
    let calculatedSubtotal = 0;
    let calculatedVatAmount = 0;
    let calculatedDiscountAmount = 0;
    
    itemsToCalculate.forEach(item => {
      if (!item) return;
      
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const vatRate = Number(item.vat_rate) || 0;
      const discount = Number(item.discount) || 0;
      
      // Base amount
      const baseAmount = quantity * unitPrice;
      calculatedSubtotal += baseAmount;
      
      // Discount amount
      const itemDiscountAmount = baseAmount * (discount / 100);
      calculatedDiscountAmount += itemDiscountAmount;
      
      // VAT amount (after discount)
      const discountedAmount = baseAmount - itemDiscountAmount;
      const itemVatAmount = discountedAmount * (vatRate / 100);
      calculatedVatAmount += itemVatAmount;
    });
    
    const calculatedTotal = calculatedSubtotal - calculatedDiscountAmount + calculatedVatAmount;
    
    setSubtotal(Number(calculatedSubtotal.toFixed(2)) || 0);
    setVatAmount(Number(calculatedVatAmount.toFixed(2)) || 0);
    setDiscountAmount(Number(calculatedDiscountAmount.toFixed(2)) || 0);
    setTotal(Number(calculatedTotal.toFixed(2)) || 0);
  };

  // Calculate totals whenever items change
  useEffect(() => {
    // Ensure we have valid items to calculate
    if (!items) {
      setItems([]);
      calculateTotals([]);
      return;
    }
    
    if (Array.isArray(items)) {
      calculateTotals(items);
    } else {
      // Reset totals if items is invalid
      console.warn('Items is not an array in useEffect', items);
      calculateTotals([]);
    }
  }, [items]);

  return {
    items,
    setItems,
    updateLineItem,
    addLineItem,
    removeLineItem,
    subtotal,
    vatAmount,
    discountAmount,
    total,
    formatCurrency,
    calculateTotals
  };
};
