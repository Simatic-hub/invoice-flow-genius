
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const RecentActivityWrapper = () => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{t('dashboard.recent.activity')}</CardTitle>
      </CardHeader>
      <RecentActivity />
    </Card>
  );
};

export default RecentActivityWrapper;
