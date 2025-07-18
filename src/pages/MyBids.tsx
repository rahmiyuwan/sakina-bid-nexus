import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, X, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MyBids: React.FC = () => {
  const { currentUser, currentProfile, requests, offerings, refreshOfferings } = useApp();
  const { toast } = useToast();

  const userOfferings = offerings.filter(offer => offer.provider_user_id === currentUser?.id);
  const requestsWithMyBids = requests.filter(req => 
    userOfferings.some(offer => offer.request_id === req.id)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const cancelBid = async (offeringId: string) => {
    try {
      const { offeringService } = await import('@/services/offeringService');
      await offeringService.delete(offeringId);
      await refreshOfferings();
      toast({
        title: "Bid Cancelled",
        description: "Your bid has been successfully cancelled.",
      });
    } catch (error) {
      console.error('Error cancelling bid:', error);
      toast({
        title: "Error",
        description: "Failed to cancel bid. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bids I Have Submitted</h1>
            <p className="text-muted-foreground">
              Manage your submitted hotel offers and track their status
            </p>
          </div>
        </div>

        {userOfferings.length > 0 ? (
          <div className="grid gap-6">
            {requestsWithMyBids.map((request) => {
              const myOffering = userOfferings.find(offer => offer.request_id === request.id);
              if (!myOffering) return null;
              
              return (
                <Card key={request.id} className="bg-gradient-card hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl text-foreground">
                          {request.travelName}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{request.city}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{request.paxCount} PAX</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(request.checkIn).toLocaleDateString()} - {new Date(request.checkOut).toLocaleDateString()}
                            </span>
                          </span>
                        </CardDescription>
                        <p className="text-sm text-muted-foreground">
                          Request #{request.id.slice(-6)} • Tour Leader: {request.tlName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(myOffering.status)}
                        >
                          {myOffering.status}
                        </Badge>
                        {myOffering.status === 'PENDING' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => cancelBid(myOffering.id)}
                            className="h-8 px-3"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel Bid
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="font-medium text-primary text-lg">
                        {myOffering.hotel_name}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {request.roomDb > 0 && (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="text-center">
                            <div className="font-semibold text-primary text-lg">Double Room</div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {request.roomDb} room(s) needed
                            </div>
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-foreground">
                                {myOffering.price_double} SAR
                              </div>
                              <div className="text-sm text-muted-foreground">
                                per night
                              </div>
                              {(currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin') && (
                                <div className="text-xs text-primary font-medium">
                                  Final: {myOffering.final_price_double} SAR
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {request.roomTp > 0 && (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="text-center">
                            <div className="font-semibold text-primary text-lg">Triple Room</div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {request.roomTp} room(s) needed
                            </div>
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-foreground">
                                {myOffering.price_triple} SAR
                              </div>
                              <div className="text-sm text-muted-foreground">
                                per night
                              </div>
                              {(currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin') && (
                                <div className="text-xs text-primary font-medium">
                                  Final: {myOffering.final_price_triple} SAR
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {request.roomQd > 0 && (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="text-center">
                            <div className="font-semibold text-primary text-lg">Quad Room</div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {request.roomQd} room(s) needed
                            </div>
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-foreground">
                                {myOffering.price_quad} SAR
                              </div>
                              <div className="text-sm text-muted-foreground">
                                per night
                              </div>
                              {(currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin') && (
                                <div className="text-xs text-primary font-medium">
                                  Final: {myOffering.final_price_quad} SAR
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {request.roomQt > 0 && (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="text-center">
                            <div className="font-semibold text-primary text-lg">Quint Room</div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {request.roomQt} room(s) needed
                            </div>
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-foreground">
                                {myOffering.price_quint} SAR
                              </div>
                              <div className="text-sm text-muted-foreground">
                                per night
                              </div>
                              {(currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin') && (
                                <div className="text-xs text-primary font-medium">
                                  Final: {myOffering.final_price_quint} SAR
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Submitted:</span> {new Date(myOffering.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Bids Submitted Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any hotel offers yet. Browse available requests to start bidding.
              </p>
              <Button 
                onClick={() => window.location.href = '/requests'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Browse Available Requests
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default MyBids;