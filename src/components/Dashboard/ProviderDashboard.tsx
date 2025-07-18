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
  const pendingRequests = requests.filter(req => req.status === 'Submitted' || req.status === 'Quoted');
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

    </div>
  );
};

export default ProviderDashboard;