import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BidDetails {
  id: string;
  hotelName: string;
  totalAmount: number;
  roomBreakdown: {
    double?: { count: number; price: number };
    triple?: { count: number; price: number };
    quad?: { count: number; price: number };
    quint?: { count: number; price: number };
  };
}

interface AcceptBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bidDetails?: BidDetails;
  loading?: boolean;
}

export const AcceptBidModal: React.FC<AcceptBidModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bidDetails,
  loading = false,
}) => {
  if (!bidDetails) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <AlertDialogTitle>Accept Bid</AlertDialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {bidDetails.hotelName}
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <AlertDialogDescription>
            Are you sure you want to accept this bid? This action will confirm the booking and reject all other bids for this request.
          </AlertDialogDescription>

          {/* Bid Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Amount</span>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-lg font-bold">{formatCurrency(bidDetails.totalAmount)}</span>
              </div>
            </div>

            {/* Room Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Room Breakdown:</p>
              {Object.entries(bidDetails.roomBreakdown).map(([type, details]) => {
                if (!details || details.count === 0) return null;
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {details.count}x {type} Room{details.count > 1 ? 's' : ''}
                    </span>
                    <Badge variant="outline">
                      {formatCurrency(details.price)} each
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Confirming...' : 'Accept Bid'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};