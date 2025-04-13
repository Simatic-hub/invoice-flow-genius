
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingSectionProps {
  onClose?: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const [isYearly, setIsYearly] = useState(true);
  const [, forceUpdate] = useState({});

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language change detected in PricingSection');
      forceUpdate({});
    };
    
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  // Ensure pricing section always gets the latest translations
  useEffect(() => {
    console.log("PricingSection rendered with language:", language);
    // Force a re-render when the language prop changes
    forceUpdate({});
  }, [language]);

  // Pricing tiers data - recreate on each render to use updated translations
  const pricingTiers = [
    {
      name: t('pricing.starter'),
      price: 0,
      description: t('pricing.promo.starter'),
      features: [
        `10 ${t('pricing.invoices.per.quarter')}`,
        `10 ${t('pricing.quotes.per.quarter')}`,
        `${t('pricing.free.access')}`,
        `1 ${t('pricing.user')}`,
      ],
      ctaText: t('pricing.free.trial'),
      highlight: false,
    },
    {
      name: t('pricing.standard'),
      price: isYearly ? 10 : 12,
      description: t('pricing.most.popular'),
      features: [
        `${t('pricing.tax.deductible')}`,
        `300 ${t('pricing.invoices.per.quarter')}`,
        `3000 ${t('pricing.quotes.per.quarter')}`,
        `${t('pricing.free.access')}`,
        `${t('pricing.unlimited.users')}`,
      ],
      ctaText: t('pricing.free.trial'),
      highlight: true,
    },
    {
      name: t('pricing.pro'),
      price: isYearly ? 18 : 22, 
      description: t('pricing.good.for.active'),
      features: [
        `${t('pricing.tax.deductible')}`,
        `900 ${t('pricing.invoices.per.quarter')}`,
        `9000 ${t('pricing.quotes.per.quarter')}`,
        `${t('pricing.free.access')}`,
        `${t('pricing.unlimited.users')}`,
      ],
      ctaText: t('pricing.free.trial'),
      highlight: false,
    }
  ];

  console.log("PricingSection rendered pricing tiers:", pricingTiers);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 w-full bg-background">
      {onClose && (
        <div className="flex justify-end mb-6">
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
      )}
      
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">{t('pricing')}</h2>
        
        <div className="flex items-center justify-center mt-8 space-x-4">
          <span className={`font-medium ${isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
            {t('pricing.yearly')}
          </span>
          <Switch 
            checked={!isYearly} 
            onCheckedChange={(checked) => setIsYearly(!checked)}
          />
          <span className={`font-medium ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
            {t('pricing.monthly')}
          </span>
        </div>
        
        <p className="text-muted-foreground mt-2">{t('pricing.save.up.to')}</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3 container max-w-screen-lg">
        {pricingTiers.map((tier, i) => (
          <Card 
            key={i} 
            className={`overflow-hidden ${tier.highlight ? 'bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 text-white' : ''}`}
          >
            <CardHeader className="text-center pb-8">
              <CardTitle>{tier.name}</CardTitle>
              <div className="mt-4 flex justify-center items-end">
                <span className="text-5xl font-bold">€{tier.price}</span>
                <span className="ml-1 text-lg">{t('pricing.per.month')}</span>
              </div>
              <p className="mt-2">{tier.description}</p>
            </CardHeader>
            <CardContent>
              <div className={`mb-8 ${tier.highlight ? 'border-t border-blue-300 dark:border-blue-700 pt-6' : 'border-t border-gray-200 dark:border-gray-700 pt-6'}`}>
                <Button 
                  className={`w-full ${tier.highlight ? 'bg-white text-blue-600 hover:bg-gray-100' : ''}`}
                  variant={tier.highlight ? 'outline' : 'default'}
                >
                  {tier.ctaText}
                </Button>
              </div>
              <ul className={`space-y-4 ${tier.highlight ? 'text-white' : ''}`}>
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>{t('pricing.all.prices')}</p>
        <p className="mt-2">{t('pricing.custom.price')}</p>
      </div>
    </div>
  );
};

export default PricingSection;
