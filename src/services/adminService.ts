
import { toast } from "sonner";

// This is a mock service for the admin operations
// In a real-world application, this would make API calls to a backend server

// Define types for the admin service
interface AdminItem {
  id: string;
  [key: string]: any;
}

export const adminService = {
  // Create a new item
  createItem: async (type: string, data: any): Promise<AdminItem> => {
    // In a real app, this would be an API call
    console.log(`Creating ${type} with data:`, data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful creation
    const newItem = {
      id: `new-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    
    return newItem;
  },
  
  // Update an existing item
  updateItem: async (type: string, id: string, data: any): Promise<AdminItem> => {
    // In a real app, this would be an API call
    console.log(`Updating ${type} with ID: ${id}`, data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful update
    const updatedItem = {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return updatedItem;
  },
  
  // Delete an item
  deleteItem: async (type: string, id: string): Promise<void> => {
    // In a real app, this would be an API call
    console.log(`Deleting ${type} with ID: ${id}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful deletion
    return;
  },
  
  // Get items by type
  getItems: async (type: string): Promise<AdminItem[]> => {
    // In a real app, this would be an API call
    console.log(`Fetching all ${type}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Return mock data based on type
    switch (type) {
      case 'animals':
        return [
          { id: "lion", name: "Lion", location: "Lion Enclosure", status: "Healthy", lastCheckup: "2023-07-10" },
          { id: "tiger", name: "Tiger", location: "Tiger Territory", status: "Under observation", lastCheckup: "2023-07-08" },
        ];
      case 'events':
        return [
          { id: "event1", title: "Feeding Time", date: "Today", time: "10:00 AM", location: "Lion Enclosure" },
          { id: "event2", title: "Zoo Tour", date: "Tomorrow", time: "09:00 AM", location: "Main Entrance" },
        ];
      case 'notifications':
        return [
          { id: "notif1", title: "Zoo closing early", status: "Sent", recipients: "All visitors", date: "2023-07-14" },
          { id: "notif2", title: "Tiger exhibit closed", status: "Scheduled", recipients: "Today's visitors", date: "2023-07-15" },
        ];
      default:
        return [];
    }
  },
  
  // Get a single item by type and ID
  getItem: async (type: string, id: string): Promise<AdminItem | null> => {
    // In a real app, this would be an API call
    console.log(`Fetching ${type} with ID: ${id}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock response
    return {
      id,
      name: `Mock ${type} item`,
      status: "Active",
      createdAt: new Date().toISOString(),
    };
  },
  
  // Search for items
  searchItems: async (type: string, query: string): Promise<AdminItem[]> => {
    // In a real app, this would be an API call
    console.log(`Searching ${type} with query: "${query}"`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock search results
    return [
      { id: `search-1`, name: `Result 1 for "${query}"`, status: "Active" },
      { id: `search-2`, name: `Result 2 for "${query}"`, status: "Inactive" },
    ];
  },
  
  // System operations
  backupData: async (): Promise<boolean> => {
    // Simulate backup operation
    console.log("Backing up system data...");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful backup
    toast.success("System data backed up successfully");
    return true;
  },
  
  resetSystem: async (): Promise<boolean> => {
    // Simulate system reset
    console.log("Resetting system...");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful reset
    toast.success("System reset successful");
    return true;
  }
};

export default adminService;
