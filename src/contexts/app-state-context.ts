import { createContext } from 'react';
import { AdminAnimal, AdminEvent } from '@/types/admin';

/**
 * Interface for app-wide state
 */
export interface AppState {
  animals: AdminAnimal[];
  events: AdminEvent[];
  locations: {
    id: string;
    name: string;
    coordinates: [number, number];
    description?: string;
    category?: string;
    isOpen?: boolean;
    imageUrl?: string;
  }[];
  isInitialized: boolean;
  isOnline: boolean;
  lastSyncTime: string | null;
}

/**
 * Context for app-wide state management
 */
export interface AppStateContextType {
  state: AppState;
  // Animals CRUD
  updateAnimal: (id: string, animal: Partial<AdminAnimal>) => void;
  addAnimal: (animal: Omit<AdminAnimal, 'id'>) => void;
  removeAnimal: (id: string) => void;
  getAnimal: (id: string) => AdminAnimal | undefined;
  
  // Events CRUD
  updateEvent: (id: string, event: Partial<AdminEvent>) => void;
  addEvent: (event: Omit<AdminEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  getEvent: (id: string) => AdminEvent | undefined;
  
  // Location CRUD
  updateLocation: (id: string, location: Partial<{ name: string, coordinates: [number, number], description?: string }>) => void;
  addLocation: (location: { name: string, coordinates: [number, number], description?: string, category?: string }) => void;
  removeLocation: (id: string) => void;
  getLocation: (id: string) => { id: string, name: string, coordinates: [number, number], description?: string } | undefined;
  
  // General state
  syncData: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const AppStateContext = createContext<AppStateContextType | null>(null);
