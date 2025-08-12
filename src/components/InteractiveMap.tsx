import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminAnimal } from "@/types/admin";
import { userService } from "@/services/userService";
import {
  MapPin,
  Navigation,
  Heart,
  Clock,
  Users,
  Zap,
  TreePine,
  Fish,
  Locate
} from "lucide-react";

interface InteractiveMapProps {
  animals: AdminAnimal[];
  selectedLocation?: string;
  onAnimalSelect?: (animal: AdminAnimal) => void;
}

// Mock zoo layout with real coordinates (simulating a real zoo)
const zooAreas = {
  "African Safari": {
    coordinates: { x: 20, y: 30 },
    color: "bg-orange-500",
    icon: TreePine,
    description: "Experience the wild savannas"
  },
  "Asian Gardens": {
    coordinates: { x: 60, y: 25 },
    color: "bg-green-500", 
    icon: TreePine,
    description: "Peaceful gardens with Asian wildlife"
  },
  "Aquatic Center": {
    coordinates: { x: 40, y: 60 },
    color: "bg-blue-500",
    icon: Fish,
    description: "Underwater world exploration"
  },
  "Children's Zoo": {
    coordinates: { x: 75, y: 70 },
    color: "bg-purple-500",
    icon: Heart,
    description: "Interactive experiences for kids"
  },
  "Big Cats": {
    coordinates: { x: 25, y: 70 },
    color: "bg-yellow-500",
    icon: Zap,
    description: "Majestic predators"
  },
  "Primate House": {
    coordinates: { x: 80, y: 40 },
    color: "bg-red-500",
    icon: Users,
    description: "Our closest relatives"
  }
};

// Helper function to format location for display and comparison
const formatLocationForDisplay = (location?: string | { lat: number; lng: number }): string => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  return `${location.lat}, ${location.lng}`;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  animals, 
  selectedLocation, 
  onAnimalSelect 
}) => {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(selectedLocation || null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load user favorites
    const loadFavorites = async () => {
      try {
        const userFavorites = await userService.getFavorites();
        setFavorites(userFavorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Simulate user location (in a real app, this would use GPS)
  useEffect(() => {
    const simulateUserLocation = () => {
      setUserLocation({ x: 50, y: 45 }); // Center of the zoo
    };
    simulateUserLocation();
  }, []);

  const getAnimalsInArea = (areaName: string) => {
    return animals.filter(animal => {
      const locationStr = formatLocationForDisplay(animal.location);
      return locationStr.toLowerCase().includes(areaName.toLowerCase()) ||
        areaName.toLowerCase().includes(locationStr.toLowerCase());
    });
  };

  const handleAreaClick = (areaName: string) => {
    setSelectedArea(selectedArea === areaName ? null : areaName);
  };

  const handleAnimalClick = (animal: AdminAnimal) => {
    if (onAnimalSelect) {
      onAnimalSelect(animal);
    }
  };

  const getDirections = (targetArea: string) => {
    const area = zooAreas[targetArea as keyof typeof zooAreas];
    if (area && userLocation) {
      // Simulate GPS navigation
      const distance = Math.sqrt(
        Math.pow(area.coordinates.x - userLocation.x, 2) + 
        Math.pow(area.coordinates.y - userLocation.y, 2)
      );
      const walkingTime = Math.max(1, Math.round(distance / 10)); // Simulate walking time
      
      return {
        distance: Math.round(distance * 10), // Convert to meters
        walkingTime
      };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Zoo Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden border-2 border-green-300">
            {/* Map Background Elements */}
            <div className="absolute inset-0">
              {/* Paths */}
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  d="M 10 45 Q 50 20 90 45 Q 50 70 10 45" 
                  stroke="#8B5CF6" 
                  strokeWidth="1" 
                  fill="none" 
                  strokeDasharray="2,2"
                  opacity="0.6"
                />
                <path 
                  d="M 45 10 Q 20 50 45 90 Q 70 50 45 10" 
                  stroke="#8B5CF6" 
                  strokeWidth="1" 
                  fill="none" 
                  strokeDasharray="2,2"
                  opacity="0.6"
                />
              </svg>

              {/* Area Markers */}
              {Object.entries(zooAreas).map(([areaName, area]) => {
                const IconComponent = area.icon;
                const animalsInArea = getAnimalsInArea(areaName);
                const isSelected = selectedArea === areaName;
                const isHovered = hoveredArea === areaName;
                
                return (
                  <div
                    key={areaName}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                      isSelected || isHovered ? 'scale-125 z-20' : 'z-10'
                    }`}
                    style={{
                      left: `${area.coordinates.x}%`,
                      top: `${area.coordinates.y}%`
                    }}
                    onMouseEnter={() => setHoveredArea(areaName)}
                    onMouseLeave={() => setHoveredArea(null)}
                    onClick={() => handleAreaClick(areaName)}
                  >
                    <div className={`w-8 h-8 rounded-full ${area.color} flex items-center justify-center text-white shadow-lg ${
                      isSelected ? 'ring-4 ring-white' : ''
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    {animalsInArea.length > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 text-xs bg-white text-gray-800"
                      >
                        {animalsInArea.length}
                      </Badge>
                    )}
                    
                    {/* Area Label */}
                    {(isHovered || isSelected) && (
                      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap z-30">
                        {areaName}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* User Location */}
              {userLocation && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{
                    left: `${userLocation.x}%`,
                    top: `${userLocation.y}%`
                  }}
                >
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse">
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25"></div>
                  </div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    You are here
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(zooAreas).map(([areaName, area]) => {
              const IconComponent = area.icon;
              return (
                <div
                  key={areaName}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedArea === areaName 
                      ? 'bg-blue-100 border-2 border-blue-500' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleAreaClick(areaName)}
                >
                  <div className={`w-4 h-4 rounded-full ${area.color} flex items-center justify-center`}>
                    <IconComponent className="h-2 w-2 text-white" />
                  </div>
                  <span className="text-xs font-medium truncate">{areaName}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Area Details */}
      {selectedArea && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {React.createElement(zooAreas[selectedArea as keyof typeof zooAreas].icon, { className: "h-5 w-5" })}
                {selectedArea}
              </CardTitle>
              {userLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const directions = getDirections(selectedArea);
                    if (directions) {
                      alert(`Walking directions: ${directions.distance}m away, approximately ${directions.walkingTime} minutes walk`);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {zooAreas[selectedArea as keyof typeof zooAreas].description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Animals in this area:</h4>
              {getAnimalsInArea(selectedArea).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getAnimalsInArea(selectedArea).map((animal) => (
                    <div
                      key={animal.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleAnimalClick(animal)}
                    >
                      <img
                        src={animal.imageUrl || "/lovable-uploads/default-animal.jpg"}
                        alt={animal.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-sm truncate">{animal.name}</h5>
                          {favorites.includes(animal.id) && (
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{animal.species}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            animal.status === 'Healthy' ? 'bg-green-500' : 
                            animal.status === 'Under observation' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-500 capitalize">
                            {animal.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No animals currently in this area.</p>
              )}
              
              {/* Navigation Info */}
              {userLocation && getDirections(selectedArea) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Locate className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Distance:</span>
                      <span>{getDirections(selectedArea)?.distance}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Walking time:</span>
                      <span>{getDirections(selectedArea)?.walkingTime} min</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveMap;
