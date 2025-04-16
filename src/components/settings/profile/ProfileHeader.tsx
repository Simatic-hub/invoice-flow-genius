
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const ProfileHeader = () => {
  const { t } = useLanguage();

  return (
    <CardHeader>
      <CardTitle>{t('settings.profile.information')}</CardTitle>
      <CardDescription>
        {t('settings.profile.update')}
      </CardDescription>
    </CardHeader>
  );
};

export default ProfileHeader;
