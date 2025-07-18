import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { MainLayout } from '@/components/Layout/MainLayout';
import TravelDashboard from './TravelDashboard';
import ProviderDashboard from './ProviderDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardLayout: React.FC = () => {
  const { currentProfile } = useApp();

  if (!currentProfile) {
    return null; // This shouldn't happen as we handle auth in Index
  }

  const renderDashboard = () => {
    switch (currentProfile.role) {
      case 'travel_agent':
        return <TravelDashboard />;
      case 'hotel_provider':
        return <ProviderDashboard />;
      case 'admin':
      case 'super_admin':
        return <AdminDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <MainLayout>
      {renderDashboard()}
    </MainLayout>
  );
};

export default DashboardLayout;