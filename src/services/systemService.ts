
import { AdminSystemSettings } from "@/types/admin";
import { mockDatabase, simulateAPI } from "@/utils/adminUtils";
import { toast } from "sonner";

export const systemService = {
  getSettings: async (): Promise<AdminSystemSettings> => {
    return simulateAPI(mockDatabase.systemSettings);
  },

  // Add alias for backward compatibility
  getSystemSettings: async (): Promise<AdminSystemSettings> => {
    return simulateAPI(mockDatabase.systemSettings);
  },

  updateSettings: async (settings: Partial<AdminSystemSettings>): Promise<AdminSystemSettings> => {
    const updatedSettings = {
      ...mockDatabase.systemSettings,
      ...settings,
      // Ensure theme is one of the valid types and all required fields are present
      enableNotifications: settings.enableNotifications !== undefined ? settings.enableNotifications : mockDatabase.systemSettings.enableNotifications,
      lastBackupDate: settings.lastBackupDate || mockDatabase.systemSettings.lastBackupDate,
      theme: settings.theme || mockDatabase.systemSettings.theme || "light"
    } as AdminSystemSettings;
    
    mockDatabase.systemSettings = updatedSettings;
    toast.success("System settings updated");
    return simulateAPI(updatedSettings);
  },

  // Add alias for backward compatibility
  updateSystemSettings: async (settings: Partial<AdminSystemSettings>): Promise<AdminSystemSettings> => {
    return systemService.updateSettings(settings);
  },

  backupData: async (): Promise<boolean> => {
    console.log("Backing up system data...");
    
    mockDatabase.systemSettings.lastBackupDate = new Date().toISOString();
    
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
    const collection = mockDatabase[type as keyof typeof mockDatabase] as any[];
    const index = collection.findIndex(item => item.id === id);
    
    if (index >= 0) {
      collection[index].imageUrl = imageUrl;
    }
    
    toast.success(`Image uploaded successfully`);
    return imageUrl;
  }
};
