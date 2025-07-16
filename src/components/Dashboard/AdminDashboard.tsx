import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Building2, DollarSign, Settings, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const AdminDashboard: React.FC = () => {
  const { requests, offerings, updateOfferingMargin } = useApp();
  const [marginEdits, setMarginEdits] = useState<{[key: string]: string}>({});

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(req => req.status === 'PENDING').length;
  const confirmedRequests = requests.filter(req => req.status === 'CONFIRMED').length;
  const totalOfferings = offerings.length;
  const confirmedOfferings = offerings.filter(offer => offer.status === 'CONFIRMED');
  
  const totalRevenue = confirmedOfferings.reduce((total, offer) => {
    const adminRevenue = offer.adminMargin * 4; // Assuming 4 room types for simplicity
    return total + adminRevenue;
  }, 0);

  const totalTransactionValue = confirmedOfferings.reduce((total, offer) => {
    return total + offer.finalPriceDb + offer.finalPriceTp + offer.finalPriceQd + offer.finalPriceQt;
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'BIDDING': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarginUpdate = (offeringId: string) => {
    const newMargin = parseFloat(marginEdits[offeringId]);
    if (!isNaN(newMargin) && newMargin >= 0) {
      updateOfferingMargin(offeringId, newMargin);
      setMarginEdits(prev => ({ ...prev, [offeringId]: '' }));
    }
  };

  const getRequestForOffering = (requestId: string) => {
    return requests.find(req => req.id === requestId);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {pendingRequests} pending, {confirmedRequests} confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offerings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalOfferings}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedOfferings.length} confirmed deals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalRevenue.toFixed(0)} SAR</div>
            <p className="text-xs text-muted-foreground">
              From confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaction Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalTransactionValue.toFixed(0)} SAR</div>
            <p className="text-xs text-muted-foreground">
              Total platform volume
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.slice(-5).reverse().map((request) => (
                <div key={request.id} className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{request.travelName}</p>
                    <p className="text-xs text-muted-foreground">{request.city} • {request.paxCount} PAX</p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No requests yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Offerings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Recent Offerings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offerings.slice(-5).reverse().map((offering) => {
                const request = getRequestForOffering(offering.requestId);
                return (
                  <div key={offering.id} className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{offering.hotelName}</p>
                      <p className="text-xs text-muted-foreground">
                        {request?.travelName} • Margin: {offering.adminMargin} SAR
                      </p>
                    </div>
                    <Badge className={getStatusColor(offering.status)}>
                      {offering.status}
                    </Badge>
                  </div>
                );
              })}
              {offerings.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No offerings yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Margin Management */}
      <Card className="border-2 border-secondary/20 shadow-gold">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Offering Margin Management</span>
          </CardTitle>
          <CardDescription>
            Manage admin margins for each hotel offering. Changes will update final pricing automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offerings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No offerings to manage yet</p>
            ) : (
              offerings.map((offering) => {
                const request = getRequestForOffering(offering.requestId);
                return (
                  <div key={offering.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{offering.hotelName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Request: {request?.travelName} • {request?.city}
                        </p>
                        <Badge className={`${getStatusColor(offering.status)} mt-1`}>
                          {offering.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Current Margin: {offering.adminMargin} SAR</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium">Double Room</p>
                        <p className="text-muted-foreground">Provider: {offering.priceDb} SAR</p>
                        <p className="text-secondary font-medium">Final: {offering.finalPriceDb} SAR</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Triple Room</p>
                        <p className="text-muted-foreground">Provider: {offering.priceTp} SAR</p>
                        <p className="text-secondary font-medium">Final: {offering.finalPriceTp} SAR</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Quad Room</p>
                        <p className="text-muted-foreground">Provider: {offering.priceQd} SAR</p>
                        <p className="text-secondary font-medium">Final: {offering.finalPriceQd} SAR</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Quint Room</p>
                        <p className="text-muted-foreground">Provider: {offering.priceQt} SAR</p>
                        <p className="text-secondary font-medium">Final: {offering.finalPriceQt} SAR</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Label htmlFor={`margin-${offering.id}`} className="text-sm">
                        Update Margin:
                      </Label>
                      <Input
                        id={`margin-${offering.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={offering.adminMargin.toString()}
                        value={marginEdits[offering.id] || ''}
                        onChange={(e) => setMarginEdits(prev => ({ 
                          ...prev, 
                          [offering.id]: e.target.value 
                        }))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">SAR</span>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleMarginUpdate(offering.id)}
                        disabled={!marginEdits[offering.id] || offering.status === 'CONFIRMED'}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;