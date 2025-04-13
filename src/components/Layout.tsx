
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, Euro, MessageCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PricingSection from "./PricingSection";
import { useLanguage } from "@/contexts/LanguageContext";
import ErrorBoundary from "./ErrorBoundary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children?: React.ReactNode;
}

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
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
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [showPricing, setShowPricing] = useState(false);
  const { user, signOut } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [, forceUpdate] = useState({});

  console.log('Layout rendering with language:', language);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language change detected in Layout');
      forceUpdate({});
    };
    
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigate to login page after successful logout
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {user && (
        <Sidebar 
          isMobile={isMobile} 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${user && isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
        <header className="h-16 border-b flex items-center px-4 sticky top-0 bg-background z-30">
          {user && isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="mr-2 btn-hover"
            >
              <Menu size={20} />
            </Button>
          )}
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">{t('app.name')}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={handleLogout}
                >
                  {t('logout')}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    {t('free.version')}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                  >
                    <Link to="/login">{t('login')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <ErrorBoundary>
            {children || <Outlet />}
          </ErrorBoundary>
        </main>
      </div>
      
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <PricingSection onClose={() => setShowPricing(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;
