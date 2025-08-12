import { AdminNotification } from "@/types/admin";
import { mockDatabase, simulateAPI } from "@/utils/adminUtils";
import { userService } from "./userService";
import { toast } from "sonner";

// Define a type for our internal notification management (extends AdminNotification with tracking fields)
type InternalNotification = Omit<AdminNotification, 'message'> & {
  message: string; // Make message required internally
  // Metadata fields for tracking (not part of the public interface)
  _metadata?: {
    createdAt?: string;
    updatedAt?: string;
    sentAt?: string;
    deliveredTo?: string[];
    readBy?: string[];
    failedDelivery?: string[];
  };
};

// Enhanced delivery types
interface NotificationDelivery {
  id: string;
  notificationId: string;
  userId: string;
  deliveredAt: string;
  readAt?: string;
  method: 'push' | 'in-app' | 'email' | 'sms';
  status: 'pending' | 'delivered' | 'read' | 'failed';
}

interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
}

// Mock storage for deliveries and subscriptions
const deliveryStorage = {
  deliveries: [] as NotificationDelivery[],
  subscriptions: [] as PushSubscription[],
};

// Define internal database type that requires message
type InternalDatabaseNotification = {
  id: string;
  title: string;
  status: string;
  recipients: string;
  date: string;
  message: string; // Required for internal storage
  priority?: string;
  sender?: string;
  scheduledTime?: string;
  _metadata?: {
    createdAt?: string;
    updatedAt?: string;
    sentAt?: string;
    deliveredTo?: string[];
    readBy?: string[];
    failedDelivery?: string[];
  };
};

export const notificationService = {
  getNotifications: async (): Promise<AdminNotification[]> => {
    console.log("Fetching all notifications");
    // Ensure each notification conforms to the AdminNotification interface
    const validNotifications = mockDatabase.notifications.map(n => ensureValidNotification(n as InternalNotification));
    return simulateAPI(validNotifications);
  },

  getNotification: async (id: string): Promise<AdminNotification | null> => {
    console.log(`Fetching notification with ID: ${id}`);
    const notification = mockDatabase.notifications.find(n => n.id === id);
    return simulateAPI(notification || null);
  },

  createNotification: async (data: Partial<AdminNotification>): Promise<AdminNotification> => {
    // Ensure all required fields are present with default values
    const newNotification: InternalNotification = {
      id: `notification-${Date.now()}`,
      title: data.title || "New Notification",
      status: (data.status || "Draft") as "Draft" | "Scheduled" | "Sent" | "Cancelled",
      recipients: data.recipients || "All Visitors",
      date: data.date || new Date().toLocaleDateString(),
      message: data.message || "", // Always provide a default message
      priority: data.priority,
      sender: data.sender,
      scheduledTime: data.scheduledTime,
      _metadata: {
        createdAt: new Date().toISOString()
      }
    };
    
    // Clean the notification before storing it to ensure it matches the AdminNotification type
    const validNotification = ensureValidNotification(newNotification);
    mockDatabase.notifications.push(validNotification as unknown as InternalDatabaseNotification);
    return simulateAPI(validNotification);
  },

  updateNotification: async (id: string, data: Partial<AdminNotification>): Promise<AdminNotification> => {
    const index = mockDatabase.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Notification not found: ${id}`);
    
    // Get existing notification and metadata
    const existingNotification = mockDatabase.notifications[index] as InternalNotification;
    const existingMetadata = existingNotification._metadata || {};
    
    // Ensure all required fields are present with default values
    const updatedNotification: InternalNotification = {
      ...existingNotification,
      ...data,
      // Ensure required fields have values
      title: data.title || existingNotification.title || "Untitled Notification",
      status: (data.status || existingNotification.status || "Draft") as "Draft" | "Scheduled" | "Sent" | "Cancelled",
      recipients: data.recipients || existingNotification.recipients || "All Visitors",
      date: data.date || existingNotification.date || new Date().toLocaleDateString(),
      message: data.message !== undefined ? data.message : (existingNotification.message || ""),
      _metadata: {
        ...existingMetadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    // Clean the notification before storing
    const validNotification = ensureValidNotification(updatedNotification);
    mockDatabase.notifications[index] = validNotification as unknown as InternalDatabaseNotification;
    return simulateAPI(validNotification);
  },

  deleteNotification: async (id: string): Promise<void> => {
    const index = mockDatabase.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Notification not found: ${id}`);
    
    mockDatabase.notifications.splice(index, 1);
    return simulateAPI(undefined);
  },

  // Overloaded method to support both ID-based and object-based patterns
  sendNotification: async (notificationOrId: Partial<AdminNotification> | string): Promise<AdminNotification> => {
    // If we received an ID string, get the notification first
    let notification: Partial<AdminNotification>;
    if (typeof notificationOrId === 'string') {
      const existingNote = mockDatabase.notifications.find(n => n.id === notificationOrId);
      if (!existingNote) throw new Error(`Notification not found: ${notificationOrId}`);
      notification = { 
        ...existingNote,
        status: existingNote.status as "Draft" | "Scheduled" | "Sent" | "Cancelled" 
      };
      console.log("Sending notification by ID:", notificationOrId);
    } else {
      notification = notificationOrId;
      console.log("Sending notification object:", notification);
    }
    
    // Find existing notification if it exists
    let existingNotification: InternalNotification | undefined;
    if (notification.id) {
      existingNotification = mockDatabase.notifications.find(
        n => n.id === notification.id
      ) as InternalNotification | undefined;
    }
    
    // Ensure all required fields are present with default values
    const updatedNotification: InternalNotification = {
      id: notification.id || `notification-${Date.now()}`,
      title: notification.title || existingNotification?.title || "Untitled Notification",
      status: "Sent" as const,
      recipients: notification.recipients || existingNotification?.recipients || "All Visitors",
      date: notification.date || existingNotification?.date || new Date().toLocaleDateString(),
      message: notification.message || existingNotification?.message || "", // Always provide a default message
      priority: notification.priority || existingNotification?.priority,
      sender: notification.sender || existingNotification?.sender,
      scheduledTime: notification.scheduledTime || existingNotification?.scheduledTime,
      _metadata: {
        ...(existingNotification?._metadata || {}),
        sentAt: new Date().toISOString()
      }
    };
    
    // Clean the notification and update in the collection if it exists
    const validNotification = ensureValidNotification(updatedNotification);
    const index = mockDatabase.notifications.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      mockDatabase.notifications[index] = validNotification as unknown as InternalDatabaseNotification;
    } else {
      mockDatabase.notifications.push(validNotification as unknown as InternalDatabaseNotification);
    }
    
    toast.success(`Notification "${notification.title}" sent successfully`);
    return simulateAPI(validNotification);
  },

  // Overloaded method to support both ID-based and object-based patterns
  scheduleNotification: async (notificationOrId: Partial<AdminNotification> | string, scheduledDate: Date | string): Promise<AdminNotification> => {
    // Format date to string if needed
    const formattedDate = scheduledDate instanceof Date 
      ? scheduledDate.toISOString() 
      : scheduledDate;
    
    // If we received an ID string, get the notification first
    let notification: Partial<AdminNotification>;
    if (typeof notificationOrId === 'string') {
      const existingNote = mockDatabase.notifications.find(n => n.id === notificationOrId);
      if (!existingNote) throw new Error(`Notification not found: ${notificationOrId}`);
      notification = { 
        ...existingNote,
        status: existingNote.status as "Draft" | "Scheduled" | "Sent" | "Cancelled" 
      };
      console.log("Scheduling notification by ID:", notificationOrId, "for", formattedDate);
    } else {
      notification = notificationOrId;
      console.log("Scheduling notification object:", notification, "for", formattedDate);
    }
    
    // Find existing notification if it exists
    let existingNotification: InternalNotification | undefined;
    if (notification.id) {
      existingNotification = mockDatabase.notifications.find(
        n => n.id === notification.id
      ) as InternalNotification | undefined;
    }
    
    // Ensure all required fields are present with default values
    const scheduledNotification: InternalNotification = {
      id: notification.id || `notification-${Date.now()}`,
      title: notification.title || existingNotification?.title || "Untitled Notification",
      status: "Scheduled" as const,
      recipients: notification.recipients || existingNotification?.recipients || "All Visitors",
      date: notification.date || existingNotification?.date || new Date().toLocaleDateString(),
      message: notification.message || existingNotification?.message || "", // Always provide a default message
      priority: notification.priority || existingNotification?.priority,
      sender: notification.sender || existingNotification?.sender,
      scheduledTime: formattedDate,
      _metadata: {
        ...(existingNotification?._metadata || {}),
        updatedAt: new Date().toISOString()
      }
    };
    
    // Clean and store the notification
    const validNotification = ensureValidNotification(scheduledNotification);
    const index = mockDatabase.notifications.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      mockDatabase.notifications[index] = validNotification as unknown as InternalDatabaseNotification;
    } else {
      mockDatabase.notifications.push(validNotification as unknown as InternalDatabaseNotification);
    }
    
    toast.success(`Notification "${notification.title}" scheduled for ${formattedDate}`);
    return simulateAPI(validNotification);
  },

  // Enhanced notification delivery methods
  deliverNotification: async (notificationId: string, userId?: string): Promise<boolean> => {
    console.log(`Delivering notification ${notificationId} to user ${userId || 'all users'}`);
    
    try {
      const notification = mockDatabase.notifications.find(n => n.id === notificationId) as InternalDatabaseNotification | undefined;
      if (!notification) {
        throw new Error('Notification not found');
      }

      const currentUser = userService.getCurrentUser();
      const targetUsers = userId ? [userId] : (currentUser ? [currentUser.id] : ['guest']);
      
      // Create delivery records
      const deliveries: NotificationDelivery[] = targetUsers.map(uId => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        notificationId,
        userId: uId,
        deliveredAt: new Date().toISOString(),
        method: 'in-app' as const,
        status: 'delivered' as const,
      }));

      deliveryStorage.deliveries.push(...deliveries);

      // Update notification metadata
      if (!notification._metadata) notification._metadata = {};
      if (!notification._metadata.deliveredTo) notification._metadata.deliveredTo = [];
      notification._metadata.deliveredTo.push(...targetUsers);

      // Trigger real-time delivery
      await simulateRealTimeDelivery(notification, targetUsers);

      return true;
    } catch (error) {
      console.error('Failed to deliver notification:', error);
      return false;
    }
  },

  // Push notification subscription management
  subscribeToPush: async (subscription: Omit<PushSubscription, 'createdAt'>): Promise<boolean> => {
    console.log('Subscribing to push notifications');
    
    try {
      const existingIndex = deliveryStorage.subscriptions.findIndex(
        s => s.userId === subscription.userId
      );

      const pushSubscription: PushSubscription = {
        ...subscription,
        createdAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        deliveryStorage.subscriptions[existingIndex] = pushSubscription;
      } else {
        deliveryStorage.subscriptions.push(pushSubscription);
      }

      toast.success('Push notifications enabled');
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  },

  unsubscribeFromPush: async (userId: string): Promise<boolean> => {
    console.log(`Unsubscribing user ${userId} from push notifications`);
    
    try {
      const index = deliveryStorage.subscriptions.findIndex(s => s.userId === userId);
      if (index >= 0) {
        deliveryStorage.subscriptions.splice(index, 1);
        toast.success('Push notifications disabled');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  },

  // Get user-specific notifications
  getUserNotifications: async (userId?: string): Promise<AdminNotification[]> => {
    console.log(`Fetching notifications for user: ${userId || 'current user'}`);
    
    try {
      const currentUser = userService.getCurrentUser();
      const targetUserId = userId || currentUser?.id || 'guest';
      
      // Get user's delivered notifications
      const userDeliveries = deliveryStorage.deliveries.filter(d => d.userId === targetUserId);
      const notificationIds = userDeliveries.map(d => d.notificationId);
      
      // Get all notifications that were delivered to this user
      const userNotifications = mockDatabase.notifications
        .filter(n => notificationIds.includes(n.id) || n.recipients === 'all')
        .map(n => ensureValidNotification(n as InternalNotification));

      return simulateAPI(userNotifications);
    } catch (error) {
      console.error('Failed to fetch user notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string, userId?: string): Promise<boolean> => {
    console.log(`Marking notification ${notificationId} as read`);
    
    try {
      const currentUser = userService.getCurrentUser();
      const targetUserId = userId || currentUser?.id || 'guest';
      
      const delivery = deliveryStorage.deliveries.find(
        d => d.notificationId === notificationId && d.userId === targetUserId
      );
      
      if (delivery && !delivery.readAt) {
        delivery.readAt = new Date().toISOString();
        delivery.status = 'read';
        
        // Update notification metadata
        const notification = mockDatabase.notifications.find(n => n.id === notificationId) as InternalDatabaseNotification | undefined;
        if (notification) {
          if (!notification._metadata) notification._metadata = {};
          if (!notification._metadata.readBy) notification._metadata.readBy = [];
          if (!notification._metadata.readBy.includes(targetUserId)) {
            notification._metadata.readBy.push(targetUserId);
          }
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  },

  // Get unread notification count
  getUnreadCount: async (userId?: string): Promise<number> => {
    try {
      const currentUser = userService.getCurrentUser();
      const targetUserId = userId || currentUser?.id || 'guest';
      
      const unreadCount = deliveryStorage.deliveries.filter(
        d => d.userId === targetUserId && !d.readAt
      ).length;
      
      return unreadCount;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  },

  // Batch operations
  markAllAsRead: async (userId?: string): Promise<boolean> => {
    console.log('Marking all notifications as read');
    
    try {
      const currentUser = userService.getCurrentUser();
      const targetUserId = userId || currentUser?.id || 'guest';
      
      const userDeliveries = deliveryStorage.deliveries.filter(
        d => d.userId === targetUserId && !d.readAt
      );
      
      const now = new Date().toISOString();
      userDeliveries.forEach(delivery => {
        delivery.readAt = now;
        delivery.status = 'read';
      });
      
      toast.success('All notifications marked as read');
      return true;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return false;
    }
  },

  // Real-time notification delivery simulation
  setupRealTimeDelivery: () => {
    console.log('Setting up real-time notification delivery');
    
    // In a real app, this would connect to WebSocket or Server-Sent Events
    // For now, we'll simulate with periodic checks
    return {
      start: () => {
        console.log('Real-time delivery started');
      },
      stop: () => {
        console.log('Real-time delivery stopped');
      }
    };
  },
};

/**
 * Helper function to ensure a notification object conforms to the AdminNotification interface
 * by ensuring all required fields are present and removing any extra fields
 */
function ensureValidNotification(notification: Partial<AdminNotification> & { id?: string, _metadata?: Record<string, unknown> }): AdminNotification {
  // Extract the metadata before creating the valid notification
  const { _metadata, ...rest } = notification;
  
  // Create a valid notification with all required fields
  const validNotification: AdminNotification = {
    id: notification.id || `notification-${Date.now()}`,
    title: notification.title || 'Untitled Notification',
    status: (notification.status as "Draft" | "Scheduled" | "Sent" | "Cancelled") || 'Draft',
    recipients: notification.recipients || 'all',
    date: notification.date || new Date().toISOString(),
    message: notification.message || '', // Provide a default value for message
    priority: notification.priority,
    sender: notification.sender,
    scheduledTime: notification.scheduledTime
  };
  
  return validNotification;
}

// Simulate real-time delivery
const simulateRealTimeDelivery = async (
  notification: InternalDatabaseNotification,
  userIds: string[]
): Promise<void> => {
  // Simulate delivery delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Show in-app notification for current user
  const currentUser = userService.getCurrentUser();
  if (currentUser && userIds.includes(currentUser.id)) {
    // Determine notification type based on content
    const isUrgent = notification.priority === 'High' || 
                    notification.title.toLowerCase().includes('urgent') ||
                    notification.title.toLowerCase().includes('emergency');
    
    if (isUrgent) {
      toast.error(notification.title, {
        description: notification.message,
        duration: 8000,
      });
    } else {
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    }
  }
  
  // Simulate push notification (in real app, would use service worker)
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'High',
      });
    } catch (error) {
      console.warn('Failed to show browser notification:', error);
    }
  }
};
