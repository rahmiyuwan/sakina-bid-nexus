import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

export const NavigationHeader: React.FC = () => {
  const { currentUser, currentProfile, signOut, unreadNotificationCount } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger className="mr-4" />
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 mr-auto">
          <img 
            src="/lovable-uploads/8cfa4a00-bda0-48f3-9145-21434c9c3a5b.png" 
            alt="SAKINA" 
            className="h-8 w-8 object-contain"
          />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SAKINA
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">
              Hotel Bidding Platform
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            {currentProfile?.role && (
              <Badge 
                variant={getRoleBadgeVariant(currentProfile.role)} 
                className="hidden md:inline-flex"
              >
                {getRoleDisplayName(currentProfile.role)}
              </Badge>
            )}

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </Badge>
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {currentProfile?.full_name?.charAt(0) || currentUser.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium truncate max-w-32">
                        {currentProfile?.full_name || currentUser.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentProfile?.role ? getRoleDisplayName(currentProfile.role) : 'User'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};