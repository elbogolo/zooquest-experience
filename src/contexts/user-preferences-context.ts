import { createContext } from 'react';
import { UserPreferences } from '@/services/userPreferencesService';

export interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updatedPreferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  toggleFavorite: (type: 'animals' | 'events' | 'locations', id: string) => void;
  addToLastVisited: (type: 'animals' | 'events' | 'locations', id: string) => void;
  isFavorite: (type: 'animals' | 'events' | 'locations', id: string) => boolean;
}

export const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);
