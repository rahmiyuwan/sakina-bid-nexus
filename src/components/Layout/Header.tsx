import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Bell } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Header: React.FC = () => {
  const { currentUser, currentProfile, signOut } = useApp();

  const handleLogout = async () => {
    await signOut();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'travel_agent': return 'Travel Agency';
      case 'hotel_provider': return 'Hotel Provider';
      case 'admin': return 'Administrator';
      case 'super_admin': return 'Super Administrator';
      default: return role;
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/8cfa4a00-bda0-48f3-9145-21434c9c3a5b.png" 
              alt="SAKINA" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SAKINA
              </h1>
              <p className="text-sm text-muted-foreground">
                Hotel Bidding Platform
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"></div>
              </Button>
              
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {currentProfile?.full_name || currentUser.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentProfile?.role ? getRoleDisplayName(currentProfile.role) : 'User'}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;