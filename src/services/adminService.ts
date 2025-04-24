
import { toast } from "sonner";

// Define comprehensive types for the admin service
export interface AdminAnimal {
  id: string;
  name: string;
  species?: string;
  location: string;
  status: "Healthy" | "Under observation" | "Scheduled for checkup" | "Treatment required";
  lastCheckup: string;
  nextCheckup?: string;
  dietaryNeeds?: string;
  medicalHistory?: string[];
  caretaker?: string;
  imageUrl?: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  duration?: string;
  host?: string;
  status?: "Scheduled" | "Ongoing" | "Completed" | "Cancelled";
  attendees?: number;
  imageUrl?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  status: "Draft" | "Scheduled" | "Sent" | "Cancelled";
  recipients: string;
  date: string;
  message?: string;
  priority?: "Low" | "Medium" | "High";
  sender?: string;
  scheduledTime?: string;
}

export interface AdminStaff {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Active" | "On Leave" | "Inactive";
  email?: string;
  phone?: string;
  startDate?: string;
  permissions?: string[];
}

export interface AdminSystemSettings {
  enableNotifications: boolean;
  lastBackupDate: string;
  theme: "light" | "dark" | "system";
}

export interface AdminHealthReport {
  id: string;
  animalId: string;
  date: string;
  veterinarian: string;
  findings: string;
  recommendations: string;
  followUpDate?: string;
}

export type AdminItemType = AdminAnimal | AdminEvent | AdminNotification | AdminStaff;

// Mock database collections
const mockData = {
  animals: [
    { id: "lion", name: "Lion", location: "Lion Enclosure", status: "Healthy", lastCheckup: "2023-07-10" },
    { id: "tiger", name: "Tiger", location: "Tiger Territory", status: "Under observation", lastCheckup: "2023-07-08" },
    { id: "gorilla", name: "Gorilla", location: "Gorilla Habitat", status: "Healthy", lastCheckup: "2023-07-12" },
    { id: "crocodile", name: "Crocodile", location: "Reptile House", status: "Healthy", lastCheckup: "2023-07-05" },
    { id: "elephant", name: "Elephant", location: "Savanna Area", status: "Healthy", lastCheckup: "2023-07-09" },
    { id: "giraffe", name: "Giraffe", location: "Giraffe Overlook", status: "Scheduled for checkup", lastCheckup: "2023-06-28" }
  ] as AdminAnimal[],

  events: [
    { id: "event1", title: "Feeding Time", date: "Today", time: "10:00 AM", location: "Lion Enclosure", status: "Scheduled" },
    { id: "event2", title: "Zoo Tour", date: "Tomorrow", time: "09:00 AM", location: "Main Entrance", status: "Scheduled" },
    { id: "event3", title: "Bird Show", date: "Today", time: "02:00 PM", location: "Aviary", status: "Scheduled" },
    { id: "event4", title: "Conservation Talk", date: "This Weekend", time: "11:00 AM", location: "Education Center", status: "Scheduled" }
  ] as AdminEvent[],

  notifications: [
    { id: "notif1", title: "Zoo closing early", status: "Sent", recipients: "All visitors", date: "2023-07-14", message: "Due to expected severe weather, the zoo will close at 3:00 PM today." },
    { id: "notif2", title: "Tiger exhibit closed", status: "Scheduled", recipients: "Today's visitors", date: "2023-07-15", message: "The tiger exhibit will be temporarily closed for maintenance." },
    { id: "notif3", title: "New panda exhibit", status: "Draft", recipients: "All members", date: "2023-07-20", message: "We're excited to announce our new panda exhibit opening next month!" },
    { id: "notif4", title: "Holiday hours", status: "Sent", recipients: "All visitors", date: "2023-07-11", message: "Special holiday opening hours next week." }
  ] as AdminNotification[],

  staff: [
    { id: "staff1", name: "John Smith", role: "Zookeeper", department: "Mammals", status: "Active" },
    { id: "staff2", name: "Emily Johnson", role: "Veterinarian", department: "Medical", status: "Active" },
    { id: "staff3", name: "Michael Brown", role: "Tour Guide", department: "Education", status: "On Leave" },
    { id: "staff4", name: "Sarah Davis", role: "Administrative", department: "Office", status: "Active" },
  ] as AdminStaff[],

  healthReports: [] as AdminHealthReport[],

  systemSettings: {
    enableNotifications: true,
    lastBackupDate: new Date().toISOString(),
    theme: "light" as const
  }
};

// Helper to simulate API delays with optional failure rate
const simulateAPI = async (response: any, failureRate = 0): Promise<any> => {
  const delay = Math.random() * 500 + 300; // 300-800ms delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate random failures if specified
  if (failureRate > 0 && Math.random() < failureRate) {
    throw new Error("API request failed");
  }
  
  return response;
};

export const adminService = {
  // Create a new item
  createItem: async <T extends AdminItemType>(type: string, data: Partial<T>): Promise<T> => {
    console.log(`Creating ${type} with data:`, data);
    
    // Create a new item with an ID and timestamp
    const newItem = {
      id: `new-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    
    // Add to mock database - Fix the type error by checking if the collection is an array
    const collection = mockData[type as keyof typeof mockData];
    if (Array.isArray(collection)) {
      collection.push(newItem as any);
    }
    
    // Fix the TypeScript error by using a proper type assertion
    return simulateAPI(newItem as unknown as T);
  },
  
  // Update an existing item
  updateItem: async <T extends AdminItemType>(type: string, id: string, data: Partial<T>): Promise<T> => {
    console.log(`Updating ${type} with ID: ${id}`, data);
    
    // Find and update the item
    const collection = mockData[type as keyof typeof mockData] as any[];
    const index = collection.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item not found: ${id}`);
    }
    
    // Update the item
    const updatedItem = {
      ...collection[index],
      ...data,
      updatedAt: new Date().toISOString()
    } as T;
    
    collection[index] = updatedItem;
    
    return simulateAPI(updatedItem);
  },
  
  // Delete an item
  deleteItem: async (type: string, id: string): Promise<void> => {
    console.log(`Deleting ${type} with ID: ${id}`);
    
    // Find and remove the item
    const collection = mockData[type as keyof typeof mockData] as any[];
    const index = collection.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item not found: ${id}`);
    }
    
    collection.splice(index, 1);
    
    return simulateAPI(undefined);
  },
  
  // Get items by type
  getItems: async <T extends AdminItemType>(type: string): Promise<T[]> => {
    console.log(`Fetching all ${type}`);
    
    return simulateAPI(mockData[type as keyof typeof mockData] as T[]);
  },
  
  // Get a single item by type and ID
  getItem: async <T extends AdminItemType>(type: string, id: string): Promise<T | null> => {
    console.log(`Fetching ${type} with ID: ${id}`);
    
    const collection = mockData[type as keyof typeof mockData] as any[];
    const item = collection.find(item => item.id === id);
    
    return simulateAPI(item || null);
  },
  
  // Search for items
  searchItems: async <T extends AdminItemType>(type: string, query: string): Promise<T[]> => {
    console.log(`Searching ${type} with query: "${query}"`);
    
    const collection = mockData[type as keyof typeof mockData] as any[];
    const results = collection.filter(item => 
      Object.values(item).some(
        value => value && value.toString().toLowerCase().includes(query.toLowerCase())
      )
    );
    
    return simulateAPI(results as T[]);
  },
  
  // Animal-specific operations
  createHealthReport: async (report: Omit<AdminHealthReport, 'id'>): Promise<AdminHealthReport> => {
    const newReport = {
      id: `report-${Date.now()}`,
      ...report,
      date: report.date || new Date().toISOString()
    };
    
    mockData.healthReports.push(newReport);
    
    // Update the animal's last checkup date
    const animalIndex = mockData.animals.findIndex(a => a.id === report.animalId);
    if (animalIndex >= 0) {
      mockData.animals[animalIndex].lastCheckup = new Date().toLocaleDateString();
    }
    
    return simulateAPI(newReport);
  },
  
  getHealthReports: async (animalId?: string): Promise<AdminHealthReport[]> => {
    let reports = mockData.healthReports;
    
    if (animalId) {
      reports = reports.filter(r => r.animalId === animalId);
    }
    
    return simulateAPI(reports);
  },
  
  // Notification operations
  sendNotification: async (notification: AdminNotification): Promise<AdminNotification> => {
    console.log("Sending notification:", notification);
    
    const updatedNotification = {
      ...notification,
      status: "Sent" as const,
      sentAt: new Date().toISOString()
    };
    
    // Update in the collection if it exists
    const index = mockData.notifications.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      mockData.notifications[index] = updatedNotification;
    } else {
      // Or add as new if it doesn't
      mockData.notifications.push(updatedNotification);
    }
    
    toast.success(`Notification "${notification.title}" sent successfully`);
    return simulateAPI(updatedNotification);
  },
  
  scheduleNotification: async (notification: AdminNotification, scheduledDate: string): Promise<AdminNotification> => {
    console.log("Scheduling notification:", notification, "for", scheduledDate);
    
    const scheduledNotification = {
      ...notification,
      status: "Scheduled" as const,
      scheduledTime: scheduledDate
    };
    
    // Update in the collection if it exists
    const index = mockData.notifications.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      mockData.notifications[index] = scheduledNotification;
    } else {
      // Or add as new if it doesn't
      mockData.notifications.push(scheduledNotification);
    }
    
    toast.success(`Notification "${notification.title}" scheduled for ${scheduledDate}`);
    return simulateAPI(scheduledNotification);
  },
  
  // System operations
  backupData: async (): Promise<boolean> => {
    console.log("Backing up system data...");
    
    mockData.systemSettings.lastBackupDate = new Date().toISOString();
    
    // Simulate longer operation
    await simulateAPI(null, 0.1);
    
    toast.success("System data backed up successfully");
    return true;
  },
  
  resetSystem: async (): Promise<boolean> => {
    console.log("Resetting system...");
    
    // Simulate longer operation with higher chance of failure
    await simulateAPI(null, 0.2);
    
    toast.success("System reset successful");
    return true;
  },
  
  uploadImage: async (file: File, type: string, id: string): Promise<string> => {
    console.log(`Uploading image for ${type} ${id}:`, file.name);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock URL for the "uploaded" image
    const imageUrl = `mock-upload-url/${file.name}`;
    
    // Update the item with the new image URL
    const collection = mockData[type as keyof typeof mockData] as any[];
    const index = collection.findIndex(item => item.id === id);
    
    if (index >= 0) {
      collection[index].imageUrl = imageUrl;
    }
    
    toast.success(`Image uploaded successfully`);
    return imageUrl;
  },
  
  getSystemSettings: async (): Promise<AdminSystemSettings> => {
    return simulateAPI(mockData.systemSettings);
  },
  
  updateSystemSettings: async (settings: Partial<AdminSystemSettings>): Promise<AdminSystemSettings> => {
    // Using type assertion to fix the TypeScript error
    const updatedSettings = {
      ...mockData.systemSettings,
      ...settings
    } as typeof mockData.systemSettings;
    
    mockData.systemSettings = updatedSettings;
    
    toast.success("System settings updated");
    return simulateAPI(mockData.systemSettings);
  }
};

export default adminService;
