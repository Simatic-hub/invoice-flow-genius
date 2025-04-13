
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuotePageHeaderProps {
  onCreateQuote: () => void;
}

const QuotePageHeader: React.FC<QuotePageHeaderProps> = ({ onCreateQuote }) => {
  const { t } = useLanguage();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">{t('quotes.title') || 'Quotes'}</h1>
      <Button onClick={onCreateQuote}>
        <Plus className="mr-2 h-4 w-4" />
        {t('quotes.add') || 'Add Quote'}
      </Button>
    </div>
  );
};

export default QuotePageHeader;
