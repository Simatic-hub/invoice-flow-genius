
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const UNITS = [
  { label: 'Pieces', value: 'pieces' },
  { label: 'Boxes', value: 'boxes' },
  { label: 'Hours', value: 'hours' },
  { label: 'Days', value: 'days' },
  { label: 'm²', value: 'm2' },
  { label: 'Liters', value: 'liters' },
  { label: 'kg', value: 'kg' },
];

const VAT_RATES = [
  { label: '0%', value: '0' },
  { label: '6%', value: '6' },
  { label: '9%', value: '9' },
  { label: '21%', value: '21' },
];

interface LineItemsSectionProps {
  form: any;
  lineItems: any[];
  addLineItem: () => void;
  removeLineItem: (index: number) => void;
  moveLineItemUp: (index: number) => void;
  moveLineItemDown: (index: number) => void;
}

const LineItemsSection: React.FC<LineItemsSectionProps> = ({ 
  form, 
  lineItems,
  addLineItem,
  removeLineItem,
  moveLineItemUp,
  moveLineItemDown
}) => {
  const { t } = useLanguage();

  // Force update form calculations
  const recalculateTotals = () => {
    // Trigger form change event by updating a field
    const currentItems = form.getValues('line_items');
    if (currentItems && Array.isArray(currentItems)) {
      form.setValue('line_items', [...currentItems], { shouldDirty: true });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{t("line_items") || "Line Items"}</h3>
        
        <div className="space-y-4">
          {Array.isArray(lineItems) && lineItems.map((item, index) => (
            <div key={item?.id || index} className="grid grid-cols-8 gap-3 items-end border-b pb-3">
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name={`line_items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description") || "Description"}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name={`line_items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("qty") || "Qty"}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field} 
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            recalculateTotals();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name={`line_items.${index}.unit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit") || "Unit"}</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          recalculateTotals();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("unit") || "Unit"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name={`line_items.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("price") || "Price"}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field} 
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            recalculateTotals();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name={`line_items.${index}.vatRate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("vat_percent") || "VAT %"}</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          recalculateTotals();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("vat") || "VAT"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VAT_RATES.map((rate) => (
                            <SelectItem key={rate.value} value={rate.value}>
                              {rate.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => moveLineItemUp(index)}
                  disabled={index === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => moveLineItemDown(index)}
                  disabled={index === (lineItems?.length || 0) - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeLineItem(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={addLineItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> {t("add_line_item") || "Add Line Item"}
          </Button>
          
          <div className="flex justify-end mt-4">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span>{t("subtotal") || "Subtotal"}:</span>
                <span>${form.watch('subtotal')?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("vat") || "VAT"}:</span>
                <span>${form.watch('vat_amount')?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>{t("total") || "Total"}:</span>
                <span>${form.watch('total')?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineItemsSection;
