
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "@/components/auth/AuthHeader";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [, forceUpdate] = useState({});
  
  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language change detected in RegisterPage');
      forceUpdate({});
    };
    
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  console.log('RegisterPage rendering with language:', language);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <RegisterForm onSuccess={() => navigate("/dashboard")} />
      </div>
    </div>
  );
};

export default RegisterPage;
