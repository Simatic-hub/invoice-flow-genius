
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentInfoSectionProps {
  form: any;
}

const PaymentInfoSection: React.FC<PaymentInfoSectionProps> = ({ form }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{t("payment_information") || "Payment Information"}</h3>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="payment_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("payment_details") || "Payment Details"}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    value={field.value || ''}
                    placeholder={t("payment_details_placeholder") || "Bank account, payment methods, etc."}
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="payment_terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("payment_terms") || "Payment Terms"}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ''}
                    placeholder={t("payment_terms_placeholder") || "e.g. Net 30, Due on Receipt"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center space-x-2">
            <Checkbox id="structured_message" />
            <label
              htmlFor="structured_message"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("show_structured_message") || "Show structured payment message"}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfoSection;
