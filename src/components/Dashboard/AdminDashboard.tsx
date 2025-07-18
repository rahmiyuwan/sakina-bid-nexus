import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Building2, DollarSign, Settings, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { settingService } from '@/services/settingService';

const AdminDashboard: React.FC = () => {
  const { requests, offerings, updateOfferingMargin } = useApp();
  const [marginEdits, setMarginEdits] = useState<{[key: string]: string}>({});
  const [defaultMargin, setDefaultMargin] = useState<number>(10);

  useEffect(() => {
    const loadDefaultMargin = async () => {
      try {
        const setting = await settingService.getByKey('default_margin');
        if (setting && setting.value) {
          setDefaultMargin(parseFloat(setting.value));
        }
      } catch (error) {
        console.error('Error loading default margin:', error);
      }
    };
    loadDefaultMargin();
  }, []);

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(req => req.status === 'Submitted').length;
  const confirmedRequests = requests.filter(req => req.status === 'Confirmed').length;
  const totalOfferings = offerings.length;
  const confirmedOfferings = offerings.filter(offer => offer.status === 'CONFIRMED');
  
  const totalRevenue = confirmedOfferings.reduce((total, offer) => {
    const request = requests.find(req => req.id === offer.request_id);
    if (!request) return total;
    
    const checkInDate = new Date(request.checkIn);
    const checkOutDate = new Date(request.checkOut);
    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const adminRevenue = 
      (offer.admin_margin * request.roomDb * totalNights) +
      (offer.admin_margin * request.roomTp * totalNights) +
      (offer.admin_margin * request.roomQd * totalNights) +
      (offer.admin_margin * request.roomQt * totalNights);
    
    return total + adminRevenue;
  }, 0);

  const totalTransactionValue = confirmedOfferings.reduce((total, offer) => {
    const request = requests.find(req => req.id === offer.request_id);
    if (!request) return total;
    
    const checkInDate = new Date(request.checkIn);
    const checkOutDate = new Date(request.checkOut);
    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const transactionValue = 
      (offer.final_price_double * request.roomDb * totalNights) +
      (offer.final_price_triple * request.roomTp * totalNights) +
      (offer.final_price_quad * request.roomQd * totalNights) +
      (offer.final_price_quint * request.roomQt * totalNights);
    
    return total + transactionValue;
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Quoted': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestMarginUpdate = (requestId: string) => {
    const newMargin = parseFloat(marginEdits[requestId]);
    if (!isNaN(newMargin) && newMargin >= 0) {
      // Update margin for all offerings of this request
      const requestOfferings = offerings.filter(offer => offer.request_id === requestId);
      requestOfferings.forEach(offering => {
        updateOfferingMargin(offering.id, newMargin);
      });
      setMarginEdits(prev => ({ ...prev, [requestId]: '' }));
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
                const request = getRequestForOffering(offering.request_id);
                return (
                  <div key={offering.id} className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{offering.hotel_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {request?.travelName}
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

      {/* Request Margin Management */}
      <Card className="border-2 border-secondary/20 shadow-gold">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Request Margin Management</span>
          </CardTitle>
          <CardDescription>
            Manage admin margins for submitted requests. Changes will update all offerings for the request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(() => {
              const submittedRequests = requests.filter(req => req.status === 'Submitted');
              if (submittedRequests.length === 0) {
                return <p className="text-muted-foreground text-center py-8">No submitted requests to manage</p>;
              }
              
              return submittedRequests.map((request) => {
                const requestOfferings = offerings.filter(offer => offer.request_id === request.id);
                const currentMargin = requestOfferings.length > 0 ? requestOfferings[0].admin_margin : defaultMargin;
                const hasOfferings = requestOfferings.length > 0;
                
                return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{request.travelName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.city} • {request.paxCount} PAX • Check-in: {request.checkIn}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${getStatusColor(request.status)}`}>
                            {request.status}
                          </Badge>
                          <Badge variant="outline">
                            {requestOfferings.length} Offerings
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Current Margin: {currentMargin} SAR</p>
                        <p className="text-xs text-muted-foreground">Per room per night</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium">Double Rooms</p>
                        <p className="text-muted-foreground">Required: {request.roomDb}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Triple Rooms</p>
                        <p className="text-muted-foreground">Required: {request.roomTp}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Quad Rooms</p>
                        <p className="text-muted-foreground">Required: {request.roomQd}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Quint Rooms</p>
                        <p className="text-muted-foreground">Required: {request.roomQt}</p>
                      </div>
                    </div>

                    {requestOfferings.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Available Offerings:</p>
                        <div className="space-y-1">
                          {requestOfferings.map((offering) => (
                            <p key={offering.id} className="text-xs text-muted-foreground">
                              • {offering.hotel_name} - Status: {offering.status}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Label htmlFor={`margin-${request.id}`} className="text-sm">
                        Change Margin:
                      </Label>
                      <Input
                        id={`margin-${request.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={currentMargin.toString()}
                        value={marginEdits[request.id] || ''}
                        onChange={(e) => setMarginEdits(prev => ({ 
                          ...prev, 
                          [request.id]: e.target.value 
                        }))}
                        className="w-24"
                        disabled={hasOfferings}
                      />
                      <span className="text-sm text-muted-foreground">SAR</span>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleRequestMarginUpdate(request.id)}
                        disabled={!marginEdits[request.id] || hasOfferings}
                        title={hasOfferings ? "Cannot change margin when offers exist" : ""}
                      >
                        Change Margin
                      </Button>
                    </div>
                    {hasOfferings && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Cannot change margin - offers already exist for this request
                      </p>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;