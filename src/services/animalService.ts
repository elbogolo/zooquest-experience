
import { AdminAnimal, AdminHealthReport } from "@/types/admin";
import { mockDatabase, simulateAPI } from "@/utils/adminUtils";
import { toast } from "sonner";

export const animalService = {
  getAnimals: async (): Promise<AdminAnimal[]> => {
    console.log("Fetching all animals");
    return simulateAPI(mockDatabase.animals);
  },

  getAnimal: async (id: string): Promise<AdminAnimal | null> => {
    console.log(`Fetching animal with ID: ${id}`);
    const animal = mockDatabase.animals.find(a => a.id === id);
    return simulateAPI(animal || null);
  },

  createAnimal: async (data: Partial<AdminAnimal>): Promise<AdminAnimal> => {
    const newAnimal = {
      id: `animal-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    } as AdminAnimal;
    
    mockDatabase.animals.push(newAnimal);
    return simulateAPI(newAnimal);
  },

  updateAnimal: async (id: string, data: Partial<AdminAnimal>): Promise<AdminAnimal> => {
    const index = mockDatabase.animals.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Animal not found: ${id}`);
    
    const updatedAnimal = {
      ...mockDatabase.animals[index],
      ...data,
      updatedAt: new Date().toISOString()
    } as AdminAnimal;
    
    mockDatabase.animals[index] = updatedAnimal;
    return simulateAPI(updatedAnimal);
  },

  deleteAnimal: async (id: string): Promise<void> => {
    const index = mockDatabase.animals.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Animal not found: ${id}`);
    
    mockDatabase.animals.splice(index, 1);
    return simulateAPI(undefined);
  },

  createHealthReport: async (report: Omit<AdminHealthReport, 'id'>): Promise<AdminHealthReport> => {
    const newReport = {
      id: `report-${Date.now()}`,
      ...report,
      date: report.date || new Date().toISOString()
    };
    
    mockDatabase.healthReports.push(newReport);
    
    // Update the animal's last checkup date
    const animalIndex = mockDatabase.animals.findIndex(a => a.id === report.animalId);
    if (animalIndex >= 0) {
      mockDatabase.animals[animalIndex].lastCheckup = new Date().toLocaleDateString();
    }
    
    return simulateAPI(newReport);
  },

  getHealthReports: async (animalId?: string): Promise<AdminHealthReport[]> => {
    let reports = mockDatabase.healthReports;
    if (animalId) {
      reports = reports.filter(r => r.animalId === animalId);
    }
    return simulateAPI(reports);
  }
};
