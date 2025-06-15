
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  CheckSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Briefcase,
  MessageSquare,
  FileText,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/theme/theme-toggle';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, isCollapsed, onClick }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center px-3 py-2 rounded-lg text-sidebar-foreground transition-all duration-200 ease-in-out nav-item",
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50",
        isCollapsed ? "justify-center" : "justify-start"
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className={cn("flex items-center justify-center", isCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3")}>
          {icon}
        </span>
        {!isCollapsed && <span>{label}</span>}
      </div>
    </NavLink>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Render mobile menu button when on mobile
  const MobileMenuButton = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
    </Button>
  );

  const sidebarContent = (
    <>
      <div className="px-3 py-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg animate-fade-in">
                T
              </div>
              <h1 className="ml-2 font-semibold text-xl">TeamFlow</h1>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
              T
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="ml-2"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <NavItem
            to="/"
            icon={<LayoutDashboard size={isCollapsed ? 20 : 18} />}
            label="Dashboard"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
          <NavItem
            to="/tasks"
            icon={<CheckSquare size={isCollapsed ? 20 : 18} />}
            label="Tasks"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
          <NavItem
            to="/projects"
            icon={<Briefcase size={isCollapsed ? 20 : 18} />}
            label="Projects"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
          <NavItem
            to="/notes"
            icon={<FileText size={isCollapsed ? 20 : 18} />}
            label="Notes"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
          <NavItem
            to="/team"
            icon={<Users size={isCollapsed ? 20 : 18} />}
            label="Team"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
          <NavItem
            to="/messages"
            icon={<MessageSquare size={isCollapsed ? 20 : 18} />}
            label="Messages"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
          <NavItem
            to="/calendar"
            icon={<CalendarClock size={isCollapsed ? 20 : 18} />}
            label="Calendar"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
          <NavItem
            to="/storage"
            icon={<HardDrive size={isCollapsed ? 20 : 18} />}
            label="Storage"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
          <NavItem
            to="/settings"
            icon={<Settings size={isCollapsed ? 20 : 18} />}
            label="Settings"
            isCollapsed={isCollapsed}
            onClick={closeMobileSidebar}
          />
        </div>
        
        <div className="mt-auto pt-4">
          <ThemeToggle className={isCollapsed ? "mx-auto" : ""} />
        </div>
      </div>
    </>
  );

  // Mobile sidebar (slide in from left)
  if (isMobile) {
    return (
      <>
        <MobileMenuButton />
        <div
          className={cn(
            "fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMobileOpen(false)}
        />
        <aside
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-sidebar dark:bg-sidebar z-50 shadow-xl transition-transform duration-300 ease-in-expo animate-slide-in-right",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "h-screen bg-sidebar dark:bg-sidebar border-r border-sidebar-border dark:border-sidebar-border/20 transition-all duration-300 ease-in-expo",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {sidebarContent}
    </aside>
  );
}
