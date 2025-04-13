
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import QuoteTable from '@/components/quotes/QuoteTable';
import { Quote } from '@/components/quotes/useQuoteOperations';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuoteListContainerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredQuotes: Quote[];
  isLoading: boolean;
  onSendEmail: (quote: Quote) => void;
  onEditQuote: (quote: Quote) => void;
  onChangeStatus: (quoteId: string, status: string) => void;
  onDuplicateQuote: (quoteId: string) => void;
  onDeleteQuote: (quote: Quote) => void;
  onGeneratePdf: (quote: Quote) => void;
}

const QuoteListContainer: React.FC<QuoteListContainerProps> = ({
  searchQuery,
  setSearchQuery,
  filteredQuotes,
  isLoading,
  onSendEmail,
  onEditQuote,
  onChangeStatus,
  onDuplicateQuote,
  onDeleteQuote,
  onGeneratePdf
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>{t('quotes.all') || 'All Quotes'}</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder={t('quotes.search') || 'Search quotes'} 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <QuoteTable
          quotes={filteredQuotes}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSendEmail={onSendEmail}
          onEditQuote={onEditQuote}
          onChangeStatus={onChangeStatus}
          onDuplicateQuote={onDuplicateQuote}
          onDeleteQuote={onDeleteQuote}
          onGeneratePdf={onGeneratePdf}
        />
      </CardContent>
    </Card>
  );
};

export default QuoteListContainer;
