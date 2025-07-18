import React from 'react';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Layout/Header';
import TravelDashboard from './TravelDashboard';
import ProviderDashboard from './ProviderDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardLayout: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return null; // This shouldn't happen as we handle auth in Index
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default DashboardLayout;