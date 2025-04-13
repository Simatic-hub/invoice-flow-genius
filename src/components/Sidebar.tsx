
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  FileText, 
  ClipboardCheck, 
  Settings, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { signOut } = useAuth();
  const { profile } = useUserProfile();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('dashboard'), to: "/dashboard" },
    { icon: Users, label: t('clients.title'), to: "/clients" },
    { icon: FileText, label: t('invoices.title'), to: "/invoices" },
    { icon: ClipboardCheck, label: t('quotes.title'), to: "/quotes" },
    { icon: Settings, label: t('settings.title'), to: "/settings" },
  ];

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
          {navItems.map((item) => (
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
            onClick={signOut}
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </Button>
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center text-sidebar-accent-foreground">
            <span className="text-sm font-medium">
              {profile
                ? `${(profile.first_name?.[0] || "")}${(profile.last_name?.[0] || "")}`.toUpperCase()
                : "?"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              {profile ? `${profile.first_name || ""} ${profile.last_name || ""}` : t('loading')}
            </span>
            <span className="text-xs text-sidebar-foreground/70">{t('free.version')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
