
import { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface UseUserMarkerProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  isLoaded: boolean;
  initialUserLocation: [number, number];
}

interface UseUserMarkerReturn {
  userLocation: [number, number];
  setUserLocation: React.Dispatch<React.SetStateAction<[number, number]>>;
  updateUserLocation: () => void;
}

export const useUserMarker = ({
  map,
  isLoaded,
  initialUserLocation
}: UseUserMarkerProps): UseUserMarkerReturn => {
  const [userLocation, setUserLocation] = useState<[number, number]>(initialUserLocation);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  // Add user marker
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const userElement = document.createElement('div');
    userElement.className = 'user-marker';
    userElement.innerHTML = `
      <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation text-white"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      </div>
      <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-blue-600"></div>
    `;
    
    userMarker.current = new mapboxgl.Marker({ element: userElement })
      .setLngLat(userLocation)
      .addTo(map.current);

    return () => {
      if (userMarker.current) {
        userMarker.current.remove();
      }
    };
  }, [isLoaded, map]);

  // Update user marker when location changes
  useEffect(() => {
    if (userMarker.current) {
      userMarker.current.setLngLat(userLocation);
    }
  }, [userLocation]);

  // Function to update user location (simulated)
  const updateUserLocation = () => {
    if (!map.current || !userMarker.current) return;
    
    // Generate a slightly randomized location
    const newLocation: [number, number] = [
      userLocation[0] + (Math.random() * 0.001 - 0.0005),
      userLocation[1] + (Math.random() * 0.001 - 0.0005)
    ];
    
    setUserLocation(newLocation);
  };

  return {
    userLocation,
    setUserLocation,
    updateUserLocation
  };
};
