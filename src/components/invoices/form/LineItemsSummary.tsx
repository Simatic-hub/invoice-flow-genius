
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LineItemsSummaryProps {
  form: any;
}

const LineItemsSummary: React.FC<LineItemsSummaryProps> = ({ form }) => {
  const { t } = useLanguage();

  return (
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
  );
};

export default LineItemsSummary;
