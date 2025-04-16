
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Globe } from "lucide-react";
import { useLanguage } from '@/contexts/language';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoginHeaderProps {
  onPricingClick: () => void;
  onContactClick: () => void;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ onPricingClick, onContactClick }) => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <header className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{t('app.name')}</span>
          <div className="hidden md:flex ml-6 space-x-4">
            <Button 
              variant="ghost" 
              onClick={onPricingClick}
            >
              {t('pricing')}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onContactClick}
            >
              {t('contact')}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-auto px-2 flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                <span className="uppercase">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('nl')}>
                Nederlands
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('fr')}>
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            {t('login')}
          </Button>
          <Button variant="outline">
            {t('free.version')}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default LoginHeader;
