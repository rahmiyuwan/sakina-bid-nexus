import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Plus,
  Bell,
  User,
  Building2,
  Gavel,
  Settings,
  Users,
  DollarSign,
  MapPin,
  ClipboardList,
  UserCheck,
  Hotel,
  Receipt
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

const getNavigationItems = (role: string) => {
  switch (role) {
    case 'travel_agent':
      return [
        { title: 'Dashboard', url: '/dashboard', icon: Home },
        { title: 'Requests', url: '/requests', icon: FileText },
        { title: 'New Request', url: '/requests/new', icon: Plus },
        { title: 'Notifications', url: '/notifications', icon: Bell },
        { title: 'Profile', url: '/profile', icon: User },
      ];
    
    case 'hotel_provider':
      return [
        { title: 'Dashboard', url: '/dashboard', icon: Home },
        { title: 'Available Requests', url: '/requests', icon: FileText },
        { title: 'My Bids', url: '/bids', icon: Gavel },
        { title: 'My Hotels', url: '/hotels', icon: Building2 },
        { title: 'Notifications', url: '/notifications', icon: Bell },
        { title: 'Profile', url: '/profile', icon: User },
      ];
    
    case 'admin':
      return [
        { title: 'Dashboard', url: '/dashboard', icon: Home },
        { title: 'All Requests', url: '/requests', icon: FileText },
        { title: 'Invoices', url: '/invoices', icon: Receipt },
        { title: 'Commissions', url: '/commissions', icon: DollarSign },
        { title: 'Hotels', url: '/hotels', icon: Hotel },
        { title: 'Notifications', url: '/notifications', icon: Bell },
        { title: 'Profile', url: '/profile', icon: User },
      ];
    
    case 'super_admin':
      return [
        { title: 'Dashboard', url: '/dashboard', icon: Home },
        { title: 'All Requests', url: '/requests', icon: FileText },
        { title: 'Invoices', url: '/invoices', icon: Receipt },
        { title: 'Commissions', url: '/commissions', icon: DollarSign },
        { title: 'Hotels', url: '/hotels', icon: Hotel },
        { title: 'Settings', url: '/settings', icon: Settings },
        { title: 'Users', url: '/users', icon: Users },
        { title: 'Workspaces', url: '/workspaces', icon: Building2 },
        { title: 'Notifications', url: '/notifications', icon: Bell },
        { title: 'Profile', url: '/profile', icon: User },
      ];
    
    default:
      return [];
  }
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { currentProfile } = useApp();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  if (!currentProfile) return null;

  const navigationItems = getNavigationItems(currentProfile.role);
  
  const isActive = (path: string) => {
    if (path === '/dashboard' && currentPath === '/') return true;
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'travel_agent': return 'Travel Agency';
      case 'hotel_provider': return 'Hotel Provider';
      case 'admin': return 'Administrator';
      case 'super_admin': return 'Super Admin';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'travel_agent': return 'default';
      case 'hotel_provider': return 'secondary';
      case 'admin': return 'outline';
      case 'super_admin': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {!collapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/8cfa4a00-bda0-48f3-9145-21434c9c3a5b.png" 
                alt="SAKINA" 
                className="h-8 w-8 object-contain"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-sidebar-foreground truncate">
                  SAKINA
                </h2>
                <Badge variant={getRoleBadgeVariant(currentProfile.role)} className="text-xs">
                  {getRoleDisplayName(currentProfile.role)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const itemIsActive = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center space-x-3 transition-colors ${
                          itemIsActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <item.icon className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4'} flex-shrink-0`} />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}