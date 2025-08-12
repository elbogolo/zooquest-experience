import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geolocationService, LocationCoordinates } from '@/services/geolocationService';
import { toast } from 'sonner';
import { AdminAnimal } from '@/types/admin';

// Fix for default markers
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => void })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for animals
const createAnimalIcon = (status: string) => {
  const color = status === 'Healthy' ? '#22c55e' : status === 'Treatment required' ? '#ef4444' : '#f59e0b';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Extended type for animals with GPS coordinates
interface AnimalWithLocation extends AdminAnimal {
  latitude: number;
  longitude: number;
}

// Helper function to extract coordinates from animal location
const getAnimalCoordinates = (animal: AdminAnimal): { lat: number; lng: number } | null => {
  if (!animal.location) return null;
  
  // If location is already coordinates
  if (typeof animal.location === 'object' && animal.location.lat && animal.location.lng) {
    return { lat: animal.location.lat, lng: animal.location.lng };
  }
  
  // If location is a string, we need to map it to coordinates
  // In a real app, you'd have a database of area coordinates
  const locationMappings: Record<string, { lat: number; lng: number }> = {
    'Savanna Area': { lat: 5.589934 + 0.001, lng: -0.116755 + 0.001 },
    'Elephant Habitat': { lat: 5.589934 - 0.0015, lng: -0.116755 + 0.0015 },
    'Giraffe Enclosure': { lat: 5.589934 + 0.002, lng: -0.116755 - 0.001 },
    'Primate House': { lat: 5.589934 - 0.001, lng: -0.116755 - 0.001 },
    'Reptile Garden': { lat: 5.589934 + 0.0015, lng: -0.116755 + 0.002 },
    'Bird Aviary': { lat: 5.589934 - 0.002, lng: -0.116755 + 0.0005 },
  };
  
  if (typeof animal.location === 'string' && locationMappings[animal.location]) {
    return locationMappings[animal.location];
  }
  
  return null;
};

// Sample animal locations (fallback for development)
const sampleAnimals: AnimalWithLocation[] = [
  {
    id: '1',
    name: 'Leo the Lion',
    species: 'African Lion',
    status: 'Healthy',
    location: { lat: 5.589934 + 0.001, lng: -0.116755 + 0.001 },
    latitude: 5.589934 + 0.001,
    longitude: -0.116755 + 0.001,
    lastCheckup: '2024-01-15',
    nextCheckup: '2024-02-15',
    dietaryNeeds: 'Meat',
    caretaker: 'John Doe',
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: '2',
    name: 'Ella the Elephant',
    species: 'African Elephant',
    status: 'Under observation',
    location: { lat: 5.589934 - 0.0015, lng: -0.116755 + 0.0015 },
    latitude: 5.589934 - 0.0015,
    longitude: -0.116755 + 0.0015,
    lastCheckup: '2024-01-10',
    nextCheckup: '2024-02-10',
    dietaryNeeds: 'Vegetation',
    caretaker: 'Jane Smith',
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: '3',
    name: 'Ghana the Giraffe',
    species: 'West African Giraffe',
    status: 'Scheduled for checkup',
    location: { lat: 5.589934 + 0.002, lng: -0.116755 - 0.001 },
    latitude: 5.589934 + 0.002,
    longitude: -0.116755 - 0.001,
    lastCheckup: '2024-01-12',
    nextCheckup: '2024-02-12',
    dietaryNeeds: 'Leaves and branches',
    caretaker: 'Dr. Kwame',
    imageUrl: '/api/placeholder/300/200'
  }
];

// Default location - Accra Zoo, Ghana coordinates
const fallbackLocation: LocationCoordinates = {
  latitude: 5.589934, // Accra Zoo approximate coordinates
  longitude: -0.116755,
  accuracy: 0,
  timestamp: Date.now()
};

interface SimpleTestMapProps {
  animals?: AdminAnimal[];
}

const SimpleTestMap: React.FC<SimpleTestMapProps> = ({ animals: propAnimals }) => {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalWithLocation | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeInstructions, setRouteInstructions] = useState<string[]>([]);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<number>(0);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Convert admin animals to animals with coordinates
  const animals: AnimalWithLocation[] = React.useMemo(() => {
    if (!propAnimals) return sampleAnimals;
    
    return propAnimals.map(animal => {
      const coords = getAnimalCoordinates(animal);
      if (coords) {
        return {
          ...animal,
          latitude: coords.lat,
          longitude: coords.lng
        } as AnimalWithLocation;
      }
      return null;
    }).filter(Boolean) as AnimalWithLocation[];
  }, [propAnimals]);

  // Function to get a simple location description based on coordinates
  const getLocationDescription = (lat: number, lng: number): string => {
    // Simple coordinate-based location description
    if (Math.abs(lat - 5.589934) < 0.01 && Math.abs(lng - (-0.116755)) < 0.01) {
      return 'Accra, Ghana (Near Zoo)';
    }
    // Determine general region based on coordinates
    if (lat > 5 && lat < 11 && lng > -4 && lng < 2) {
      return 'Ghana Region';
    }
    return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  // Function to get real turn-by-turn directions using OSRM
  const getRouteDirections = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
    setLoadingRoute(true);
    try {
      // Use OSRM public API for routing (walking profile for zoo navigation)
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/walking/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get route directions');
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Extract route coordinates
        const coordinates: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        setRouteCoordinates(coordinates);
        
        // Extract route info
        setRouteDistance(route.distance); // in meters
        setRouteDuration(route.duration); // in seconds
        
        // Extract turn-by-turn instructions
        const instructions: string[] = [];
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          route.legs[0].steps.forEach((step: { maneuver?: { instruction?: string } }, index: number) => {
            if (step.maneuver && step.maneuver.instruction) {
              instructions.push(`${index + 1}. ${step.maneuver.instruction}`);
            }
          });
        }
        setRouteInstructions(instructions);
        
        return true;
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Routing error:', error);
      toast.error('Could not get directions. Using direct path.');
      
      // Fallback to direct line if routing fails
      setRouteCoordinates([
        [startLat, startLng],
        [endLat, endLng]
      ]);
      setRouteInstructions(['Walk directly to the destination']);
      setRouteDistance(Math.sqrt(
        Math.pow((endLat - startLat) * 111000, 2) +
        Math.pow((endLng - startLng) * 111000, 2)
      ));
      setRouteDuration(routeDistance / 1.4); // Assume 1.4 m/s walking speed
      
      return false;
    } finally {
      setLoadingRoute(false);
    }
  };

  // Function to show directions to an animal
  const showDirectionsToAnimal = async (animal: AnimalWithLocation) => {
    if (!userLocation) {
      toast.error('Your location is not available');
      return;
    }

    setSelectedAnimal(animal);
    setShowDirections(true);
    
    toast.info(`Getting directions to ${animal.name}...`);
    
    const success = await getRouteDirections(
      userLocation.latitude,
      userLocation.longitude,
      animal.latitude,
      animal.longitude
    );
    
    if (success) {
      toast.success(`Turn-by-turn directions to ${animal.name} ready!`);
    }
  };

  // Function to hide directions
  const hideDirections = () => {
    setSelectedAnimal(null);
    setShowDirections(false);
    setRouteCoordinates([]);
    setRouteInstructions([]);
    setRouteDistance(0);
    setRouteDuration(0);
  };

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Request permissions first
        const hasPermission = await geolocationService.requestPermissions();
        if (!hasPermission) {
          console.log('Location permission denied, using Accra Zoo as fallback');
          setUserLocation(fallbackLocation);
          setError('Location permission denied. Showing Accra Zoo location.');
          setLocationName('Accra Zoo, Ghana (Default)');
          setLoading(false);
          return;
        }

        // Get current location
        const location = await geolocationService.getCurrentLocation();
        setUserLocation(location);
        
        // Get simple location description (no external API call)
        const description = getLocationDescription(location.latitude, location.longitude);
        setLocationName(description);
        
        toast.success(`GPS Location found: ${description}`);
      } catch (error) {
        console.error('Location error:', error);
        setError('Could not get your GPS location. Showing Accra Zoo location.');
        setUserLocation(fallbackLocation);
        setLocationName('Accra Zoo, Ghana (Fallback)');
        toast.error('Using Accra Zoo as default location');
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '400px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div style={{ marginBottom: '10px' }}>🌍 Getting your GPS location...</div>
        <div style={{ fontSize: '12px', color: '#666' }}>This may take a few seconds</div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div>❌ Location not available</div>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', width: '100%' }}>
      {/* Location info bar */}
      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-sm border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <div>
          <div className="font-bold">
            📍 {error ? 'Default Location (Accra Zoo)' : 'Your GPS Location'}
          </div>
          <div className="text-blue-700 dark:text-blue-200">{locationName}</div>
          <div className="text-blue-600 dark:text-blue-300">
            Coordinates: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
            {userLocation.accuracy && userLocation.accuracy > 0 && (
              <span> | Accuracy: ±{userLocation.accuracy.toFixed(0)}m</span>
            )}
          </div>
          {showDirections && selectedAnimal && (
            <div className="mt-1 text-green-600 dark:text-green-400">
              🧭 {loadingRoute ? 'Getting directions...' : `Route to ${selectedAnimal.name}: ${routeDistance.toFixed(0)}m (${formatDuration(routeDuration)})`}
            </div>
          )}
        </div>
        {showDirections && selectedAnimal && (
          <div>
            <button
              onClick={hideDirections}
              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium"
            >
              Hide Directions
            </button>
          </div>
        )}
      </div>

      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={16}
        style={{ height: 'calc(100% - 60px)', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker with accuracy circle */}
        <Marker position={[userLocation.latitude, userLocation.longitude]}>
          <Popup>
            <div>
              <strong>🧑‍💼 {error ? 'Accra Zoo (Default)' : 'You are here!'}</strong>
              <br />
              <small>{locationName}</small>
              <br />
              <strong>Coordinates:</strong>
              <br />
              Lat: {userLocation.latitude.toFixed(6)}
              <br />
              Lng: {userLocation.longitude.toFixed(6)}
              {userLocation.accuracy && userLocation.accuracy > 0 && (
                <>
                  <br />
                  <strong>GPS Accuracy:</strong> ±{userLocation.accuracy.toFixed(0)} meters
                </>
              )}
            </div>
          </Popup>
        </Marker>

        {/* GPS Accuracy circle */}
        {userLocation.accuracy && userLocation.accuracy > 0 && (
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={userLocation.accuracy}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
          />
        )}

        {/* Directions line */}
        {showDirections && selectedAnimal && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
          />
        )}

        {/* Animal markers */}
        {animals.map((animal) => (
          <Marker
            key={animal.id}
            position={[animal.latitude, animal.longitude]}
            icon={createAnimalIcon(animal.status)}
          >
            <Popup>
              <div>
                <strong>🦁 {animal.name}</strong>
                <br />
                <em>{animal.species}</em>
                <br />
                📍 {typeof animal.location === 'string' ? animal.location : `${animal.latitude.toFixed(4)}, ${animal.longitude.toFixed(4)}`}
                <br />
                ❤️ Status: <span style={{ color: animal.status === 'Healthy' ? '#22c55e' : animal.status === 'Treatment required' ? '#ef4444' : '#f59e0b' }}>
                  {animal.status}
                </span>
                <br />
                👨‍⚕️ Caretaker: {animal.caretaker}
                <br />
                <small>
                  Distance: ~{(
                    Math.sqrt(
                      Math.pow((animal.latitude - userLocation.latitude) * 111000, 2) +
                      Math.pow((animal.longitude - userLocation.longitude) * 111000, 2)
                    )
                  ).toFixed(0)}m from your location
                </small>
                <br />
                <button
                  onClick={() => showDirectionsToAnimal(animal)}
                  disabled={loadingRoute}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: loadingRoute ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: loadingRoute ? 'not-allowed' : 'pointer',
                    width: '100%'
                  }}
                >
                  {loadingRoute ? '⏳ Getting Directions...' : '🧭 Show Directions'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Route instructions */}
      {showDirections && selectedAnimal && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg" style={{
          padding: '12px',
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          zIndex: '1000'
        }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              🧭 Directions to {selectedAnimal.name}
            </h4>
            <button
              onClick={hideDirections}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
            >
              ✕ Close
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
              📏 <strong>{routeDistance.toFixed(0)}m</strong>
            </span>
            <span className="flex items-center gap-1">
              ⏱️ <strong>{formatDuration(routeDuration)}</strong>
            </span>
          </div>

          <div className="max-h-32 overflow-y-auto">
            <ul className="space-y-2">
              {routeInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span>{instruction.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestMap;
