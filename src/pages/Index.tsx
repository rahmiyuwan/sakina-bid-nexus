import React from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import RoleSelector from '@/components/RoleSelector';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { User, UserRole } from '@/types';

const AppContent: React.FC = () => {
  const { currentUser, setCurrentUser } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    // Navigate to register page with selected role
    window.location.href = `/register?role=${role}`;
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
