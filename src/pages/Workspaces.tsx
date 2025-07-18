import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import WorkspaceManagement from '@/components/admin/WorkspaceManagement';

const Workspaces: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">Manage workspace organizations</p>
        </div>
        <WorkspaceManagement />
      </div>
    </MainLayout>
  );
};

export default Workspaces;