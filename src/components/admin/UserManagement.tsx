import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { userService } from '@/services/userService';
import type { Workspace } from '@/types/database';

type UserRole = 'travel_agent' | 'hotel_provider' | 'admin' | 'super_admin';

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  workspace_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  workspace?: Workspace;
};

type CreateProfile = {
  username: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  workspace_id: string | null;
  is_active: boolean;
};

const UserManagement: React.FC = () => {
  const { users, workspaces, refreshUsers, refreshWorkspaces } = useApp();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<CreateProfile>({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'travel_agent',
    workspace_id: null,
    is_active: true
  });
  const { toast } = useToast();

  const userRoles: UserRole[] = ['travel_agent', 'hotel_provider', 'admin', 'super_admin'];

  useEffect(() => {
    refreshUsers();
    refreshWorkspaces();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        workspace_id: formData.workspace_id || null
      };

      if (editingUser) {
        await userService.update(editingUser.id, userData);
        toast({
          title: "Success",
          description: "User updated successfully"
        });
      } else {
        await userService.create(userData);
        toast({
          title: "Success",
          description: "User created successfully"
        });
      }
      setDialogOpen(false);
      setEditingUser(null);
      resetForm();
      refreshUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      role: user.role,
      workspace_id: user.workspace_id,
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      is_active: user.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userService.delete(id);
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
      refreshUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'travel_agent',
      workspace_id: null,
      is_active: true
    });
    setEditingUser(null);
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      travel_agent: 'bg-blue-100 text-blue-800',
      hotel_provider: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
      super_admin: 'bg-red-100 text-red-800'
    };
    return colors[role];
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Create User'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workspace">Workspace (optional for admin/super_admin)</Label>
                <Select value={formData.workspace_id || undefined} onValueChange={(value) => setFormData({ ...formData, workspace_id: value || null })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workspace (optional)" />
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingUser ? 'Update' : 'Create'} User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{user.workspace_id ? 'Yes' : 'None'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
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

export default UserManagement;