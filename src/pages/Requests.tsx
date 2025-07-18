import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageLoadingSpinner } from '@/components/Common/LoadingStates';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Requests: React.FC = () => {
  const { requests, offerings, currentProfile, dataLoading, refreshRequests, refreshOfferings } = useApp();

  useEffect(() => {
    refreshRequests();
    refreshOfferings();
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

  if (dataLoading) {
    return (
      <MainLayout>
        <PageLoadingSpinner message="Loading requests..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
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
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Request Management</h2>
            {(currentProfile?.role === 'travel_agent' || currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin') && (
              <Button asChild>
                <Link to="/requests/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Link>
              </Button>
            )}
          </div>
          
          <div className="grid gap-4">
            {dataLoading ? (
              <PageLoadingSpinner message="Loading requests..." />
            ) : requests.length === 0 ? (
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
              requests
                .filter(request => {
                  // Hotel providers should only see non-confirmed requests
                  if (currentProfile?.role === 'hotel_provider') {
                    return request.status !== 'Confirmed';
                  }
                  return true;
                })
                .map((request) => {
                const requestOfferings = offerings.filter(offering => offering.request_id === request.id);
                const isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin';
                
                return (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Request #{request.id.slice(-6)}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="font-medium">Travel Name</p>
                          <p className="text-muted-foreground">{request.workspace?.description || 'N/A'}</p>
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
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/requests/${request.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Notes Section */}
                      {request.notes && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium text-sm mb-1">Notes</p>
                          <p className="text-sm text-muted-foreground">{request.notes}</p>
                        </div>
                      )}
                      
                      {isAdmin && requestOfferings.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-3">Offers ({requestOfferings.length})</h4>
                          <div className="space-y-2">
                            {requestOfferings.map((offering) => (
                              <div key={offering.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{offering.hotel_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Double: {offering.final_price_double} SAR | 
                                    Triple: {offering.final_price_triple} SAR | 
                                    Quad: {offering.final_price_quad} SAR | 
                                    Quint: {offering.final_price_quint} SAR
                                  </p>
                                </div>
                                <Badge variant={offering.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                  {offering.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Requests;