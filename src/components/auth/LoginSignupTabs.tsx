
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/contexts/language';
import LoginTabContent from './LoginTabContent';
import SignupTabContent from './SignupTabContent';

interface LoginSignupTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
}

const LoginSignupTabs: React.FC<LoginSignupTabsProps> = ({ 
  activeTab, 
  setActiveTab,
  isLoading 
}) => {
  const { t } = useLanguage();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
        <TabsTrigger value="signup">{t('auth.register')}</TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="pt-4">
        <LoginTabContent isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="signup" className="pt-4">
        <SignupTabContent isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
};

export default LoginSignupTabs;
