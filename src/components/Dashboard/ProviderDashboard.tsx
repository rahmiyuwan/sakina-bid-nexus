import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Building2, DollarSign, Clock, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { HotelOffering } from '@/types';

const ProviderDashboard: React.FC = () => {
  const { currentUser, requests, offerings, addOffering, refreshOfferings } = useApp();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [offerData, setOfferData] = useState({
    hotelName: '',
    priceDb: '',
    priceTp: '',
    priceQd: '',
    priceQt: '',
  });

  const userOfferings = offerings.filter(offer => offer.provider_user_id === currentUser?.id);
  const requestsWithMyBids = requests.filter(req => 
    userOfferings.some(offer => offer.request_id === req.id)
  );
  const requestsWithoutMyBids = requests.filter(req => 
    !userOfferings.some(offer => offer.request_id === req.id) && 
    (req.status === 'Submitted' || req.status === 'Quoted')
  );
  const pendingOfferings = userOfferings.filter(offer => offer.status === 'PENDING');
  const confirmedOfferings = userOfferings.filter(offer => offer.status === 'CONFIRMED');

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedRequest) return;

    try {
      const newOffering: Omit<HotelOffering, 'id' | 'created_at' | 'updated_at' | 'final_price_double' | 'final_price_triple' | 'final_price_quad' | 'final_price_quint'> = {
        request_id: selectedRequest,
        hotel_name: offerData.hotelName,
        provider_user_id: currentUser.id,
        hotel_id: '', // This should be set from hotel selection
        price_double: parseFloat(offerData.priceDb) || 0,
        price_triple: parseFloat(offerData.priceTp) || 0,
        price_quad: parseFloat(offerData.priceQd) || 0,
        price_quint: parseFloat(offerData.priceQt) || 0,
        admin_margin: 10, // Default margin
        status: 'PENDING',
      };

      await addOffering(newOffering);
    } catch (error) {
      console.error('Error submitting offer:', error);
    }
    setOfferData({
      hotelName: '',
      priceDb: '',
      priceTp: '',
      priceQd: '',
      priceQt: '',
    });
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasExistingOffer = (requestId: string) => {
    return userOfferings.some(offer => offer.request_id === requestId);
  };

  const totalRevenue = confirmedOfferings.reduce((total, offer) => {
    return total + offer.final_price_double + offer.final_price_triple + offer.final_price_quad + offer.final_price_quint;
  }, 0);

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{requestsWithoutMyBids.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOfferings.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Deals</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedOfferings.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalRevenue.toFixed(0)} SAR</div>
          </CardContent>
        </Card>
      </div>

      {/* My Bids Section */}
      {userOfferings.length > 0 && (
        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Bids I Have Submitted</CardTitle>
            <CardDescription>Manage your submitted hotel offers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestsWithMyBids.map((request) => {
                const myOffering = userOfferings.find(offer => offer.request_id === request.id);
                if (!myOffering) return null;
                
                return (
                  <div key={request.id} className="p-4 border border-border rounded-lg bg-background/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {request.travelName} - {request.city}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Request #{request.id.slice(-6)} • {request.paxCount} PAX
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
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="font-medium text-primary">
                        My Hotel: {myOffering.hotel_name}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {request.roomDb > 0 && (
                        <div className="p-2 bg-primary/5 rounded border border-primary/20">
                          <div className="font-medium text-primary">Double</div>
                          <div className="text-foreground">{myOffering.price_double} SAR</div>
                          <div className="text-xs text-muted-foreground">
                            Final: {myOffering.final_price_double} SAR
                          </div>
                        </div>
                      )}
                      {request.roomTp > 0 && (
                        <div className="p-2 bg-primary/5 rounded border border-primary/20">
                          <div className="font-medium text-primary">Triple</div>
                          <div className="text-foreground">{myOffering.price_triple} SAR</div>
                          <div className="text-xs text-muted-foreground">
                            Final: {myOffering.final_price_triple} SAR
                          </div>
                        </div>
                      )}
                      {request.roomQd > 0 && (
                        <div className="p-2 bg-primary/5 rounded border border-primary/20">
                          <div className="font-medium text-primary">Quad</div>
                          <div className="text-foreground">{myOffering.price_quad} SAR</div>
                          <div className="text-xs text-muted-foreground">
                            Final: {myOffering.final_price_quad} SAR
                          </div>
                        </div>
                      )}
                      {request.roomQt > 0 && (
                        <div className="p-2 bg-primary/5 rounded border border-primary/20">
                          <div className="font-medium text-primary">Quint</div>
                          <div className="text-foreground">{myOffering.price_quint} SAR</div>
                          <div className="text-xs text-muted-foreground">
                            Final: {myOffering.final_price_quint} SAR
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Submitted on {new Date(myOffering.created_at).toLocaleDateString()}</span>
                        <span>Check-in: {new Date(request.checkIn).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default ProviderDashboard;