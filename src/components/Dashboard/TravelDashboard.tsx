import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Plus, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { HotelRequest } from '@/types';
import { useToast } from '@/hooks/use-toast';

const TravelDashboard: React.FC = () => {
  const { currentUser, requests, offerings, addRequest, confirmOffering } = useApp();
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    travelName: '',
    tlName: '',
    paxCount: '',
    city: '',
    packageType: '',
    checkIn: '',
    checkOut: '',
    roomDb: '',
    roomTp: '',
    roomQd: '',
    roomQt: '',
  });

  const userRequests = requests.filter(req => req.travelUserId === currentUser?.id);
  const pendingRequests = userRequests.filter(req => req.status === 'PENDING');
  const confirmedRequests = userRequests.filter(req => req.status === 'CONFIRMED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newRequest: Omit<HotelRequest, 'id' | 'createdAt'> = {
      travelName: formData.travelName,
      tlName: formData.tlName,
      paxCount: parseInt(formData.paxCount),
      city: formData.city,
      packageType: formData.packageType,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      roomDb: parseInt(formData.roomDb) || 0,
      roomTp: parseInt(formData.roomTp) || 0,
      roomQd: parseInt(formData.roomQd) || 0,
      roomQt: parseInt(formData.roomQt) || 0,
      status: 'PENDING',
      travelUserId: currentUser.id,
    };

    addRequest(newRequest);
    setFormData({
      travelName: '',
      tlName: '',
      paxCount: '',
      city: '',
      packageType: '',
      checkIn: '',
      checkOut: '',
      roomDb: '',
      roomTp: '',
      roomQd: '',
      roomQt: '',
    });
    setShowRequestForm(false);
    
    toast({
      title: "Request Submitted",
      description: "Your hotel request has been submitted successfully.",
    });
  };

  const handleConfirmOffering = (offeringId: string, requestId: string, hotelName: string) => {
    confirmOffering(offeringId, requestId);
    toast({
      title: "Booking Confirmed",
      description: `Your booking with ${hotelName} has been confirmed. All other offers have been canceled.`,
    });
  };

  const getRequestOfferings = (requestId: string) => {
    return offerings.filter(offer => offer.requestId === requestId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Hotel Requests</h2>
        <Button 
          variant="premium" 
          onClick={() => setShowRequestForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </Button>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <Card className="border-2 border-secondary/20 shadow-gold">
          <CardHeader>
            <CardTitle>Submit New Hotel Request</CardTitle>
            <CardDescription>Fill in the details for your hotel booking requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="travelName">Travel Agency Name</Label>
                  <Input 
                    id="travelName" 
                    value={formData.travelName}
                    onChange={(e) => setFormData({...formData, travelName: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="tlName">Team Leader Name</Label>
                  <Input 
                    id="tlName" 
                    value={formData.tlName}
                    onChange={(e) => setFormData({...formData, tlName: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="paxCount">PAX Count</Label>
                  <Input 
                    id="paxCount" 
                    type="number" 
                    value={formData.paxCount}
                    onChange={(e) => setFormData({...formData, paxCount: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="city">Destination City</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="packageType">Package Type</Label>
                  <Input 
                    id="packageType" 
                    value={formData.packageType}
                    onChange={(e) => setFormData({...formData, packageType: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="checkIn">Check-in Date</Label>
                  <Input 
                    id="checkIn" 
                    type="date" 
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out Date</Label>
                  <Input 
                    id="checkOut" 
                    type="date" 
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="roomDb">Double Rooms</Label>
                  <Input 
                    id="roomDb" 
                    type="number" 
                    min="0" 
                    value={formData.roomDb}
                    onChange={(e) => setFormData({...formData, roomDb: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="roomTp">Triple Rooms</Label>
                  <Input 
                    id="roomTp" 
                    type="number" 
                    min="0" 
                    value={formData.roomTp}
                    onChange={(e) => setFormData({...formData, roomTp: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="roomQd">Quad Rooms</Label>
                  <Input 
                    id="roomQd" 
                    type="number" 
                    min="0" 
                    value={formData.roomQd}
                    onChange={(e) => setFormData({...formData, roomQd: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="roomQt">Quint Rooms</Label>
                  <Input 
                    id="roomQt" 
                    type="number" 
                    min="0" 
                    value={formData.roomQt}
                    onChange={(e) => setFormData({...formData, roomQt: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowRequestForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="premium">
                  Submit Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {userRequests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No requests yet. Create your first hotel request!</p>
            </CardContent>
          </Card>
        ) : (
          userRequests.map((request) => {
            const requestOfferings = getRequestOfferings(request.id);
            return (
              <Card key={request.id} className="hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{request.travelName}</span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Team Leader:</strong> {request.tlName}</p>
                      <p><strong>Package:</strong> {request.packageType}</p>
                      <p><strong>Rooms:</strong> {request.roomDb} Double, {request.roomTp} Triple, {request.roomQd} Quad, {request.roomQt} Quint</p>
                    </div>
                    
                    {requestOfferings.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Hotel Offerings ({requestOfferings.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {requestOfferings.map((offering) => (
                            <div key={offering.id} className="border rounded-lg p-4 bg-gradient-card">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{offering.hotelName}</h5>
                                <Badge className={getStatusColor(offering.status)}>
                                  {offering.status}
                                </Badge>
                              </div>
                              <div className="text-sm space-y-1">
                                <p>Double: {offering.finalPriceDb} SAR</p>
                                <p>Triple: {offering.finalPriceTp} SAR</p>
                                <p>Quad: {offering.finalPriceQd} SAR</p>
                                <p>Quint: {offering.finalPriceQt} SAR</p>
                              </div>
                              {offering.status === 'PENDING' && (
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="mt-2 w-full"
                                  onClick={() => handleConfirmOffering(offering.id, request.id, offering.hotelName)}
                                >
                                  Confirm Booking
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TravelDashboard;