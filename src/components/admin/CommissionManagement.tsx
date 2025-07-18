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
import { commissionService } from '@/services/commissionService';
import { requestService } from '@/services/requestService';
import { userService } from '@/services/userService';
import type { Commission, CreateCommission, UpdateCommission, Request, User } from '@/types/database';

const CommissionManagement: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState<CreateCommission>({
    request_id: '',
    admin_id: '',
    commission_double: 0,
    commission_triple: 0,
    commission_quad: 0,
    commission_quint: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCommissions();
    loadRequests();
    loadAdmins();
  }, []);

  const loadCommissions = async () => {
    try {
      const data = await commissionService.getAll();
      setCommissions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load commissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await requestService.getAll();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await userService.getAll();
      setAdmins(data.filter(u => u.role === 'admin' || u.role === 'super_admin') as any);
    } catch (error) {
      console.error('Failed to load admins:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCommission) {
        await commissionService.update(editingCommission.id, formData);
        toast({
          title: "Success",
          description: "Commission updated successfully"
        });
      } else {
        await commissionService.create(formData);
        toast({
          title: "Success",
          description: "Commission created successfully"
        });
      }
      setDialogOpen(false);
      setEditingCommission(null);
      resetForm();
      loadCommissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save commission",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setFormData({
      request_id: commission.request_id,
      admin_id: commission.admin_id,
      commission_double: commission.commission_double || 0,
      commission_triple: commission.commission_triple || 0,
      commission_quad: commission.commission_quad || 0,
      commission_quint: commission.commission_quint || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commission?')) return;
    
    try {
      await commissionService.delete(id);
      toast({
        title: "Success",
        description: "Commission deleted successfully"
      });
      loadCommissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete commission",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      request_id: '',
      admin_id: '',
      commission_double: 0,
      commission_triple: 0,
      commission_quad: 0,
      commission_quint: 0
    });
    setEditingCommission(null);
  };

  if (loading) {
    return <div>Loading commissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Commission Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Commission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCommission ? 'Edit Commission' : 'Create Commission'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="request_id">Request</Label>
                <Select value={formData.request_id} onValueChange={(value) => setFormData({ ...formData, request_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request" />
                  </SelectTrigger>
                  <SelectContent>
                    {requests.map((request) => (
                      <SelectItem key={request.id} value={request.id}>
                        #{request.request_number} - {request.travel_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin_id">Admin</Label>
                <Select value={formData.admin_id} onValueChange={(value) => setFormData({ ...formData, admin_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.full_name} ({admin.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commission_double">Double Room Commission</Label>
                  <Input
                    id="commission_double"
                    type="number"
                    step="0.01"
                    value={formData.commission_double}
                    onChange={(e) => setFormData({ ...formData, commission_double: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="commission_triple">Triple Room Commission</Label>
                  <Input
                    id="commission_triple"
                    type="number"
                    step="0.01"
                    value={formData.commission_triple}
                    onChange={(e) => setFormData({ ...formData, commission_triple: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commission_quad">Quad Room Commission</Label>
                  <Input
                    id="commission_quad"
                    type="number"
                    step="0.01"
                    value={formData.commission_quad}
                    onChange={(e) => setFormData({ ...formData, commission_quad: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="commission_quint">Quint Room Commission</Label>
                  <Input
                    id="commission_quint"
                    type="number"
                    step="0.01"
                    value={formData.commission_quint}
                    onChange={(e) => setFormData({ ...formData, commission_quint: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingCommission ? 'Update' : 'Create'} Commission
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Double</TableHead>
                <TableHead>Triple</TableHead>
                <TableHead>Quad</TableHead>
                <TableHead>Quint</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    #{(commission.request as any)?.request_number} - {(commission.request as any)?.travel_name}
                  </TableCell>
                  <TableCell>
                    {(commission.admin as any)?.full_name}
                  </TableCell>
                  <TableCell>${commission.commission_double?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>${commission.commission_triple?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>${commission.commission_quad?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>${commission.commission_quint?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    {new Date(commission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(commission)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(commission.id)}
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

export default CommissionManagement;