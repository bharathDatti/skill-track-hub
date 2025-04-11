
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart2, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Home, 
  LayoutDashboard, 
  MessageSquare,
  Settings, 
  Users 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const NavItem = ({ to, icon, label, end = false }: NavItemProps) => {
  const location = useLocation();
  
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-gray-500 hover:bg-muted"
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const { user } = useAuthStore();
  const role = user?.role;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out transform md:translate-x-0", 
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-center py-2">
              <span className="text-xl font-semibold text-brand-blue">DevMastery</span>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" end />
            
            {/* Admin specific links */}
            {role === 'admin' && (
              <>
                <NavItem to="/users" icon={<Users size={18} />} label="Users" />
                <NavItem to="/statistics" icon={<BarChart2 size={18} />} label="Statistics" />
              </>
            )}
            
            {/* Tutor specific links */}
            {(role === 'admin' || role === 'tutor') && (
              <>
                <NavItem to="/tasks" icon={<CheckCircle2 size={18} />} label="Tasks" />
                <NavItem to="/students" icon={<Users size={18} />} label="Students" />
              </>
            )}
            
            {/* Common links */}
            <NavItem to="/roadmap" icon={<BookOpen size={18} />} label="Learning Roadmap" />
            <NavItem to="/calendar" icon={<Calendar size={18} />} label="Calendar" />
            <NavItem to="/messages" icon={<MessageSquare size={18} />} label="Messages" />
            <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-muted-foreground text-center">
              DevMastery v1.0.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
