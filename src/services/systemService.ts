
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
    // Define the updatedSettings explicitly with the correct type
    const updatedSettings: AdminSystemSettings = {
      ...mockDatabase.systemSettings,
      ...settings,
      // Ensure all required fields are present with proper types
      enableNotifications: settings.enableNotifications !== undefined 
        ? settings.enableNotifications 
        : mockDatabase.systemSettings.enableNotifications,
      lastBackupDate: settings.lastBackupDate || mockDatabase.systemSettings.lastBackupDate,
      theme: (settings.theme || mockDatabase.systemSettings.theme) as "light" | "dark" | "system"
    };
    
    // Cast to match mockDatabase types
    mockDatabase.systemSettings = updatedSettings as typeof mockDatabase.systemSettings;
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
    
    try {
      // Generate a proper file URL that will work in the app
      // In a real app, this would upload to a server or cloud storage
      // For this mock implementation, we'll use public folder paths
      
      // Extract the file extension and create a sanitized filename
      const fileExt = file.name.split('.').pop() || 'jpg';
      const safeFileName = `${type}-${id}-${Date.now()}.${fileExt}`;
      
      // Create a URL that points to the public folder where images would be stored
      // The public folder is accessible to the browser as a root path
      const imageUrl = `/lovable-uploads/${safeFileName}`;
      
      // Update the item with the new image URL
      const collection = mockDatabase[type as keyof typeof mockDatabase] as Array<{ id: string; imageUrl?: string }>;
      const index = collection.findIndex(item => item.id === id);
      
      if (index >= 0) {
        collection[index].imageUrl = imageUrl;
      }
      
      toast.success(`Image uploaded successfully`);
      return imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      throw new Error('Upload failed');
    }
  }
};
