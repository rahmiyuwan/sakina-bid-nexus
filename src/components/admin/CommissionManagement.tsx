import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { commissionService } from '@/services/commissionService';
import { offeringService } from '@/services/offeringService';
import type { HotelOffering, HotelRequest } from '@/types/index';

const CommissionManagement: React.FC = () => {
  const { requests, workspaces } = useApp();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [offerings, setOfferings] = useState<HotelOffering[]>([]);
  const [editingMargin, setEditingMargin] = useState<{requestId: string, margin: number} | null>(null);
  const [marginValue, setMarginValue] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const data = await offeringService.getAll();
      setOfferings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load offerings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleEditMargin = (requestId: string, currentMargin: number) => {
    setEditingMargin({ requestId, margin: currentMargin });
    setMarginValue(currentMargin);
    setDialogOpen(true);
  };

  const handleSaveMargin = async () => {
    if (!editingMargin) return;
    
    try {
      // Update all offerings for this request with the new margin
      const requestOfferings = offerings.filter(o => o.request_id === editingMargin.requestId);
      
      for (const offering of requestOfferings) {
        await offeringService.update(offering.id, { admin_margin: marginValue });
      }
      
      toast({
        title: "Success",
        description: "Margin updated successfully"
      });
      
      setDialogOpen(false);
      setEditingMargin(null);
      loadOfferings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update margin",
        variant: "destructive"
      });
    }
  };

  const calculateCommissionData = () => {
    const commissionData: any[] = [];
    
    // Group offerings by request
    const offeringsByRequest = offerings.reduce((acc, offering) => {
      if (!acc[offering.request_id]) {
        acc[offering.request_id] = [];
      }
      acc[offering.request_id].push(offering);
      return acc;
    }, {} as Record<string, HotelOffering[]>);

    Object.entries(offeringsByRequest).forEach(([requestId, requestOfferings]) => {
      const request = requests.find(r => r.id === requestId);
      
      // Only show confirmed requests with confirmed offers
      if (!request || request.status !== 'Confirmed' || requestOfferings.length === 0) return;
      
      // Filter only confirmed offerings
      const confirmedOfferings = requestOfferings.filter(offering => offering.status === 'CONFIRMED');
      if (confirmedOfferings.length === 0) return;

      const workspace = workspaces.find(w => w.id === request.travelUserId); // HotelRequest uses travelUserId

      // Calculate totals for each confirmed offering in this request
      confirmedOfferings.forEach(offering => {
        const margin = offering.admin_margin || 0;
        
        // Calculate offer (total of required rooms * price)
        const offerTotal = 
          (request.roomDb * (offering.price_double || 0)) +
          (request.roomTp * (offering.price_triple || 0)) +
          (request.roomQd * (offering.price_quad || 0)) +
          (request.roomQt * (offering.price_quint || 0));
        
        // Calculate final (total of required rooms * (price + margin))
        const finalTotal = 
          (request.roomDb * ((offering.price_double || 0) + margin)) +
          (request.roomTp * ((offering.price_triple || 0) + margin)) +
          (request.roomQd * ((offering.price_quad || 0) + margin)) +
          (request.roomQt * ((offering.price_quint || 0) + margin));
        
        // Commission is final - offer
        const totalCommission = finalTotal - offerTotal;

        // For request number, we'll use the id's last part since HotelRequest doesn't have request_number
        const requestNumber = request.id.slice(-6);

        commissionData.push({
          requestNumber,
          workspace: workspace?.name || 'Unknown',
          pax: request.paxCount,
          offer: offerTotal,
          final: finalTotal,
          totalCommission,
          requestId: request.id,
          margin,
          hotelName: offering.hotel_name
        });
      });
    });

    return commissionData;
  };

  if (loading) {
    return <div>Loading commissions...</div>;
  }

  const commissionData = calculateCommissionData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Commission Management</h2>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Margin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="margin">Margin per Room (SAR)</Label>
              <div className="flex">
                <Input
                  id="margin"
                  type="number"
                  step="0.01"
                  value={marginValue}
                  onChange={(e) => setMarginValue(parseFloat(e.target.value) || 0)}
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm">
                  SAR
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveMargin} className="flex-1">
                Save Margin
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Commission Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Number</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Pax</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Offer (SAR)</TableHead>
                <TableHead>Final (SAR)</TableHead>
                <TableHead>Total Commission (SAR)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>#{item.requestNumber}</TableCell>
                  <TableCell>{item.workspace}</TableCell>
                  <TableCell>{item.pax}</TableCell>
                  <TableCell>{item.hotelName}</TableCell>
                  <TableCell>{item.offer.toFixed(2)}</TableCell>
                  <TableCell>{item.final.toFixed(2)}</TableCell>
                  <TableCell>{item.totalCommission.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMargin(item.requestId, item.margin)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
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