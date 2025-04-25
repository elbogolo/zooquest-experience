
import { AdminNotification } from "@/types/admin";
import { mockDatabase, simulateAPI } from "@/utils/adminUtils";
import { toast } from "sonner";

export const notificationService = {
  getNotifications: async (): Promise<AdminNotification[]> => {
    console.log("Fetching all notifications");
    return simulateAPI(mockDatabase.notifications);
  },

  getNotification: async (id: string): Promise<AdminNotification | null> => {
    console.log(`Fetching notification with ID: ${id}`);
    const notification = mockDatabase.notifications.find(n => n.id === id);
    return simulateAPI(notification || null);
  },

  createNotification: async (data: Partial<AdminNotification>): Promise<AdminNotification> => {
    const newNotification = {
      id: `notification-${Date.now()}`,
      title: data.title || "New Notification",
      status: data.status || "Draft",
      recipients: data.recipients || "All Visitors",
      date: data.date || new Date().toLocaleDateString(),
      message: data.message || "", // Ensure message is not undefined
      priority: data.priority,
      sender: data.sender,
      scheduledTime: data.scheduledTime,
      createdAt: new Date().toISOString()
    } as AdminNotification;
    
    mockDatabase.notifications.push(newNotification);
    return simulateAPI(newNotification);
  },

  updateNotification: async (id: string, data: Partial<AdminNotification>): Promise<AdminNotification> => {
    const index = mockDatabase.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Notification not found: ${id}`);
    
    const updatedNotification = {
      ...mockDatabase.notifications[index],
      ...data,
      // Ensure required fields
      title: data.title || mockDatabase.notifications[index].title || "Untitled Notification",
      status: data.status || mockDatabase.notifications[index].status || "Draft",
      recipients: data.recipients || mockDatabase.notifications[index].recipients || "All Visitors",
      date: data.date || mockDatabase.notifications[index].date || new Date().toLocaleDateString(),
      message: data.message !== undefined ? data.message : (mockDatabase.notifications[index].message || ""),
      updatedAt: new Date().toISOString()
    } as AdminNotification;
    
    mockDatabase.notifications[index] = updatedNotification;
    return simulateAPI(updatedNotification);
  },

  deleteNotification: async (id: string): Promise<void> => {
    const index = mockDatabase.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Notification not found: ${id}`);
    
    mockDatabase.notifications.splice(index, 1);
    return simulateAPI(undefined);
  },

  sendNotification: async (notification: Partial<AdminNotification>): Promise<AdminNotification> => {
    console.log("Sending notification:", notification);
    
    // Ensure all required fields are set
    const updatedNotification = {
      id: notification.id || `notification-${Date.now()}`,
      title: notification.title || "Untitled Notification",
      status: "Sent" as const,
      recipients: notification.recipients || "All Visitors",
      date: notification.date || new Date().toLocaleDateString(),
      message: notification.message || "", // Ensure message is not undefined
      priority: notification.priority,
      sender: notification.sender,
      scheduledTime: notification.scheduledTime,
      sentAt: new Date().toISOString()
    } as AdminNotification;
    
    // Update in the collection if it exists
    const index = mockDatabase.notifications.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      mockDatabase.notifications[index] = updatedNotification;
    } else {
      mockDatabase.notifications.push(updatedNotification);
    }
    
    toast.success(`Notification "${notification.title}" sent successfully`);
    return simulateAPI(updatedNotification);
  },

  scheduleNotification: async (notification: Partial<AdminNotification>, scheduledDate: string): Promise<AdminNotification> => {
    console.log("Scheduling notification:", notification, "for", scheduledDate);
    
    // Ensure all required fields are set
    const scheduledNotification = {
      id: notification.id || `notification-${Date.now()}`,
      title: notification.title || "Untitled Notification",
      status: "Scheduled" as const,
      recipients: notification.recipients || "All Visitors",
      date: notification.date || new Date().toLocaleDateString(),
      message: notification.message || "", // Ensure message is not undefined
      priority: notification.priority,
      sender: notification.sender,
      scheduledTime: scheduledDate
    } as AdminNotification;
    
    const index = mockDatabase.notifications.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      mockDatabase.notifications[index] = scheduledNotification;
    } else {
      mockDatabase.notifications.push(scheduledNotification);
    }
    
    toast.success(`Notification "${notification.title}" scheduled for ${scheduledDate}`);
    return simulateAPI(scheduledNotification);
  }
};
