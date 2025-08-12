import { AdminAnimal, AdminHealthReport } from "@/types/admin";
import { dataSyncService } from "./dataSyncService";
import { apiClient } from "./apiClient";
import { toast } from "sonner";
import type { DatabaseAnimal } from "@/types/api";

// Convert database animal to admin animal format
const convertToAdminAnimal = (dbAnimal: DatabaseAnimal): AdminAnimal => ({
  id: dbAnimal.id,
  name: dbAnimal.name,
  species: dbAnimal.species,
  location: dbAnimal.location,
  imageUrl: dbAnimal.image_url,
  status: mapDatabaseStatusToAdmin(dbAnimal.status),
  lastCheckup: dbAnimal.last_checkup || new Date().toISOString(),
  nextCheckup: dbAnimal.next_checkup,
  dietaryNeeds: dbAnimal.dietary_needs,
  medicalHistory: dbAnimal.medical_history ? [dbAnimal.medical_history] : [],
  caretaker: dbAnimal.caretaker
});

// Convert admin status to database status
const mapAdminStatusToDatabase = (status: AdminAnimal['status']): DatabaseAnimal['status'] => {
  switch (status) {
    case "Healthy": return "healthy";
    case "Under observation": return "sick";
    case "Scheduled for checkup": return "healthy";
    case "Treatment required": return "treatment";
    default: return "healthy";
  }
};

// Convert database status to admin status
const mapDatabaseStatusToAdmin = (status: DatabaseAnimal['status']): AdminAnimal['status'] => {
  switch (status) {
    case "healthy": return "Healthy";
    case "sick": return "Under observation";
    case "quarantine": return "Under observation";
    case "treatment": return "Treatment required";
    default: return "Healthy";
  }
};

export const animalService = {
  getAnimals: async (): Promise<AdminAnimal[]> => {
    try {
      console.log("Fetching all animals from API");
      const dbAnimals = await dataSyncService.syncAnimals();
      return dbAnimals.map(convertToAdminAnimal);
    } catch (error) {
      console.error("Failed to fetch animals:", error);
      toast.error("Failed to load animals");
      throw error;
    }
  },

  getAnimal: async (id: string): Promise<AdminAnimal | null> => {
    try {
      console.log(`Fetching animal with ID: ${id}`);
      const dbAnimal = await apiClient.get<DatabaseAnimal>(`/animals/${id}`);
      return dbAnimal ? convertToAdminAnimal(dbAnimal) : null;
    } catch (error) {
      console.error(`Failed to fetch animal ${id}:`, error);
      toast.error("Failed to load animal details");
      return null;
    }
  },

  createAnimal: async (data: Partial<AdminAnimal>): Promise<AdminAnimal> => {
    return dataSyncService.handleDataModification(async () => {
      console.log("Creating new animal");
      const dbAnimal = await apiClient.post<DatabaseAnimal>('/admin/animals', {
        name: data.name,
        species: data.species,
        location: data.location,
        image_url: data.imageUrl,
        status: mapAdminStatusToDatabase(data.status),
        last_checkup: data.lastCheckup,
        next_checkup: data.nextCheckup,
        dietary_needs: data.dietaryNeeds,
        medical_history: data.medicalHistory && data.medicalHistory[0],
        caretaker: data.caretaker
      });
      
      toast.success("Animal created successfully");
      return convertToAdminAnimal(dbAnimal);
    }, 'animal');
  },

  updateAnimal: async (id: string, data: Partial<AdminAnimal>): Promise<AdminAnimal> => {
    return dataSyncService.handleDataModification(async () => {
      console.log(`Updating animal with ID: ${id}`);
      const dbAnimal = await apiClient.put<DatabaseAnimal>(`/admin/animals/${id}`, {
        name: data.name,
        species: data.species,
        location: data.location,
        image_url: data.imageUrl,
        status: data.status ? mapAdminStatusToDatabase(data.status) : 'healthy',
        last_checkup: data.lastCheckup,
        next_checkup: data.nextCheckup,
        dietary_needs: data.dietaryNeeds,
        medical_history: data.medicalHistory && data.medicalHistory[0],
        caretaker: data.caretaker
      });
      
      toast.success("Animal updated successfully");
      return convertToAdminAnimal(dbAnimal);
    }, 'animal', id);
  },

  deleteAnimal: async (id: string): Promise<void> => {
    return dataSyncService.handleDataModification(async () => {
      console.log(`Deleting animal with ID: ${id}`);
      await apiClient.delete(`/admin/animals/${id}`);
      toast.success("Animal deleted successfully");
    }, 'animal', id);
  },

  uploadAnimalImage: async (animalId: string, file: File): Promise<string> => {
    try {
      console.log(`Uploading image for animal: ${animalId}`);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('animalId', animalId);
      
      const response = await apiClient.postFormData<{ image_url: string }>('/admin/animals/upload-image', formData);
      
      // Update animal with new image URL
      await this.updateAnimal(animalId, { imageUrl: response.image_url });
      
      toast.success("Image uploaded successfully");
      return response.image_url;
    } catch (error) {
      console.error("Failed to upload animal image:", error);
      toast.error("Failed to upload image");
      throw error;
    }
  },

  getHealthReports: async (animalId?: string): Promise<AdminHealthReport[]> => {
    try {
      console.log(`Fetching health reports${animalId ? ` for animal: ${animalId}` : ''}`);
      const endpoint = animalId ? `/admin/animals/${animalId}/health-reports` : '/admin/health-reports';
      const reports = await apiClient.get<AdminHealthReport[]>(endpoint);
      return reports;
    } catch (error) {
      console.error("Failed to fetch health reports:", error);
      toast.error("Failed to load health reports");
      return [];
    }
  },

  createHealthReport: async (data: Partial<AdminHealthReport>): Promise<AdminHealthReport> => {
    try {
      console.log("Creating new health report");
      const report = await apiClient.post<AdminHealthReport>('/admin/health-reports', data);
      toast.success("Health report created successfully");
      return report;
    } catch (error) {
      console.error("Failed to create health report:", error);
      toast.error("Failed to create health report");
      throw error;
    }
  }
};
