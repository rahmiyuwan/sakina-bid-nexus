import React from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import RoleSelector from '@/components/RoleSelector';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { User, UserRole } from '@/types';

const AppContent: React.FC = () => {
  const { currentUser, setCurrentUser } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    // Simulate user creation - in real app this would be handled by OAuth/backend
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: `user@${role.toLowerCase()}.com`,
      name: `${role} User`,
      role: role,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(mockUser);
  };

  if (!currentUser) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  return <DashboardLayout />;
};

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
