
import { AdminNotification } from "@/types/admin";
import { mockDatabase, simulateAPI } from "@/utils/adminUtils";
import { toast } from "sonner";

// Define a type for our internal notification management (extends AdminNotification with tracking fields)
type InternalNotification = Omit<AdminNotification, 'message'> & {
  message: string; // Make message required internally
  // Metadata fields for tracking (not part of the public interface)
  _metadata?: {
    createdAt?: string;
    updatedAt?: string;
    sentAt?: string;
  };
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
  }
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
