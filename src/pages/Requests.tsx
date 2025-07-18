import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageLoadingSpinner } from '@/components/Common/LoadingStates';

const Requests: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
            <p className="text-muted-foreground">
              Manage your hotel booking requests
            </p>
          </div>
        </div>
        
        <PageLoadingSpinner message="Loading requests..." />
      </div>
    </MainLayout>
  );
};

export default Requests;