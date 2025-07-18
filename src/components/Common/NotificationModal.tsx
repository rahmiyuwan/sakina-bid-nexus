import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Check } from 'lucide-react';

interface NotificationDetails {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
  relatedEntity?: {
    type: 'request' | 'bid' | 'commission';
    id: string;
    name: string;
  };
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification?: NotificationDetails;
  onMarkAsRead?: (id: string) => void;
  onTakeAction?: (notificationId: string, entityType: string, entityId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notification,
  onMarkAsRead,
  onTakeAction,
}) => {
  if (!notification) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <Bell className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleTakeAction = () => {
    if (notification.relatedEntity && onTakeAction) {
      onTakeAction(
        notification.id, 
        notification.relatedEntity.type, 
        notification.relatedEntity.id
      );
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">{notification.title}</DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                  {notification.type.toUpperCase()}
                </Badge>
                {!notification.isRead && (
                  <Badge variant="outline" className="text-xs">
                    UNREAD
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription className="text-base">
            {notification.message}
          </DialogDescription>

          {notification.relatedEntity && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Related {notification.relatedEntity.type}:
              </p>
              <p className="text-sm font-medium">
                {notification.relatedEntity.name}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {formatTimestamp(notification.timestamp)}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
          {notification.actionRequired && notification.relatedEntity && (
            <Button onClick={handleTakeAction} className="w-full sm:w-auto">
              View {notification.relatedEntity.type}
            </Button>
          )}
          
          <div className="flex space-x-2 w-full sm:w-auto">
            {!notification.isRead && onMarkAsRead && (
              <Button variant="outline" onClick={handleMarkAsRead} className="flex-1 sm:flex-initial">
                Mark as Read
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-initial">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};