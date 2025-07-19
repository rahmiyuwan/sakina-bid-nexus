import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageLoadingSpinner } from '@/components/Common/LoadingStates';
import { NotificationModal } from '@/components/Common/NotificationModal';
import { useApp } from '@/contexts/AppContext';
import { notificationService, type Notification } from '@/services/notificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCheck, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Notifications: React.FC = () => {
  const { currentUser, notifications, refreshNotifications } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      setLoading(false); // AppContext handles loading
    }
  }, [currentUser?.id]);


  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Refresh notifications from AppContext
      await refreshNotifications();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.id) return;
    
    try {
      await notificationService.markAllAsRead(currentUser.id);
      // Refresh notifications from AppContext
      await refreshNotifications();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      // Refresh notifications from AppContext
      await refreshNotifications();
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const openNotificationModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <MainLayout>
        <PageLoadingSpinner message="Loading notifications..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activities
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-center">
                You're all caught up! New notifications will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.is_read ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => openNotificationModal(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl mt-1">
                        {getTypeIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {notification.title}
                          </h3>
                          <Badge variant={getTypeBadgeVariant(notification.type)}>
                            {notification.type}
                          </Badge>
                          {!notification.is_read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(notification.created_at), 'MMM d, yyyy • h:mm a')}
                          </span>
                          
                          {notification.related_entity_name && (
                            <span className="flex items-center gap-1">
                              Related: {notification.related_entity_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          notification={selectedNotification ? {
            id: selectedNotification.id,
            title: selectedNotification.title,
            message: selectedNotification.message,
            type: selectedNotification.type,
            timestamp: selectedNotification.created_at,
            isRead: selectedNotification.is_read,
            actionRequired: selectedNotification.action_required,
            relatedEntity: selectedNotification.related_entity_type && selectedNotification.related_entity_id ? {
              type: selectedNotification.related_entity_type,
              id: selectedNotification.related_entity_id,
              name: selectedNotification.related_entity_name || ''
            } : undefined
          } : undefined}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
    </MainLayout>
  );
};

export default Notifications;