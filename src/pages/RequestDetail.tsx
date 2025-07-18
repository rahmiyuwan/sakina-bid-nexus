import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Users, MapPin, Building2, Clock } from 'lucide-react';
import { HotelOffering } from '@/types';

const RequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { requests, currentUser, currentProfile, addOffering, offerings, hotels } = useApp();
  
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({
    hotelName: '',
    priceDb: '',
    priceTp: '',
    priceQd: '',
    priceQt: '',
  });

  const request = requests.find(req => req.id === requestId);
  
  if (!request) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Request Not Found</h1>
          <Button onClick={() => navigate('/requests')}>
            Back to Requests
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Quoted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasExistingOffer = () => {
    return offerings.some(offer => 
      offer.request_id === requestId && 
      offer.provider_user_id === currentUser?.id
    );
  };

  const requestOfferings = offerings.filter(offer => offer.request_id === requestId);

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !requestId) return;

    // Find selected hotel to get hotel_id
    const selectedHotel = hotels.find(hotel => hotel.name === offerData.hotelName);
    if (!selectedHotel) {
      console.error('Selected hotel not found');
      return;
    }

    try {
      const newOffering: Omit<HotelOffering, 'id' | 'created_at' | 'updated_at' | 'final_price_double' | 'final_price_triple' | 'final_price_quad' | 'final_price_quint'> = {
        request_id: requestId,
        provider_user_id: currentUser.id,
        hotel_id: selectedHotel.id,
        hotel_name: offerData.hotelName,
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
    setShowOfferForm(false);
  };

  const canSubmitOffer = currentProfile?.role === 'hotel_provider' && 
                        (request.status === 'Submitted' || request.status === 'Quoted') && 
                        !hasExistingOffer();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/requests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Request #{request.id.slice(-6)}
            </h1>
            <p className="text-muted-foreground">Request details and offering</p>
          </div>
        </div>

        {/* Travel Agent - View Offerings */}
        {currentProfile?.role === 'travel_agent' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Hotel Offerings</CardTitle>
            </CardHeader>
            <CardContent>
              {requestOfferings.length > 0 ? (
                <div className="space-y-4">
                  {requestOfferings.map((offering) => (
                    <div key={offering.id} className="p-4 border border-border rounded-lg bg-background">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-foreground">{offering.hotel_name}</h4>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {offering.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {request.roomDb > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Double ({request.roomDb} rooms):</span>
                            <span className="font-medium text-foreground">{offering.final_price_double} SAR/night</span>
                          </div>
                        )}
                        {request.roomTp > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Triple ({request.roomTp} rooms):</span>
                            <span className="font-medium text-foreground">{offering.final_price_triple} SAR/night</span>
                          </div>
                        )}
                        {request.roomQd > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quad ({request.roomQd} rooms):</span>
                            <span className="font-medium text-foreground">{offering.final_price_quad} SAR/night</span>
                          </div>
                        )}
                        {request.roomQt > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quint ({request.roomQt} rooms):</span>
                            <span className="font-medium text-foreground">{offering.final_price_quint} SAR/night</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Submitted on {new Date(offering.created_at).toLocaleDateString()}
                          </span>
                          {offering.status === 'PENDING' && (
                            <Button 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={() => {
                                // TODO: Implement accept offering functionality
                                console.log('Accept offering:', offering.id);
                              }}
                            >
                              Accept Offer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No offerings have been submitted for this request yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Request Information</CardTitle>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Travel Name</Label>
                      <p className="text-lg font-semibold">{request.travelName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tour Leader</Label>
                      <p className="text-lg">{request.tlName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Package Type</Label>
                      <p className="text-lg">{request.packageType}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Total PAX</Label>
                        <p className="text-lg font-semibold">{request.paxCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">City</Label>
                        <p className="text-lg">{request.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                        <p className="text-lg">
                          {new Date(request.checkIn).toLocaleDateString()} - {new Date(request.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Room Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{request.roomDb}</p>
                    <p className="text-sm text-muted-foreground">Double Rooms</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{request.roomTp}</p>
                    <p className="text-sm text-muted-foreground">Triple Rooms</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{request.roomQd}</p>
                    <p className="text-sm text-muted-foreground">Quad Rooms</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{request.roomQt}</p>
                    <p className="text-sm text-muted-foreground">Quint Rooms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Offer Section */}
          <div className="space-y-6">
            {canSubmitOffer && !showOfferForm && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Submit Your Offer</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    This request is open for bidding. Submit your competitive offer now.
                  </p>
                  <Button 
                    onClick={() => setShowOfferForm(true)}
                    className="w-full"
                  >
                    Create Offer
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasExistingOffer() && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Offer Submitted</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700">
                    You have already submitted an offer for this request.
                  </p>
                </CardContent>
              </Card>
            )}

            {!canSubmitOffer && !hasExistingOffer() && currentProfile?.role === 'hotel_provider' && (
              <Card className="border-2 border-muted">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">Offering Closed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This request is no longer accepting offers.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Offer Form */}
            {showOfferForm && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Hotel Offer Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitOffer} className="space-y-4">
                    <div>
                      <Label htmlFor="hotelName">Hotel Name</Label>
                      <Select 
                        value={offerData.hotelName} 
                        onValueChange={(value) => setOfferData({...offerData, hotelName: value})}
                        required
                      >
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select a hotel" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border shadow-lg z-50">
                          {hotels
                            .filter(hotel => hotel.city === request.city)
                            .map((hotel) => (
                              <SelectItem 
                                key={hotel.id} 
                                value={hotel.name}
                                className="hover:bg-muted focus:bg-muted"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{hotel.name}</span>
                                  {hotel.rating && (
                                    <span className="text-xs text-muted-foreground">
                                      {hotel.rating} stars
                                      {hotel.distance_to_haram && ` • ${hotel.distance_to_haram}m from Haram`}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          {hotels.filter(hotel => hotel.city === request.city).length === 0 && (
                            <SelectItem value="" disabled>
                              No hotels available for {request.city}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Room Pricing (SAR per night)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="priceDb" className="text-xs">Double</Label>
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
                          <Label htmlFor="priceTp" className="text-xs">Triple</Label>
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
                          <Label htmlFor="priceQd" className="text-xs">Quad</Label>
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
                          <Label htmlFor="priceQt" className="text-xs">Quint</Label>
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
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowOfferForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Submit Offer
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RequestDetail;