import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Building2, DollarSign, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { HotelOffering } from '@/types';

const ProviderDashboard: React.FC = () => {
  const { currentUser, requests, offerings, addOffering } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [offerData, setOfferData] = useState({
    hotelName: '',
    priceDb: '',
    priceTp: '',
    priceQd: '',
    priceQt: '',
  });

  const userOfferings = offerings.filter(offer => offer.providerUserId === currentUser?.id);
  const pendingRequests = requests.filter(req => req.status === 'PENDING' || req.status === 'BIDDING');
  const pendingOfferings = userOfferings.filter(offer => offer.status === 'PENDING');
  const confirmedOfferings = userOfferings.filter(offer => offer.status === 'CONFIRMED');

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedRequest) return;

    const newOffering: Omit<HotelOffering, 'id' | 'createdAt' | 'finalPriceDb' | 'finalPriceTp' | 'finalPriceQd' | 'finalPriceQt'> = {
      requestId: selectedRequest,
      hotelName: offerData.hotelName,
      providerUserId: currentUser.id,
      priceDb: parseFloat(offerData.priceDb) || 0,
      priceTp: parseFloat(offerData.priceTp) || 0,
      priceQd: parseFloat(offerData.priceQd) || 0,
      priceQt: parseFloat(offerData.priceQt) || 0,
      adminMargin: 10, // Default margin
      status: 'PENDING',
    };

    addOffering(newOffering);
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
    return userOfferings.some(offer => offer.requestId === requestId);
  };

  const totalRevenue = confirmedOfferings.reduce((total, offer) => {
    return total + offer.finalPriceDb + offer.finalPriceTp + offer.finalPriceQd + offer.finalPriceQt;
  }, 0);

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
            <div className="text-2xl font-bold text-primary">{pendingRequests.length}</div>
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

      {/* Available Requests */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Available Hotel Requests</h2>
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending requests available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{request.travelName}</span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {hasExistingOffer(request.id) && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Offer Submitted
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{request.paxCount} PAX</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{request.city}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{request.checkIn} - {request.checkOut}</span>
                        </span>
                      </CardDescription>
                    </div>
                    {!hasExistingOffer(request.id) && (
                      <Button 
                        variant="secondary" 
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        Submit Offer
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Team Leader:</strong> {request.tlName}</p>
                    <p><strong>Package:</strong> {request.packageType}</p>
                    <p><strong>Room Requirements:</strong> {request.roomDb} Double, {request.roomTp} Triple, {request.roomQd} Quad, {request.roomQt} Quint</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Offer Form */}
      {selectedRequest && (
        <Card className="border-2 border-secondary/20 shadow-gold">
          <CardHeader>
            <CardTitle>Submit Hotel Offer</CardTitle>
            <CardDescription>Provide your competitive pricing for this request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <Label htmlFor="hotelName">Hotel Name</Label>
                <Input 
                  id="hotelName" 
                  value={offerData.hotelName}
                  onChange={(e) => setOfferData({...offerData, hotelName: e.target.value})}
                  placeholder="Enter your hotel name"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="priceDb">Double Room Price (SAR)</Label>
                  <Input 
                    id="priceDb" 
                    type="number" 
                    step="0.01"
                    min="0" 
                    value={offerData.priceDb}
                    onChange={(e) => setOfferData({...offerData, priceDb: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="priceTp">Triple Room Price (SAR)</Label>
                  <Input 
                    id="priceTp" 
                    type="number" 
                    step="0.01"
                    min="0" 
                    value={offerData.priceTp}
                    onChange={(e) => setOfferData({...offerData, priceTp: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="priceQd">Quad Room Price (SAR)</Label>
                  <Input 
                    id="priceQd" 
                    type="number" 
                    step="0.01"
                    min="0" 
                    value={offerData.priceQd}
                    onChange={(e) => setOfferData({...offerData, priceQd: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="priceQt">Quint Room Price (SAR)</Label>
                  <Input 
                    id="priceQt" 
                    type="number" 
                    step="0.01"
                    min="0" 
                    value={offerData.priceQt}
                    onChange={(e) => setOfferData({...offerData, priceQt: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> A 10 SAR admin margin will be automatically added to your prices for the final customer pricing.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="premium">
                  Submit Offer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Offerings */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">My Offerings</h3>
        <div className="space-y-4">
          {userOfferings.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No offerings yet. Submit your first offer!</p>
              </CardContent>
            </Card>
          ) : (
            userOfferings.map((offering) => {
              const request = requests.find(r => r.id === offering.requestId);
              return (
                <Card key={offering.id} className="hover:shadow-soft transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{offering.hotelName}</span>
                          <Badge className={getStatusColor(offering.status)}>
                            {offering.status}
                          </Badge>
                        </CardTitle>
                        {request && (
                          <CardDescription>
                            For: {request.travelName} • {request.city} • {request.checkIn} - {request.checkOut}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Double</p>
                        <p className="text-muted-foreground">{offering.priceDb} SAR</p>
                        <p className="text-xs text-secondary">Final: {offering.finalPriceDb} SAR</p>
                      </div>
                      <div>
                        <p className="font-medium">Triple</p>
                        <p className="text-muted-foreground">{offering.priceTp} SAR</p>
                        <p className="text-xs text-secondary">Final: {offering.finalPriceTp} SAR</p>
                      </div>
                      <div>
                        <p className="font-medium">Quad</p>
                        <p className="text-muted-foreground">{offering.priceQd} SAR</p>
                        <p className="text-xs text-secondary">Final: {offering.finalPriceQd} SAR</p>
                      </div>
                      <div>
                        <p className="font-medium">Quint</p>
                        <p className="text-muted-foreground">{offering.priceQt} SAR</p>
                        <p className="text-xs text-secondary">Final: {offering.finalPriceQt} SAR</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;