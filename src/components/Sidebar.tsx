
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  FileText, 
  ClipboardCheck, 
  Settings, 
  Menu, 
  X,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRandomColor } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/language";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
}

const NavItem = ({ icon: Icon, label, to, active }: NavItemProps) => {
  return (
    <Link to={to} className="w-full">
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start gap-3 mb-1 font-normal", 
          active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/20"
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isMobile, isSidebarOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { profile, loading, refreshProfile } = useUserProfile();
  const { t } = useLanguage();
  
  useEffect(() => {
    if (user && (!profile || !profile.first_name)) {
      console.log('Refreshing profile data for user:', user.id);
      refreshProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: t('error'),
        description: t('auth.logout.failed'),
        variant: "destructive",
      });
    }
  };
  
  const getUserDisplayName = () => {
    if (loading) return t('loading');
    
    // ONLY use first_name + last_name if available
    if (profile?.first_name || profile?.last_name) {
      const firstName = profile.first_name || '';
      const lastName = profile.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Only return if we actually have a name
      if (fullName) {
        return fullName;
      }
    }
    
    // Fallback: Only use email username if no profile names are available
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return t('guest');
  };
  
  const getUserInitials = () => {
    // STRICT PRIORITY: First letter of first name + first letter of last name
    if (profile?.first_name || profile?.last_name) {
      // Get first letter of first name if available
      const firstInitial = profile.first_name ? profile.first_name.trim().charAt(0).toUpperCase() : '';
      
      // Get first letter of last name if available
      const lastInitial = profile.last_name ? profile.last_name.trim().charAt(0).toUpperCase() : '';
      
      // If we have at least one initial, return it/them
      if (firstInitial || lastInitial) {
        return `${firstInitial}${lastInitial}`;
      }
    }
    
    // Fallback: ONLY if no profile name data is available
    if (user?.email) {
      const username = user.email.split('@')[0];
      return username.substring(0, 2).toUpperCase();
    }
    
    return '?';
  };

  if (isMobile && !isSidebarOpen) return null;

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out",
        isMobile ? (isSidebarOpen ? "w-64" : "w-0") : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-sidebar-foreground">{t('app.name')}</span>
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground">
            <X size={20} />
          </Button>
        )}
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="flex flex-col gap-1">
          {[
            { icon: Home, label: t('dashboard'), to: "/dashboard" },
            { icon: Users, label: t('clients.title'), to: "/clients" },
            { icon: FileText, label: t('invoices.title'), to: "/invoices" },
            { icon: ClipboardCheck, label: t('quotes.title'), to: "/quotes" },
            { icon: Settings, label: t('settings.title'), to: "/settings" }
          ].map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={location.pathname === item.to}
            />
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 mb-1 font-normal text-sidebar-foreground hover:bg-sidebar-accent/20"
            onClick={handleSignOut}
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </Button>
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 bg-sidebar-accent text-sidebar-accent-foreground">
            <AvatarFallback className={cn(
              getRandomColor(getUserDisplayName()),
              "font-medium"
            )}>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {getUserDisplayName()}
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              {t('free.version')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
