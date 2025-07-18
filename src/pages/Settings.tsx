import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import SettingManagement from '@/components/admin/SettingManagement';

const Settings: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage system settings and configuration</p>
        </div>
        <SettingManagement />
      </div>
    </MainLayout>
  );
};

export default Settings;