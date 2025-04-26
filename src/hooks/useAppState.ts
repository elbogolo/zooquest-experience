import { useContext } from 'react';
import { AppStateContext, AppStateContextType } from '@/contexts/app-state-context';

/**
 * Hook for accessing and managing app-wide state
 * @returns The app state context
 */
export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  
  return context;
};

export default useAppState;
