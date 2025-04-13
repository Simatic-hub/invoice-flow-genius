
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChartData {
  name: string;
  paid: number;
  pending: number;
}

interface InvoiceChartProps {
  data?: ChartData[];
}

// Default data if none is provided
const defaultData: ChartData[] = [
  { name: 'Jan', paid: 0, pending: 0 },
  { name: 'Feb', paid: 0, pending: 0 },
  { name: 'Mar', paid: 0, pending: 0 },
  { name: 'Apr', paid: 0, pending: 0 },
  { name: 'May', paid: 0, pending: 0 },
  { name: 'Jun', paid: 0, pending: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useLanguage();
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border shadow-lg rounded-md">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-green-600 dark:text-green-400">
          {t('invoices.status.paid')}: ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          {t('invoices.status.pending')}: ${payload[1].value.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

const InvoiceChart = ({ data = defaultData }: InvoiceChartProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useLanguage();
  
  // Use provided data or default
  const chartData = data.length > 0 ? data : defaultData;

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{t('dashboard.invoice.overview')}</CardTitle>
        {isMobile && (
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(!isOpen)}
              className="btn-hover"
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </CollapsibleTrigger>
        )}
      </CardHeader>
      <Collapsible open={!isMobile || isOpen}>
        <CollapsibleContent>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs" 
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'var(--foreground)' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="paid" name={t('invoices.status.paid')} stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name={t('invoices.status.pending')} stackId="a" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default InvoiceChart;
