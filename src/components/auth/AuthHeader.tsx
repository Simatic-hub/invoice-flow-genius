
import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AuthHeaderProps {
  onPricingClick?: () => void;
  onContactClick?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ onPricingClick, onContactClick }) => {
  const { t } = useLanguage();
  
  return (
    <header className="h-16 border-b flex items-center px-4 sticky top-0 bg-background z-30">
      <div className="flex-1 px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{t('app.name')}</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            {t('free.version')}
          </Button>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
