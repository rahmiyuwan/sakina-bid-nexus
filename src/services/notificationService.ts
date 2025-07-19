import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_required: boolean;
  related_entity_type?: 'request' | 'bid' | 'commission';
  related_entity_id?: string;
  related_entity_name?: string;
  created_at: string;
  updated_at: string;
}

class NotificationService {
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }

  // Helper function to get all admin and super admin users
  async getAdminUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'super_admin'])
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  // Helper function to get all hotel provider users
  async getHotelProviderUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'hotel_provider')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  // Helper function to get request creator
  async getRequestCreator(requestId: string) {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        travel_workspace_id,
        travel_name
      `)
      .eq('id', requestId)
      .single();

    if (error) throw error;

    // Get the travel agent user from the workspace
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('workspace_id', data.travel_workspace_id)
      .eq('role', 'travel_agent')
      .single();

    if (profileError) throw profileError;
    return { userId: profile.id, travelName: data.travel_name };
  }

  // Notification creation helpers
  async notifyNewUserRegistration(newUserId: string, userEmail: string, userFullName: string) {
    const adminUsers = await this.getAdminUsers();
    
    const notifications = adminUsers.map(admin => ({
      user_id: admin.id,
      title: 'New User Registration',
      message: `A new user has registered: ${userFullName} (${userEmail})`,
      type: 'info' as const,
      is_read: false,
      action_required: true,
      related_entity_type: 'request' as const,
      related_entity_id: newUserId,
      related_entity_name: userFullName
    }));

    for (const notification of notifications) {
      await this.createNotification(notification);
    }
  }

  async notifyNewRequest(requestId: string, requestData: any) {
    const adminUsers = await this.getAdminUsers();
    
    const notifications = adminUsers.map(admin => ({
      user_id: admin.id,
      title: 'New Request Submitted',
      message: `New request submitted by ${requestData.travel_name} for ${requestData.city} (${requestData.pax} pax)`,
      type: 'info' as const,
      is_read: false,
      action_required: true,
      related_entity_type: 'request' as const,
      related_entity_id: requestId,
      related_entity_name: `${requestData.travel_name} - ${requestData.city}`
    }));

    for (const notification of notifications) {
      await this.createNotification(notification);
    }
  }

  async notifyNewOffering(offeringData: any, requestData: any) {
    const adminUsers = await this.getAdminUsers();
    const requestCreator = await this.getRequestCreator(offeringData.request_id);
    
    // Notify admins
    const adminNotifications = adminUsers.map(admin => ({
      user_id: admin.id,
      title: 'New Offer Submitted',
      message: `New offer submitted by ${offeringData.hotel_name} for request ${requestCreator.travelName}`,
      type: 'info' as const,
      is_read: false,
      action_required: true,
      related_entity_type: 'bid' as const,
      related_entity_id: offeringData.id,
      related_entity_name: `${offeringData.hotel_name} - ${requestCreator.travelName}`
    }));

    // Notify request creator
    const creatorNotification = {
      user_id: requestCreator.userId,
      title: 'New Offer Received',
      message: `You received a new offer from ${offeringData.hotel_name} for your request`,
      type: 'success' as const,
      is_read: false,
      action_required: true,
      related_entity_type: 'bid' as const,
      related_entity_id: offeringData.id,
      related_entity_name: `${offeringData.hotel_name} - ${requestCreator.travelName}`
    };

    for (const notification of adminNotifications) {
      await this.createNotification(notification);
    }
    await this.createNotification(creatorNotification);
  }

  async notifyRequestConfirmation(requestId: string, confirmedOfferingId: string, offerings: any[]) {
    const adminUsers = await this.getAdminUsers();
    const hotelProviders = await this.getHotelProviderUsers();
    const requestCreator = await this.getRequestCreator(requestId);
    
    const confirmedOffering = offerings.find(o => o.id === confirmedOfferingId);
    const rejectedOfferings = offerings.filter(o => o.id !== confirmedOfferingId);

    // Notify admins
    const adminNotifications = adminUsers.map(admin => ({
      user_id: admin.id,
      title: 'Request Confirmed',
      message: `Request ${requestCreator.travelName} has been confirmed with ${confirmedOffering?.hotel_name}`,
      type: 'success' as const,
      is_read: false,
      action_required: false,
      related_entity_type: 'commission' as const,
      related_entity_id: requestId,
      related_entity_name: `${requestCreator.travelName} - ${confirmedOffering?.hotel_name}`
    }));

    // Notify confirmed provider
    if (confirmedOffering) {
      const confirmedProviderNotification = {
        user_id: confirmedOffering.provider_user_id,
        title: 'Congratulations! Your Offer Accepted',
        message: `Your offer for ${requestCreator.travelName} has been confirmed!`,
        type: 'success' as const,
        is_read: false,
        action_required: false,
        related_entity_type: 'commission' as const,
        related_entity_id: requestId,
        related_entity_name: `${requestCreator.travelName} - ${confirmedOffering.hotel_name}`
      };
      await this.createNotification(confirmedProviderNotification);
    }

    // Notify rejected providers
    for (const rejectedOffering of rejectedOfferings) {
      const rejectedProviderNotification = {
        user_id: rejectedOffering.provider_user_id,
        title: 'Offer Not Selected',
        message: `Your offer for ${requestCreator.travelName} was not selected this time. Better luck next time!`,
        type: 'info' as const,
        is_read: false,
        action_required: false,
        related_entity_type: 'bid' as const,
        related_entity_id: rejectedOffering.id,
        related_entity_name: `${requestCreator.travelName} - ${rejectedOffering.hotel_name}`
      };
      await this.createNotification(rejectedProviderNotification);
    }

    // Send admin notifications
    for (const notification of adminNotifications) {
      await this.createNotification(notification);
    }
  }

  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const notificationService = new NotificationService();