import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageLoadingSpinner } from '@/components/Common/LoadingStates';

const Notifications: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activities
            </p>
          </div>
        </div>
        
        <PageLoadingSpinner message="Loading notifications..." />
      </div>
    </MainLayout>
  );
};

export default Notifications;