
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const BillingSettings = () => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.billing')}</CardTitle>
        <CardDescription>
          {t('settings.billing.manage')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">{t('settings.billing.current.plan')}</h3>
          <div className="bg-muted p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{t('pricing.free')}</p>
                <p className="text-sm text-muted-foreground">{t('pricing.individuals.small')}</p>
              </div>
              <Button variant="outline">{t('pricing.subscribe.now')}</Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">{t('settings.billing.payment.methods')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('settings.billing.no.payment.methods')}
          </p>
          <Button variant="outline" className="mt-2">
            <CreditCard className="mr-2 h-4 w-4" />
            {t('settings.billing.add.payment')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingSettings;
