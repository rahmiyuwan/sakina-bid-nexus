import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoadingSpinner } from '@/components/Common/LoadingStates';

const Index: React.FC = () => {
  const { currentUser, loading } = useApp();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return <PageLoadingSpinner message="Initializing SAKINA..." />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to SAKINA</CardTitle>
            <CardDescription>
              Hotel Bidding Platform - Please sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Sign In / Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This will be handled by the useEffect redirect
  return null;
};

export default Index;
