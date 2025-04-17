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
    console.log('📡 Sidebar useEffect check:', {
      userId: user?.id,
      profile,
      firstName: profile?.first_name,
      condition: (!profile || !profile.first_name || profile.first_name === '')
    });

    if (user && (!profile || !profile.first_name || profile.first_name === '')) {
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
  }, [user, refreshProfile]);

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
    console.log('🧾 getUserDisplayName input:', {
      loading,
      profile,
      firstName: profile?.first_name,
      lastName: profile?.last_name
    });
    
    if (loading) return t('loading');
    
    if (profile?.first_name) {
      if (profile.last_name) {
        return `${profile.first_name} ${profile.last_name}`;
      }
      return profile.first_name;
    }
    
    return t('guest');
  };
  
  const getUserInitials = () => {
    console.log('🧾 getUserInitials input:', {
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      email: user?.email
    });

    if (profile?.first_name) {
      const firstInitial = profile.first_name.trim().charAt(0).toUpperCase();
      
      if (profile.last_name && profile.last_name.trim()) {
        const lastInitial = profile.last_name.trim().charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
      }
      
      return firstInitial;
    }
    
    if (user?.email) {
      const username = user.email.split('@')[0];
      const initials = username.substring(0, Math.min(2, username.length)).toUpperCase();
      return initials;
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
