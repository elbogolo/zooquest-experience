import { ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { AppStateContext, AppState } from './app-state-context';
import { AdminAnimal, AdminEvent } from '@/types/admin';
import { adminService } from '@/services/adminService';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Storage keys
const STORAGE_KEYS = {
  APP_STATE: 'zooquest_app_state',
  LAST_SYNC: 'zooquest_last_sync',
};

// Default app state
const defaultAppState: AppState = {
  animals: [],
  events: [],
  locations: [],
  isInitialized: false,
  isOnline: navigator.onLine,
  lastSyncTime: null,
};

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [state, setState] = useState<AppState>(() => {
    // Attempt to load state from localStorage on initialization
    try {
      const savedState = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (savedState) {
        return { ...defaultAppState, ...JSON.parse(savedState) };
      }
    } catch (error) {
      console.error('Failed to load app state from storage:', error);
    }
    return defaultAppState;
  });

  // Sync data from services
  const syncData = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Cannot sync data while offline');
      return;
    }
    
    try {
      const [animals, events] = await Promise.all([
        adminService.getItems<AdminAnimal>('animals'),
        adminService.getItems<AdminEvent>('events')
      ]);

      // Mock location data (in a real app, this would come from a service)
      const locations = [
        {
          id: '1',
          name: 'Main Entrance',
          coordinates: [-74.006, 40.7128] as [number, number],
          description: 'Main zoo entrance and visitor center',
          category: 'entrance',
          isOpen: true,
          imageUrl: '/images/locations/entrance.jpg'
        },
        {
          id: '2',
          name: 'Savanna Exhibits',
          coordinates: [-74.005, 40.714] as [number, number],
          description: 'African savanna animal exhibits',
          category: 'exhibit',
          isOpen: true,
          imageUrl: '/images/locations/savanna.jpg'
        },
        {
          id: '3',
          name: 'Aquatic Center',
          coordinates: [-74.008, 40.713] as [number, number],
          description: 'Aquatic animals and exhibits',
          category: 'exhibit',
          isOpen: true,
          imageUrl: '/images/locations/aquatic.jpg'
        }
      ];

      setState(prevState => ({
        ...prevState,
        animals,
        events,
        locations,
        isInitialized: true,
        lastSyncTime: new Date().toISOString()
      }));

      toast.success('Data synchronized successfully');
    } catch (error) {
      console.error('Failed to sync data:', error);
      toast.error('Failed to synchronize data');
    }
  }, []);

  // Set online status
  const setOnlineStatus = useCallback((isOnline: boolean) => {
    setState(prevState => ({
      ...prevState,
      isOnline
    }));

    if (isOnline) {
      toast.info('Back online. You can now sync data.');
    } else {
      toast.warning('You are offline. Changes will be saved locally.');
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    if (!state.isInitialized) {
      syncData();
    }

    // Set up online/offline event listeners
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.isInitialized, syncData, setOnlineStatus]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state.isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save app state to storage:', error);
      }
    }
  }, [state]);

  // Animal CRUD operations
  const getAnimal = useCallback((id: string) => {
    return state.animals.find(animal => animal.id === id);
  }, [state.animals]);

  const addAnimal = useCallback(async (animalData: Omit<AdminAnimal, 'id'>) => {
    try {
      let newAnimal: AdminAnimal;
      
      if (state.isOnline) {
        // If online, create through service
        newAnimal = await adminService.createItem<AdminAnimal>('animals', animalData);
      } else {
        // If offline, create locally with temp ID
        newAnimal = {
          ...animalData,
          id: `temp_${uuidv4()}`
        };
      }

      setState(prevState => ({
        ...prevState,
        animals: [...prevState.animals, newAnimal]
      }));

      return newAnimal;
    } catch (error) {
      console.error('Error adding animal:', error);
      toast.error('Failed to add animal');
      throw error;
    }
  }, [state.isOnline]);

  const updateAnimal = useCallback(async (id: string, animalData: Partial<AdminAnimal>) => {
    try {
      let updatedAnimal: AdminAnimal;
      
      if (state.isOnline) {
        // If online, update through service
        updatedAnimal = await adminService.updateItem<AdminAnimal>('animals', id, animalData);
      } else {
        // If offline, update locally
        const existingAnimal = state.animals.find(animal => animal.id === id);
        if (!existingAnimal) {
          throw new Error(`Animal with ID ${id} not found`);
        }
        
        updatedAnimal = { ...existingAnimal, ...animalData };
      }

      setState(prevState => ({
        ...prevState,
        animals: prevState.animals.map(animal => 
          animal.id === id ? updatedAnimal : animal
        )
      }));

      return updatedAnimal;
    } catch (error) {
      console.error('Error updating animal:', error);
      toast.error('Failed to update animal');
      throw error;
    }
  }, [state.animals, state.isOnline]);

  const removeAnimal = useCallback(async (id: string) => {
    try {
      if (state.isOnline) {
        // If online, delete through service
        await adminService.deleteItem('animals', id);
      }

      setState(prevState => ({
        ...prevState,
        animals: prevState.animals.filter(animal => animal.id !== id)
      }));
    } catch (error) {
      console.error('Error removing animal:', error);
      toast.error('Failed to remove animal');
      throw error;
    }
  }, [state.isOnline]);

  // Event CRUD operations
  const getEvent = useCallback((id: string) => {
    return state.events.find(event => event.id === id);
  }, [state.events]);

  const addEvent = useCallback(async (eventData: Omit<AdminEvent, 'id'>) => {
    try {
      let newEvent: AdminEvent;
      
      if (state.isOnline) {
        // If online, create through service
        newEvent = await adminService.createItem<AdminEvent>('events', eventData);
      } else {
        // If offline, create locally with temp ID
        newEvent = {
          ...eventData,
          id: `temp_${uuidv4()}`
        };
      }

      setState(prevState => ({
        ...prevState,
        events: [...prevState.events, newEvent]
      }));

      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
      throw error;
    }
  }, [state.isOnline]);

  const updateEvent = useCallback(async (id: string, eventData: Partial<AdminEvent>) => {
    try {
      let updatedEvent: AdminEvent;
      
      if (state.isOnline) {
        // If online, update through service
        updatedEvent = await adminService.updateItem<AdminEvent>('events', id, eventData);
      } else {
        // If offline, update locally
        const existingEvent = state.events.find(event => event.id === id);
        if (!existingEvent) {
          throw new Error(`Event with ID ${id} not found`);
        }
        
        updatedEvent = { ...existingEvent, ...eventData };
      }

      setState(prevState => ({
        ...prevState,
        events: prevState.events.map(event => 
          event.id === id ? updatedEvent : event
        )
      }));

      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  }, [state.events, state.isOnline]);

  const removeEvent = useCallback(async (id: string) => {
    try {
      if (state.isOnline) {
        // If online, delete through service
        await adminService.deleteItem('events', id);
      }

      setState(prevState => ({
        ...prevState,
        events: prevState.events.filter(event => event.id !== id)
      }));
    } catch (error) {
      console.error('Error removing event:', error);
      toast.error('Failed to remove event');
      throw error;
    }
  }, [state.isOnline]);

  // Location CRUD operations
  const getLocation = useCallback((id: string) => {
    return state.locations.find(location => location.id === id);
  }, [state.locations]);

  const addLocation = useCallback((locationData: { 
    name: string, 
    coordinates: [number, number], 
    description?: string, 
    category?: string 
  }) => {
    const newLocation = {
      ...locationData,
      id: `temp_${uuidv4()}`,
      isOpen: true
    };

    setState(prevState => ({
      ...prevState,
      locations: [...prevState.locations, newLocation]
    }));

    return newLocation;
  }, []);

  const updateLocation = useCallback((id: string, locationData: Partial<{
    name: string,
    coordinates: [number, number],
    description?: string,
    category?: string,
    isOpen?: boolean,
    imageUrl?: string
  }>) => {
    setState(prevState => ({
      ...prevState,
      locations: prevState.locations.map(location => 
        location.id === id ? { ...location, ...locationData } : location
      )
    }));
  }, []);

  const removeLocation = useCallback((id: string) => {
    setState(prevState => ({
      ...prevState,
      locations: prevState.locations.filter(location => location.id !== id)
    }));
  }, []);

  // Create context value with useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    updateAnimal,
    addAnimal,
    removeAnimal,
    getAnimal,
    updateEvent,
    addEvent,
    removeEvent,
    getEvent,
    updateLocation,
    addLocation,
    removeLocation,
    getLocation,
    syncData,
    setOnlineStatus
  }), [
    state,
    updateAnimal,
    addAnimal,
    removeAnimal,
    getAnimal,
    updateEvent,
    addEvent,
    removeEvent,
    getEvent,
    updateLocation,
    addLocation,
    removeLocation,
    getLocation,
    syncData,
    setOnlineStatus
  ]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};
