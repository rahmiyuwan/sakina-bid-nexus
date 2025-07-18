import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { hotelService } from '@/services/hotelService';
import type { Hotel, CreateHotel, UpdateHotel, CityType } from '@/types/database';

const HotelManagement: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<CreateHotel>({
    name: '',
    city: 'Makkah',
    address: '',
    rating: 1,
    facilities: '',
    distance_to_haram: 0,
    description: ''
  });
  const { toast } = useToast();

  const cities: CityType[] = ['Makkah', 'Madinah'];
  const ratings = [1, 2, 3, 4, 5];

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const data = await hotelService.getAll();
      setHotels(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load hotels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHotel) {
        await hotelService.update(editingHotel.id, formData);
        toast({
          title: "Success",
          description: "Hotel updated successfully"
        });
      } else {
        await hotelService.create(formData);
        toast({
          title: "Success",
          description: "Hotel created successfully"
        });
      }
      setDialogOpen(false);
      setEditingHotel(null);
      resetForm();
      loadHotels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save hotel",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      city: hotel.city,
      address: hotel.address || '',
      rating: hotel.rating || 1,
      facilities: hotel.facilities || '',
      distance_to_haram: hotel.distance_to_haram || 0,
      description: hotel.description || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    
    try {
      await hotelService.delete(id);
      toast({
        title: "Success",
        description: "Hotel deleted successfully"
      });
      loadHotels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete hotel",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: 'Makkah',
      address: '',
      rating: 1,
      facilities: '',
      distance_to_haram: 0,
      description: ''
    });
    setEditingHotel(null);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div>Loading hotels...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hotel Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHotel ? 'Edit Hotel' : 'Create Hotel'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Hotel Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
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
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating (1-5 stars)</Label>
                <Select value={formData.rating?.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ratings.map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating > 1 ? 's' : ''} - {renderStars(rating)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="distance_to_haram">Distance to Haram (meters)</Label>
                <Input
                  id="distance_to_haram"
                  type="number"
                  value={formData.distance_to_haram}
                  onChange={(e) => setFormData({ ...formData, distance_to_haram: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="facilities">Facilities</Label>
                <Textarea
                  id="facilities"
                  value={formData.facilities as string || ''}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="WiFi, AC, Restaurant, Pool, Gym"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingHotel ? 'Update' : 'Create'} Hotel
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead>Distance to Haram</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell>{hotel.name}</TableCell>
                  <TableCell>{hotel.city}</TableCell>
                  <TableCell>
                    {hotel.rating ? (
                      <span className="text-yellow-500">
                        {renderStars(hotel.rating)} ({hotel.rating})
                      </span>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {hotel.facilities || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {hotel.distance_to_haram ? `${hotel.distance_to_haram}m` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(hotel)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(hotel.id)}
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

export default HotelManagement;