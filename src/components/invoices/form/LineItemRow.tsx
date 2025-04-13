
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, MoveUp, MoveDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Constants for select options
export const UNITS = [
  { label: 'Pieces', value: 'pieces' },
  { label: 'Boxes', value: 'boxes' },
  { label: 'Hours', value: 'hours' },
  { label: 'Days', value: 'days' },
  { label: 'm²', value: 'm2' },
  { label: 'Liters', value: 'liters' },
  { label: 'kg', value: 'kg' },
];

export const VAT_RATES = [
  { label: '0%', value: '0' },
  { label: '6%', value: '6' },
  { label: '9%', value: '9' },
  { label: '21%', value: '21' },
];

interface LineItemRowProps {
  index: number;
  form: any;
  isFirst: boolean;
  isLast: boolean;
  recalculateTotals: () => void;
  removeLineItem: (index: number) => void;
  moveLineItemUp: (index: number) => void;
  moveLineItemDown: (index: number) => void;
}

const LineItemRow: React.FC<LineItemRowProps> = ({ 
  index, 
  form, 
  isFirst,
  isLast,
  recalculateTotals,
  removeLineItem,
  moveLineItemUp,
  moveLineItemDown
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-8 gap-3 items-end border-b pb-3">
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
          disabled={isFirst}
        >
          <MoveUp className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => moveLineItemDown(index)}
          disabled={isLast}
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
  );
};

export default LineItemRow;
