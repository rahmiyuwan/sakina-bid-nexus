import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const NewRequest: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile, addRequest, workspaces, loading } = useApp();
  const [formLoading, setFormLoading] = useState(false);
  
  // Don't render if still loading
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Get workspace description for auto-filling travel name
  const userWorkspace = workspaces.find(w => w.id === currentProfile?.workspace_id);
  
  const [formData, setFormData] = useState({
    travel_name: userWorkspace?.description || '',
    tour_leader: '',
    pax: '',
    city: '',
    package_type: '',
    check_in_date: '',
    check_out_date: '',
    room_double: '0',
    room_triple: '0',
    room_quad: '0',
    room_quint: '0',
    notes: '',
  });

  // Update travel_name when workspace data is loaded
  React.useEffect(() => {
    if (userWorkspace?.description && !formData.travel_name) {
      setFormData(prev => ({
        ...prev,
        travel_name: userWorkspace.description
      }));
    }
  }, [userWorkspace?.description, formData.travel_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile?.workspace_id) {
      toast.error('No workspace found. Please contact your administrator.');
      return;
    }

    setFormLoading(true);
    try {
      const requestData = {
        travelName: formData.travel_name,
        tlName: formData.tour_leader,
        paxCount: parseInt(formData.pax) || 0,
        city: formData.city,
        packageType: formData.package_type,
        checkIn: formData.check_in_date,
        checkOut: formData.check_out_date,
        roomDb: parseInt(formData.room_double) || 0,
        roomTp: parseInt(formData.room_triple) || 0,
        roomQd: parseInt(formData.room_quad) || 0,
        roomQt: parseInt(formData.room_quint) || 0,
        status: 'Submitted' as const,
        travelUserId: currentProfile.workspace_id,
        notes: formData.notes,
      };

      await addRequest(requestData);
      toast.success('Request created successfully!');
      navigate('/requests');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const calculateTotalPax = () => {
    const double = parseInt(formData.room_double) || 0;
    const triple = parseInt(formData.room_triple) || 0;
    const quad = parseInt(formData.room_quad) || 0;
    const quint = parseInt(formData.room_quint) || 0;
    return (double * 2) + (triple * 3) + (quad * 4) + (quint * 5);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/requests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Request</h1>
            <p className="text-muted-foreground">Create a new hotel booking request</p>
          </div>
        </div>

        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Hotel Booking Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="travel_name">Travel Name</Label>
                    <Input
                      id="travel_name"
                      value={formData.travel_name}
                      onChange={(e) => setFormData({ ...formData, travel_name: e.target.value })}
                      placeholder="Enter travel agency name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tour_leader">Tour Leader</Label>
                    <Input
                      id="tour_leader"
                      value={formData.tour_leader}
                      onChange={(e) => setFormData({ ...formData, tour_leader: e.target.value })}
                      placeholder="Enter tour leader name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pax">Total PAX</Label>
                    <Input
                      id="pax"
                      type="number"
                      min="1"
                      value={formData.pax}
                      onChange={(e) => setFormData({ ...formData, pax: e.target.value })}
                      placeholder="Total number of passengers"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Makkah">Makkah</SelectItem>
                        <SelectItem value="Madinah">Madinah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Package and Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Package Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="package_type">Package Type</Label>
                    <Select value={formData.package_type} onValueChange={(value) => setFormData({ ...formData, package_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select package type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROMO">PROMO</SelectItem>
                        <SelectItem value="REGULAR">REGULAR</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="check_in_date">Check-in Date</Label>
                    <Input
                      id="check_in_date"
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="check_out_date">Check-out Date</Label>
                    <Input
                      id="check_out_date"
                      type="date"
                      value={formData.check_out_date}
                      onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Room Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Room Requirements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="room_double">Double Rooms</Label>
                    <Input
                      id="room_double"
                      type="number"
                      min="0"
                      value={formData.room_double}
                      onChange={(e) => setFormData({ ...formData, room_double: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room_triple">Triple Rooms</Label>
                    <Input
                      id="room_triple"
                      type="number"
                      min="0"
                      value={formData.room_triple}
                      onChange={(e) => setFormData({ ...formData, room_triple: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room_quad">Quad Rooms</Label>
                    <Input
                      id="room_quad"
                      type="number"
                      min="0"
                      value={formData.room_quad}
                      onChange={(e) => setFormData({ ...formData, room_quad: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room_quint">Quint Rooms</Label>
                    <Input
                      id="room_quint"
                      type="number"
                      min="0"
                      value={formData.room_quint}
                      onChange={(e) => setFormData({ ...formData, room_quint: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Calculated room capacity: {calculateTotalPax()} PAX
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Notes</h3>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any special requirements, preferences, or additional information..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => navigate('/requests')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewRequest;