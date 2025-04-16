
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/language';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginSignupTabs from '@/components/auth/LoginSignupTabs';
import ModalDialogs from '@/components/auth/ModalDialogs';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showPricing, setShowPricing] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <LoginHeader 
        onPricingClick={() => setShowPricing(true)} 
        onContactClick={() => setShowContact(true)} 
      />

      <main className="container mx-auto p-4 mt-10 flex flex-col items-center">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{t('app.name')}</CardTitle>
              <CardDescription className="text-center">
                {activeTab === 'login' ? t('auth.have.account') : t('auth.no.account')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginSignupTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isLoading={isLoading} 
              />
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.terms.agreement')}
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <ModalDialogs 
        showPricing={showPricing} 
        setShowPricing={setShowPricing} 
        showContact={showContact} 
        setShowContact={setShowContact} 
      />
    </div>
  );
};

export default Login;
