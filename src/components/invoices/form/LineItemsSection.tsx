
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/language';
import LineItemRow from './LineItemRow';
import LineItemsSummary from './LineItemsSummary';

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
            <LineItemRow
              key={item?.id || index}
              index={index}
              form={form}
              isFirst={index === 0}
              isLast={index === (lineItems?.length || 0) - 1}
              recalculateTotals={recalculateTotals}
              removeLineItem={removeLineItem}
              moveLineItemUp={moveLineItemUp}
              moveLineItemDown={moveLineItemDown}
            />
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={addLineItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> {t("add_line_item") || "Add Line Item"}
          </Button>
          
          <LineItemsSummary form={form} />
        </div>
      </CardContent>
    </Card>
  );
};

export default LineItemsSection;
