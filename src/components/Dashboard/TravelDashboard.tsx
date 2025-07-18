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
  const pendingRequests = userRequests.filter(req => req.status === 'Submitted');
  const confirmedRequests = userRequests.filter(req => req.status === 'Confirmed');

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
      status: 'Submitted',
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
    return offerings.filter(offer => offer.request_id === requestId);
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

    </div>
  );
};

export default TravelDashboard;