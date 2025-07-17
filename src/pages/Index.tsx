import React from 'react';
import { useApp } from '@/contexts/AppContext';
import RoleSelector from '@/components/RoleSelector';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { UserRole } from '@/types';

const Index: React.FC = () => {
  const { currentUser } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    // Navigate to register page with selected role
    window.location.href = `/register?role=${role}`;
  };

  if (!currentUser) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  return <DashboardLayout />;
};

export default Index;
