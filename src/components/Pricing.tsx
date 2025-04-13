
import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  highlighted?: boolean;
}

interface PricingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Pricing({ open, onOpenChange }: PricingProps) {
  const { t, language } = useLanguage();
  const [, forceUpdate] = useState({});
  
  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language change detected in Pricing component');
      forceUpdate({});
    };
    
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  // Generate plans dynamically based on current language
  const getPlans = () => {
    return [
      {
        title: t('pricing.free'),
        price: '€0',
        description: t('pricing.individuals.small'),
        features: [
          { name: `5 ${t('invoices.title')} ${t('pricing.per.month')}`, included: true },
          { name: `5 ${t('clients.title')}`, included: true },
          { name: t('pricing.pdf.export'), included: true },
          { name: t('pricing.email.invoices'), included: true },
          { name: t('pricing.basic.analytics'), included: true },
          { name: t('pricing.email.support'), included: false },
          { name: t('pricing.custom.branding'), included: false },
          { name: t('pricing.unlimited.invoices'), included: false },
        ],
        buttonText: t('pricing.get.started'),
      },
      {
        title: t('pricing.pro'),
        price: '€19',
        description: t('pricing.growing.businesses'),
        features: [
          { name: t('pricing.unlimited.invoices'), included: true },
          { name: t('pricing.unlimited.clients'), included: true },
          { name: t('pricing.pdf.export'), included: true },
          { name: t('pricing.email.invoices'), included: true },
          { name: t('pricing.advanced.analytics'), included: true },
          { name: t('pricing.email.support'), included: true },
          { name: t('pricing.custom.branding'), included: true },
          { name: t('pricing.multiple.users'), included: false },
        ],
        buttonText: t('pricing.subscribe.now'),
        highlighted: true,
      },
      {
        title: t('pricing.business'),
        price: '€39',
        description: t('pricing.companies.teams'),
        features: [
          { name: t('pricing.unlimited.invoices'), included: true },
          { name: t('pricing.unlimited.clients'), included: true },
          { name: t('pricing.pdf.export'), included: true },
          { name: t('pricing.email.invoices'), included: true },
          { name: t('pricing.advanced.analytics'), included: true },
          { name: t('pricing.priority.support'), included: true },
          { name: t('pricing.custom.branding'), included: true },
          { name: t('pricing.multiple.users'), included: true },
        ],
        buttonText: t('pricing.contact.sales'),
      },
    ];
  };

  const plans = getPlans();
  
  useEffect(() => {
    console.log('Pricing component rendered with language:', language);
    // Force update on language change
    forceUpdate({});
  }, [language]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{t('pricing.simple.transparent')}</DialogTitle>
          <DialogDescription className="text-center text-lg">
            {t('pricing.choose.plan')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-3 py-6">
          {plans.map((plan) => (
            <Card 
              key={plan.title} 
              className={`flex flex-col ${plan.highlighted ? 'border-primary shadow-lg' : ''}`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.title}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> /{t('pricing.month')}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mr-2" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
