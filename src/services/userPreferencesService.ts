import { ZooTheme } from '@/types/theme';

export interface UserPreferences {
  theme: ZooTheme;
  language: string;
  notificationsEnabled: boolean;
  locationTrackingEnabled: boolean;
  favoriteAnimals: string[];
  favoriteEvents: string[];
  favoriteLocations: string[];
  mapSettings: {
    defaultZoom: number;
    showLabels: boolean;
    showAnimals: boolean;
    showEvents: boolean;
  };
  accessibility: {
    largeText: boolean;
    highContrast: boolean;
    reduceMotion: boolean;
  };
  lastVisited: {
    animals: string[];
    events: string[];
    locations: string[];
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  notificationsEnabled: true,
  locationTrackingEnabled: true,
  favoriteAnimals: [],
  favoriteEvents: [],
  favoriteLocations: [],
  mapSettings: {
    defaultZoom: 15,
    showLabels: true,
    showAnimals: true,
    showEvents: true,
  },
  accessibility: {
    largeText: false,
    highContrast: false,
    reduceMotion: false,
  },
  lastVisited: {
    animals: [],
    events: [],
    locations: [],
  },
};

const STORAGE_KEY = 'zooquest_user_preferences';

/**
 * Get all user preferences
 */
export const getUserPreferences = (): UserPreferences => {
  try {
    const storedPreferences = localStorage.getItem(STORAGE_KEY);
    if (storedPreferences) {
      return { ...defaultPreferences, ...JSON.parse(storedPreferences) };
    }
  } catch (error) {
    console.error('Failed to load user preferences:', error);
  }
  return defaultPreferences;
};

/**
 * Save all user preferences
 */
export const saveUserPreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
};

/**
 * Update specific user preference(s)
 */
export const updateUserPreferences = (
  updatedPreferences: Partial<UserPreferences>
): UserPreferences => {
  const currentPreferences = getUserPreferences();
  const newPreferences = { ...currentPreferences, ...updatedPreferences };
  saveUserPreferences(newPreferences);
  return newPreferences;
};

/**
 * Reset user preferences to defaults
 */
export const resetUserPreferences = (): UserPreferences => {
  saveUserPreferences(defaultPreferences);
  return defaultPreferences;
};

/**
 * Add item to a favorites array
 */
export const addToFavorites = (
  type: 'animals' | 'events' | 'locations',
  id: string
): UserPreferences => {
  const currentPreferences = getUserPreferences();
  const key = `favorite${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof UserPreferences;
  
  if (Array.isArray(currentPreferences[key])) {
    const updatedArray = [...(currentPreferences[key] as string[])];
    if (!updatedArray.includes(id)) {
      updatedArray.push(id);
    }
    
    const update = { [key]: updatedArray } as Partial<UserPreferences>;
    return updateUserPreferences(update);
  }
  
  return currentPreferences;
};

/**
 * Remove item from a favorites array
 */
export const removeFromFavorites = (
  type: 'animals' | 'events' | 'locations',
  id: string
): UserPreferences => {
  const currentPreferences = getUserPreferences();
  const key = `favorite${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof UserPreferences;
  
  if (Array.isArray(currentPreferences[key])) {
    const updatedArray = (currentPreferences[key] as string[]).filter(itemId => itemId !== id);
    const update = { [key]: updatedArray } as Partial<UserPreferences>;
    return updateUserPreferences(update);
  }
  
  return currentPreferences;
};

/**
 * Add item to last visited list (maintains last 5 items)
 */
export const addToLastVisited = (
  type: 'animals' | 'events' | 'locations',
  id: string
): UserPreferences => {
  const currentPreferences = getUserPreferences();
  const lastVisited = { ...currentPreferences.lastVisited };
  
  // Remove if already exists
  lastVisited[type] = lastVisited[type].filter(itemId => itemId !== id);
  
  // Add to beginning
  lastVisited[type].unshift(id);
  
  // Limit to 5 items
  lastVisited[type] = lastVisited[type].slice(0, 5);
  
  return updateUserPreferences({ lastVisited });
};

/**
 * Check if an item is in favorites
 */
export const isFavorite = (
  type: 'animals' | 'events' | 'locations',
  id: string
): boolean => {
  const preferences = getUserPreferences();
  const key = `favorite${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof UserPreferences;
  return Array.isArray(preferences[key]) && (preferences[key] as string[]).includes(id);
};

const userPreferencesService = {
  getUserPreferences,
  saveUserPreferences,
  updateUserPreferences,
  resetUserPreferences,
  addToFavorites,
  removeFromFavorites,
  addToLastVisited,
  isFavorite,
};

export default userPreferencesService;
