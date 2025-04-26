import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { UserPreferencesContext } from './user-preferences-context';
import userPreferencesService, { UserPreferences } from '@/services/userPreferencesService';

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider = ({ children }: UserPreferencesProviderProps) => {
  const [preferences, setPreferences] = useState<UserPreferences>(
    userPreferencesService.getUserPreferences()
  );

  // Load preferences on mount
  useEffect(() => {
    const storedPreferences = userPreferencesService.getUserPreferences();
    setPreferences(storedPreferences);
  }, []);

  // Update preferences (partial update)
  const updatePreferences = useCallback((updatedPreferences: Partial<UserPreferences>) => {
    const newPreferences = userPreferencesService.updateUserPreferences(updatedPreferences);
    setPreferences(newPreferences);
  }, []);

  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    const defaultPreferences = userPreferencesService.resetUserPreferences();
    setPreferences(defaultPreferences);
  }, []);

  // Toggle item in favorites
  const toggleFavorite = useCallback((type: 'animals' | 'events' | 'locations', id: string) => {
    const isFavorited = userPreferencesService.isFavorite(type, id);
    
    let newPreferences: UserPreferences;
    if (isFavorited) {
      newPreferences = userPreferencesService.removeFromFavorites(type, id);
    } else {
      newPreferences = userPreferencesService.addToFavorites(type, id);
    }
    
    setPreferences(newPreferences);
  }, []);

  // Add to last visited
  const addToLastVisited = useCallback((type: 'animals' | 'events' | 'locations', id: string) => {
    const newPreferences = userPreferencesService.addToLastVisited(type, id);
    setPreferences(newPreferences);
  }, []);

  // Check if item is in favorites
  const isFavorite = useCallback((type: 'animals' | 'events' | 'locations', id: string) => {
    return userPreferencesService.isFavorite(type, id);
  }, []);

  // Create the context value using useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    preferences,
    updatePreferences,
    resetPreferences,
    toggleFavorite,
    addToLastVisited,
    isFavorite,
  }), [preferences, updatePreferences, resetPreferences, toggleFavorite, addToLastVisited, isFavorite]);

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
