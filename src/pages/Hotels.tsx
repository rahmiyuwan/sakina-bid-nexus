import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import HotelManagement from '@/components/admin/HotelManagement';

const Hotels: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotels</h1>
          <p className="text-muted-foreground">Manage hotel listings and information</p>
        </div>
        <HotelManagement />
      </div>
    </MainLayout>
  );
};

export default Hotels;