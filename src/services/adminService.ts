
import { animalService } from "./animalService";
import { eventService } from "./eventService";
import { notificationService } from "./notificationService";
import { systemService } from "./systemService";
import { mockDatabase, simulateAPI } from "@/utils/adminUtils";
import { AdminAnimal, AdminEvent, AdminNotification, AdminStaff } from "@/types/admin";

// Generic type for admin items
type AdminItemsMap = {
  animals: AdminAnimal[];
  events: AdminEvent[];
  notifications: AdminNotification[];
  staff: AdminStaff[];
};

// Generic CRUD operations
export const adminService = {
  // Get all items of a particular type
  getItems: async <T>(itemType: keyof AdminItemsMap): Promise<T[]> => {
    console.log(`Fetching all ${itemType}`);
    
    if (!mockDatabase[itemType]) {
      throw new Error(`Invalid item type: ${itemType}`);
    }
    
    return simulateAPI(mockDatabase[itemType] as unknown as T[]);
  },

  // Get a single item by ID
  getItem: async <T extends { id: string }>(
    itemType: keyof AdminItemsMap,
    id: string
  ): Promise<T | null> => {
    console.log(`Fetching ${itemType} with ID: ${id}`);
    
    if (!mockDatabase[itemType]) {
      throw new Error(`Invalid item type: ${itemType}`);
    }
    
    const item = (mockDatabase[itemType] as unknown as T[]).find((item) => item.id === id);
    return simulateAPI(item || null);
  },

  // Create a new item
  createItem: async <T extends { id?: string }>(
    itemType: keyof AdminItemsMap,
    data: Partial<T>
  ): Promise<T> => {
    if (!mockDatabase[itemType]) {
      throw new Error(`Invalid item type: ${itemType}`);
    }
    
    const newItem = {
      id: `${itemType.slice(0, -1)}-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    } as unknown as T;
    
    (mockDatabase[itemType] as unknown as T[]).push(newItem);
    return simulateAPI(newItem);
  },

  // Update an existing item
  updateItem: async <T extends { id: string }>(
    itemType: keyof AdminItemsMap,
    id: string,
    data: Partial<T>
  ): Promise<T> => {
    if (!mockDatabase[itemType]) {
      throw new Error(`Invalid item type: ${itemType}`);
    }
    
    const index = (mockDatabase[itemType] as any[]).findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`${itemType} with ID ${id} not found`);
    }
    
    const updatedItem = {
      ...mockDatabase[itemType][index],
      ...data,
      updatedAt: new Date().toISOString()
    } as unknown as T;
    
    mockDatabase[itemType][index] = updatedItem as any;
    return simulateAPI(updatedItem);
  },

  // Delete an item
  deleteItem: async (
    itemType: keyof AdminItemsMap,
    id: string
  ): Promise<void> => {
    if (!mockDatabase[itemType]) {
      throw new Error(`Invalid item type: ${itemType}`);
    }
    
    const index = mockDatabase[itemType].findIndex((item: any) => item.id === id);
    if (index === -1) {
      throw new Error(`${itemType} with ID ${id} not found`);
    }
    
    mockDatabase[itemType].splice(index, 1);
    return simulateAPI(undefined);
  },
};

// Export all services
export * from "./animalService";
export * from "./eventService";
export * from "./notificationService";
export * from "./systemService";
export * from "@/types/admin";

// Default export for backward compatibility
const combinedService = {
  ...adminService,
  ...animalService,
  ...eventService,
  ...notificationService,
  ...systemService
};

export default combinedService;
