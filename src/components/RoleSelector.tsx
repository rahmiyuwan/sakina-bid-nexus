import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, Shield } from 'lucide-react';
import { UserRole } from '@/types';

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'TRAVEL' as UserRole,
      title: 'Travel Agency',
      description: 'Request a hotel acommodation with the best price',
      icon: User,
      features: ['Submit hotel requests', 'View and compare offerings', 'Confirm bookings'],
    },
    {
      id: 'PROVIDER' as UserRole,
      title: 'Hotel Provider',
      description: 'Serve pilgrims with the best offering',
      icon: Building2,
      features: ['View travel requests', 'Submit competitive bids', 'Manage offerings'],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/2e0f222c-cef6-4ccc-83d1-1896315257f9.png" 
              alt="SAKINA Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to SAKINA
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional hotel bidding platform connecting travel agencies with hotel providers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roles.map((role) => (
            <Card key={role.id} className="relative group hover:shadow-strong transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-primary rounded-xl shadow-medium">
                    <role.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {role.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {role.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="premium" 
                  size="lg" 
                  className="w-full mt-6"
                  onClick={() => onRoleSelect(role.id)}
                >
                  Continue as {role.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            Select your role to access the SAKINA platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;