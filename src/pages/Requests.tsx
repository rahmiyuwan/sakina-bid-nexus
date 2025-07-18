import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageLoadingSpinner } from '@/components/Common/LoadingStates';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Requests: React.FC = () => {
  const { requests, currentProfile } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time to allow context to initialize
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Quoted':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Confirmed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageLoadingSpinner message="Loading requests..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
            <p className="text-muted-foreground">
              {currentProfile?.role === 'travel_agent' 
                ? 'Manage your hotel booking requests'
                : currentProfile?.role === 'hotel_provider'
                ? 'Available requests for bidding'
                : 'All system requests'
              }
            </p>
          </div>
          {currentProfile?.role === 'travel_agent' && (
            <Button asChild>
              <Link to="/requests/new">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid gap-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No requests found</p>
                {currentProfile?.role === 'travel_agent' && (
                  <Button asChild className="mt-4">
                    <Link to="/requests/new">Create your first request</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Request #{request.id.slice(-6)}</CardTitle>
                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Travel Name</p>
                      <p className="text-muted-foreground">{request.travelName}</p>
                    </div>
                    <div>
                      <p className="font-medium">Tour Leader</p>
                      <p className="text-muted-foreground">{request.tlName}</p>
                    </div>
                    <div>
                      <p className="font-medium">City</p>
                      <p className="text-muted-foreground">{request.city}</p>
                    </div>
                    <div>
                      <p className="font-medium">PAX</p>
                      <p className="text-muted-foreground">{request.paxCount}</p>
                    </div>
                    <div>
                      <p className="font-medium">Check-in</p>
                      <p className="text-muted-foreground">{new Date(request.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Check-out</p>
                      <p className="text-muted-foreground">{new Date(request.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Package</p>
                      <p className="text-muted-foreground">{request.packageType}</p>
                    </div>
                    <div className="flex items-center">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Requests;