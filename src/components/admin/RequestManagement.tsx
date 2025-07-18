import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestService } from '@/services/requestService';
import { workspaceService } from '@/services/workspaceService';
import type { Request, CreateRequest, UpdateRequest, Workspace, CityType, PackageType, RequestStatus } from '@/types/database';

const RequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [formData, setFormData] = useState<CreateRequest>({
    travel_workspace_id: '',
    travel_name: '',
    pax: 0,
    tour_leader: '',
    city: 'Makkah',
    package_type: 'REGULAR',
    check_in_date: '',
    check_out_date: '',
    room_double: 0,
    room_triple: 0,
    room_quad: 0,
    room_quint: 0,
    status: 'Submitted',
    bidding_deadline: ''
  });
  const { toast } = useToast();

  const cities: CityType[] = ['Makkah', 'Madinah'];
  const packageTypes: PackageType[] = ['PROMO', 'VIP', 'REGULAR'];
  const statuses: RequestStatus[] = ['Submitted', 'Quoted', 'Confirmed'];

  useEffect(() => {
    loadRequests();
    loadWorkspaces();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await requestService.getAll();
      setRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    try {
      const data = await workspaceService.getAll();
      setWorkspaces(data.filter(w => w.is_active));
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRequest) {
        await requestService.update(editingRequest.id, formData);
        toast({
          title: "Success",
          description: "Request updated successfully"
        });
      } else {
        await requestService.create(formData);
        toast({
          title: "Success",
          description: "Request created successfully"
        });
      }
      setDialogOpen(false);
      setEditingRequest(null);
      resetForm();
      loadRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save request",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (request: Request) => {
    setEditingRequest(request);
    setFormData({
      travel_workspace_id: request.travel_workspace_id,
      travel_name: request.travel_name,
      pax: request.pax,
      tour_leader: request.tour_leader,
      city: request.city,
      package_type: request.package_type,
      check_in_date: request.check_in_date,
      check_out_date: request.check_out_date,
      room_double: request.room_double,
      room_triple: request.room_triple,
      room_quad: request.room_quad,
      room_quint: request.room_quint,
      status: request.status,
      bidding_deadline: request.bidding_deadline.split('T')[0] // Convert to date format
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
      await requestService.delete(id);
      toast({
        title: "Success",
        description: "Request deleted successfully"
      });
      loadRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      travel_workspace_id: '',
      travel_name: '',
      pax: 0,
      tour_leader: '',
      city: 'Makkah',
      package_type: 'REGULAR',
      check_in_date: '',
      check_out_date: '',
      room_double: 0,
      room_triple: 0,
      room_quad: 0,
      room_quint: 0,
      status: 'Submitted',
      bidding_deadline: ''
    });
    setEditingRequest(null);
  };

  const getStatusColor = (status: RequestStatus) => {
    const colors = {
      Submitted: 'bg-yellow-100 text-yellow-800',
      Quoted: 'bg-blue-100 text-blue-800',
      Confirmed: 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Request Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRequest ? 'Edit Request' : 'Create Request'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="travel_workspace_id">Travel Workspace</Label>
                  <Select value={formData.travel_workspace_id || undefined} onValueChange={(value) => setFormData({ ...formData, travel_workspace_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="travel_name">Travel Name</Label>
                  <Input
                    id="travel_name"
                    value={formData.travel_name}
                    onChange={(e) => setFormData({ ...formData, travel_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pax">Pax Count</Label>
                  <Input
                    id="pax"
                    type="number"
                    value={formData.pax}
                    onChange={(e) => setFormData({ ...formData, pax: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tour_leader">Tour Leader</Label>
                  <Input
                    id="tour_leader"
                    value={formData.tour_leader}
                    onChange={(e) => setFormData({ ...formData, tour_leader: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Select value={formData.city} onValueChange={(value: CityType) => setFormData({ ...formData, city: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="package_type">Package Type</Label>
                  <Select value={formData.package_type} onValueChange={(value: PackageType) => setFormData({ ...formData, package_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {packageTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: RequestStatus) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="check_in_date">Check In Date</Label>
                  <Input
                    id="check_in_date"
                    type="date"
                    value={formData.check_in_date}
                    onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="check_out_date">Check Out Date</Label>
                  <Input
                    id="check_out_date"
                    type="date"
                    value={formData.check_out_date}
                    onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="room_double">Double Rooms</Label>
                  <Input
                    id="room_double"
                    type="number"
                    value={formData.room_double}
                    onChange={(e) => setFormData({ ...formData, room_double: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="room_triple">Triple Rooms</Label>
                  <Input
                    id="room_triple"
                    type="number"
                    value={formData.room_triple}
                    onChange={(e) => setFormData({ ...formData, room_triple: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="room_quad">Quad Rooms</Label>
                  <Input
                    id="room_quad"
                    type="number"
                    value={formData.room_quad}
                    onChange={(e) => setFormData({ ...formData, room_quad: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="room_quint">Quint Rooms</Label>
                  <Input
                    id="room_quint"
                    type="number"
                    value={formData.room_quint}
                    onChange={(e) => setFormData({ ...formData, room_quint: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bidding_deadline">Bidding Deadline</Label>
                <Input
                  id="bidding_deadline"
                  type="date"
                  value={formData.bidding_deadline}
                  onChange={(e) => setFormData({ ...formData, bidding_deadline: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {editingRequest ? 'Update' : 'Create'} Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Travel Name</TableHead>
                <TableHead>Pax</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>#{request.request_number}</TableCell>
                  <TableCell>{request.travel_name}</TableCell>
                  <TableCell>{request.pax}</TableCell>
                  <TableCell>{request.city}</TableCell>
                  <TableCell>{request.package_type}</TableCell>
                  <TableCell>{new Date(request.check_in_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(request)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(request.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestManagement;