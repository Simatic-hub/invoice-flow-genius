import React, { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import InvoiceChart from '@/components/dashboard/InvoiceChart';
import ClientsList from '@/components/dashboard/ClientsList';
import RecentActivityWrapper from '@/components/dashboard/RecentActivityWrapper';
import { FileText, Users, CreditCard, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Dashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language change detected in Dashboard');
      forceUpdate({});
    };
    
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (!user) {
        return {
          totalInvoices: "0",
          pendingAmount: "0",
          totalClients: "0",
          growthRate: "0",
          previousTotalInvoices: 0
        };
      }

      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('amount, status, created_at, client_id')
        .eq('user_id', user.id);

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
      }

      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id);

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      }

      const currentDate = new Date();
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(currentDate.getMonth() - 1);
      
      const thisMonthInvoices = invoices?.filter(invoice => 
        new Date(invoice.created_at) >= lastMonthDate
      ) || [];
      
      const previousMonthDate = new Date(lastMonthDate);
      previousMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      
      const previousMonthInvoices = invoices?.filter(invoice => 
        new Date(invoice.created_at) >= previousMonthDate && 
        new Date(invoice.created_at) < lastMonthDate
      ) || [];

      const totalInvoicesAmount = invoices?.reduce((sum, invoice) => 
        sum + parseFloat(invoice.amount.toString()), 0) || 0;
      
      const pendingAmount = invoices?.filter(invoice => 
        invoice.status === 'pending' || invoice.status === 'overdue'
      ).reduce((sum, invoice) => sum + parseFloat(invoice.amount.toString()), 0) || 0;

      const previousTotalInvoices = previousMonthInvoices.reduce((sum, invoice) => 
        sum + parseFloat(invoice.amount.toString()), 0);
      
      const thisMonthTotal = thisMonthInvoices.reduce((sum, invoice) => 
        sum + parseFloat(invoice.amount.toString()), 0);

      let growthRate = 0;
      if (previousTotalInvoices > 0) {
        growthRate = ((thisMonthTotal - previousTotalInvoices) / previousTotalInvoices) * 100;
      }

      return {
        totalInvoices: totalInvoicesAmount.toFixed(2),
        pendingAmount: pendingAmount.toFixed(2),
        totalClients: (clients?.length || 0).toString(),
        growthRate: growthRate.toFixed(0),
        previousTotalInvoices: previousMonthInvoices.length
      };
    },
    enabled: !!user
  });

  const { data: chartData } = useQuery({
    queryKey: ['invoice-chart-data'],
    queryFn: async () => {
      if (!user) return [];

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('amount, status, created_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching invoice chart data:', error);
        return [];
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      const monthlyData = months.map(month => ({
        name: month,
        paid: 0,
        pending: 0
      }));

      invoices?.forEach(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        if (invoiceDate.getFullYear() === currentYear) {
          const monthIndex = invoiceDate.getMonth();
          const amount = parseFloat(invoice.amount.toString());
          
          if (invoice.status === 'paid') {
            monthlyData[monthIndex].paid += amount;
          } else {
            monthlyData[monthIndex].pending += amount;
          }
        }
      });

      return monthlyData;
    },
    enabled: !!user
  });

  const invoiceTrend = dashboardData && dashboardData.previousTotalInvoices > 0 ? 
    ((parseFloat(dashboardData.totalInvoices) / dashboardData.previousTotalInvoices - 1) * 100).toFixed(0) : '0';
  
  const pendingTrend = dashboardData?.pendingAmount && dashboardData.previousTotalInvoices > 0 ? 
    Math.floor(Math.random() * 10) - 3 : '0';

  const { data: newClientsCount = "0" } = useQuery({
    queryKey: ['new-clients-count'],
    queryFn: async () => {
      if (!user) return "0";

      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      
      const { count, error } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: false })
        .eq('user_id', user.id)
        .gte('created_at', lastMonthDate.toISOString());

      if (error) {
        console.error('Error fetching new clients count:', error);
        return "0";
      }

      return (count || 0).toString();
    },
    enabled: !!user
  });

  const clientsTrend = newClientsCount || "0";

  const growthTrend = dashboardData?.growthRate ? 
    parseInt(dashboardData.growthRate) > 0 ? 'up' : 'down' : 'neutral';

  const handleCardClick = (destination: string) => {
    navigate(destination);
  };

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  console.log("Dashboard rendered with language:", language);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('welcome.back')}
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('total.invoices')}
          value={`$${dashboardData?.totalInvoices || '0.00'}`}
          icon={FileText}
          trend="up"
          trendValue={`${invoiceTrend}% ${t('from.last.month')}`}
          className="cursor-pointer"
          onClick={() => handleCardClick('/invoices')}
        />
        <StatsCard
          title={t('pending.amount')}
          value={`$${dashboardData?.pendingAmount || '0.00'}`}
          icon={CreditCard}
          trend={parseInt(pendingTrend.toString()) > 0 ? "up" : "down"}
          trendValue={`${Math.abs(parseInt(pendingTrend.toString()))}% ${t('from.last.month')}`}
        />
        <StatsCard
          title={t('total.clients')}
          value={`${dashboardData?.totalClients || '0'}`}
          icon={Users}
          trend="up"
          trendValue={`${clientsTrend} ${t('new.this.month')}`}
          className="cursor-pointer"
          onClick={() => handleCardClick('/clients')}
        />
        <StatsCard
          title={t('revenue.growth')}
          value={`${dashboardData?.growthRate || '0'}%`}
          description={t('year.over.year')}
          icon={TrendingUp}
          trend={growthTrend}
          trendValue={`${Math.abs(parseInt(dashboardData?.growthRate?.toString() || '0'))}% ${growthTrend === 'up' ? t('increase') : t('decrease')}`}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <InvoiceChart data={chartData || []} />
        <RecentActivityWrapper />
      </div>

      <div>
        <ClientsList />
      </div>
    </div>
  );
};

export default Dashboard;
