import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import UserManagement from '@/components/admin/UserManagement';

const Users: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <UserManagement />
      </div>
    </MainLayout>
  );
};

export default Users;