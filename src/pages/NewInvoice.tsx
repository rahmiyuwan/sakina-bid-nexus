import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { HotelRequest } from '@/types';
import { Download, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { generateInvoicePDF } from '@/services/invoiceService';
import { useToast } from '@/hooks/use-toast';

const NewInvoice = () => {
  const navigate = useNavigate();
  const { currentProfile, requests, workspaces, offerings, refreshRequests } = useApp();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [confirmedRequests, setConfirmedRequests] = useState<HotelRequest[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Only allow admin and super_admin access
  if (!currentProfile || !['admin', 'super_admin'].includes(currentProfile.role)) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="text-center p-8">
              <p className="text-muted-foreground">Access denied. This page is only available to administrators.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  useEffect(() => {
    refreshRequests();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      // Filter confirmed requests for the selected workspace
      const filteredRequests = requests.filter(
        request => 
          request.workspace?.id === selectedWorkspace && 
          request.status === 'Confirmed'
      );
      setConfirmedRequests(filteredRequests);
      setSelectedRequests([]);
    } else {
      setConfirmedRequests([]);
      setSelectedRequests([]);
    }
  }, [selectedWorkspace, requests]);

  const handleRequestSelection = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  const toggleCardExpansion = (requestId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const generateInvoice = async () => {
    if (selectedRequests.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one request for the invoice.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const selectedRequestsData = confirmedRequests.filter(req => 
        selectedRequests.includes(req.id)
      );
      
      const selectedWorkspaceData = workspaces.find(ws => ws.id === selectedWorkspace);
      
      if (!selectedWorkspaceData) {
        throw new Error('Selected workspace not found');
      }

      const savedInvoice = await generateInvoicePDF({
        requests: selectedRequestsData,
        workspace: selectedWorkspaceData,
        adminProfile: currentProfile,
        offerings
      });

      toast({
        title: "Success",
        description: "Invoice generated and downloaded successfully.",
      });

      // Navigate back to invoices list
      navigate('/invoices');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <h1 className="text-2xl font-bold">Create New Invoice</h1>
        </div>

        <div className="space-y-6">
          {/* Workspace Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Travel Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a travel agent workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map(workspace => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Request Selection */}
          {selectedWorkspace && (
            <Card>
              <CardHeader>
                <CardTitle>Select Confirmed Requests</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose one or more confirmed requests with accepted offerings to include in the invoice.
                </p>
              </CardHeader>
              <CardContent>
                {confirmedRequests.length === 0 ? (
                  <p className="text-muted-foreground py-4">
                    No confirmed requests with accepted offerings found for this travel agent.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {confirmedRequests
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map(request => {
                      const acceptedOffering = offerings.find(o => o.request_id === request.id && o.status === 'CONFIRMED');
                      const isExpanded = expandedCards.has(request.id);
                      return (
                        <Card key={request.id} className="overflow-hidden">
                          <Collapsible open={isExpanded} onOpenChange={() => toggleCardExpansion(request.id)}>
                            <div className="flex items-center space-x-3 p-4">
                              <Checkbox
                                id={request.id}
                                checked={selectedRequests.includes(request.id)}
                                onCheckedChange={(checked) => 
                                  handleRequestSelection(request.id, checked as boolean)
                                }
                              />
                              <div className="flex-1">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between cursor-pointer hover:bg-muted/20 -m-2 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                      <div>
                                        <div className="font-semibold text-lg">
                                          Request #{request.id.slice(-6)}
                                        </div>
                                        <div className="font-medium text-foreground">
                                          {request.travelName}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-muted-foreground">
                                        Status: <span className="text-green-600 font-medium">{request.status}</span>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Created: {new Date(request.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent className="mt-2">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Destination:</span> {request.city}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Package:</span> {request.packageType}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Check-in:</span> {request.checkIn}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Check-out:</span> {request.checkOut}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">PAX:</span> {request.paxCount}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Tour Leader:</span> {request.tlName}
                                    </div>
                                  </div>

                                  {acceptedOffering && (
                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                      <div className="font-medium text-sm mb-2">Accepted Offering - {acceptedOffering.hotel_name}</div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        {acceptedOffering.final_price_double > 0 && (
                                          <div>Double: ${acceptedOffering.final_price_double}</div>
                                        )}
                                        {acceptedOffering.final_price_triple > 0 && (
                                          <div>Triple: ${acceptedOffering.final_price_triple}</div>
                                        )}
                                        {acceptedOffering.final_price_quad > 0 && (
                                          <div>Quad: ${acceptedOffering.final_price_quad}</div>
                                        )}
                                        {acceptedOffering.final_price_quint > 0 && (
                                          <div>Quint: ${acceptedOffering.final_price_quint}</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </div>
                            </div>
                          </Collapsible>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          {selectedRequests.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={generateInvoice} 
                  disabled={isGenerating}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isGenerating ? 'Generating Invoice...' : 'Generate & Download Invoice'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NewInvoice;