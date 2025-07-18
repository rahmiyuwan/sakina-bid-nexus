import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import CommissionManagement from '@/components/admin/CommissionManagement';

const Commissions: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-muted-foreground">Manage commission rates and settings</p>
        </div>
        <CommissionManagement />
      </div>
    </MainLayout>
  );
};

export default Commissions;