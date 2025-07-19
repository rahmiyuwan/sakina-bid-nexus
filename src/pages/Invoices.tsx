import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useApp } from '@/contexts/AppContext';

const Invoices = () => {
  const navigate = useNavigate();
  const { currentProfile } = useApp();

  // Only allow admin and super_admin access
  if (!currentProfile || !['admin', 'super_admin'].includes(currentProfile.role)) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="text-center p-8">
              <p className="text-muted-foreground">Access denied. This page is only available to administrators.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <Button onClick={() => navigate('/invoices/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              No invoices found. Click "New Invoice" to create your first invoice.
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Invoices;