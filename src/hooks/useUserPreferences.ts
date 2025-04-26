import { useContext } from 'react';
import { UserPreferencesContext, UserPreferencesContextType } from '@/contexts/user-preferences-context';

/**
 * Hook for accessing and managing user preferences
 * @returns The user preferences context
 */
export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  
  return context;
};

export default useUserPreferences;
