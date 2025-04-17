
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
  
  console.log('Sidebar rendering with profile state:', {
    profile,
    loading,
    userId: user?.id,
    profileIsNull: profile === null,
    firstName: profile?.first_name,
    lastName: profile?.last_name
  });
  
  useEffect(() => {
    if (user && (!profile || !profile.first_name)) {
      console.log('Refreshing profile data for user:', user.id, {
        profile: profile,
        firstName: profile?.first_name,
        profileIsNull: profile === null,
        condition: (!profile || !profile.first_name)
      });
      refreshProfile();
    } else {
      console.log('NOT refreshing profile - condition not met', {
        hasUser: !!user,
        profile: profile,
        firstName: profile?.first_name,
        condition: (!profile || !profile.first_name)
      });
    }
  }, [user, profile, refreshProfile]);

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
  
  /**
   * Get user display name following these exact rules:
   * 1. If first AND last name exist -> "First Last"
   * 2. If only first name exists -> "First"
   * 3. If profile data is missing -> "guest"
   * 4. If everything fails -> "guest"
   */
  const getUserDisplayName = () => {
    // Log the inputs to getUserDisplayName
    console.log('getUserDisplayName called with:', {
      loading,
      profile,
      firstName: profile?.first_name,
      lastName: profile?.last_name
    });
    
    // If we're still loading, return loading
    if (loading) return t('loading');
    
    // Check for first name (Rule 1 and 2)
    if (profile?.first_name) {
      // If last name also exists, return full name (Rule 1)
      if (profile.last_name) {
        return `${profile.first_name} ${profile.last_name}`;
      }
      // If only first name exists, return just first name (Rule 2)
      return profile.first_name;
    }
    
    // Default fallback to guest (Rules 3 and 4)
    return t('guest');
  };
  
  /**
   * Get user initials following these exact rules:
   * 1. If first AND last name exist -> "FL" (first letter of first + last name)
   * 2. If only first name exists -> "F" (first letter of first name)
   * 3. If profile data is missing -> first two letters of email username
   * 4. If everything fails -> "?"
   */
  const getUserInitials = () => {
    // Check for first name (Rule 1 and 2)
    if (profile?.first_name) {
      // Get first letter of first name, ensuring it's properly trimmed
      const firstInitial = profile.first_name.trim().charAt(0).toUpperCase();
      
      // If last name also exists, return both initials (Rule 1)
      if (profile.last_name && profile.last_name.trim()) {
        const lastInitial = profile.last_name.trim().charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
      }
      
      // If only first name exists, return just first initial (Rule 2)
      return firstInitial;
    }
    
    // Rule 3: If profile data is missing but email exists, use first two letters of username
    if (user?.email) {
      const username = user.email.split('@')[0];
      // Get first 2 chars and uppercase them, handling case where username might be only 1 char
      const initials = username.substring(0, Math.min(2, username.length)).toUpperCase();
      return initials;
    }
    
    // Rule 4: Default fallback
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
