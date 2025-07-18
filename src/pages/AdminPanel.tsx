import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import WorkspaceManagement from '@/components/admin/WorkspaceManagement';
import UserManagement from '@/components/admin/UserManagement';
import SettingManagement from '@/components/admin/SettingManagement';
import RequestManagement from '@/components/admin/RequestManagement';
import HotelManagement from '@/components/admin/HotelManagement';
import CommissionManagement from '@/components/admin/CommissionManagement';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workspaces');
  const { currentUser, currentProfile } = useApp();

  if (!currentUser || !currentProfile || currentProfile.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>
            Manage all system data and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
              <TabsTrigger value="commissions">Commissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="workspaces" className="mt-6">
              <WorkspaceManagement />
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <SettingManagement />
            </TabsContent>
            
            <TabsContent value="requests" className="mt-6">
              <RequestManagement />
            </TabsContent>
            
            <TabsContent value="hotels" className="mt-6">
              <HotelManagement />
            </TabsContent>
            
            <TabsContent value="commissions" className="mt-6">
              <CommissionManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;