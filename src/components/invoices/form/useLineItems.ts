
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { UseFormReturn } from 'react-hook-form';
import { InvoiceFormValues } from './invoiceFormSchemas';

export const useLineItems = (form: UseFormReturn<InvoiceFormValues>) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const addLineItem = () => {
    const currentItems = form.getValues('line_items') || [];
    form.setValue('line_items', [
      ...currentItems,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unit: 'pieces',
        unitPrice: 0,
        vatRate: '21',
        total: 0
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues('line_items') || [];
    if (currentItems.length > 1) {
      form.setValue(
        'line_items',
        currentItems.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: t("cannot_remove") || "Cannot remove",
        description: t("need_one_line_item") || "You need at least one line item",
        variant: "destructive"
      });
    }
  };

  const moveLineItemUp = (index: number) => {
    if (index === 0) return;
    const items = [...(form.getValues('line_items') || [])];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    form.setValue('line_items', items);
  };

  const moveLineItemDown = (index: number) => {
    const items = form.getValues('line_items') || [];
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    form.setValue('line_items', newItems);
  };

  return {
    addLineItem,
    removeLineItem,
    moveLineItemUp,
    moveLineItemDown
  };
};
