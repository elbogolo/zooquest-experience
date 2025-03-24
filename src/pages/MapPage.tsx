
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation, MapPin, Compass, X, RotateCcw, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import SearchBar from "../components/SearchBar";
import { Button } from "@/components/ui/button";

const zooLocations = {
  lion: {
    name: "Lion Enclosure",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    distance: "10 Min",
    directions: ["Head north from the main entrance", "Turn right at the food court", "The lion enclosure will be on your left"]
  },
  tiger: {
    name: "Tiger Territory",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    distance: "15 Min",
    directions: ["Head east from the main entrance", "Follow the path past the elephant enclosure", "Tiger Territory is ahead on the right"]
  },
  gorilla: {
    name: "Gorilla Habitat",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    distance: "20 Min",
    directions: ["Head west from the main entrance", "Take the jungle trail", "Follow signs to the Great Ape House"]
  },
  peacock: {
    name: "Peacock Area",
    image: "public/lovable-uploads/d65de9b2-e507-4511-a47c-4962de992a26.png",
    distance: "5 Min",
    directions: ["Head straight from the main entrance", "Look for the open garden area", "Peacocks roam freely in this area"]
  },
  crocodile: {
    name: "Crocodile Pond",
    image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
    distance: "12 Min",
    directions: ["Head southeast from the main entrance", "Follow the water trail", "The crocodile pond will be visible on your right"]
  },
  tortoise: {
    name: "Tortoise Enclosure",
    image: "public/lovable-uploads/009a33ba-77b2-49a3-86ae-0586197bf4ab.png",
    distance: "8 Min",
    directions: ["Head northeast from the main entrance", "Pass by the gift shop", "The tortoise enclosure is beyond the small hill"]
  },
  zebra: {
    name: "Zebra Grasslands",
    image: "public/lovable-uploads/c0779203-cebe-4f61-be65-f8939ee46040.png",
    distance: "18 Min",
    directions: ["Head northwest from the main entrance", "Follow the safari path", "The zebra grasslands will be on your left"]
  },
  shop: {
    name: "Gift Shop",
    image: "public/lovable-uploads/e75bf6ec-5927-4fae-9fff-7807edd185ad.png",
    distance: "5 Min",
    directions: ["Head east from the main entrance", "It's the large building with the green roof", "The gift shop is near the food court"]
  }
};

type LocationKey = keyof typeof zooLocations;

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const destinationId = searchParams.get('destination');
  const [search, setSearch] = useState("");
  const [showDirections, setShowDirections] = useState(!!destinationId);
  const [activeDirection, setActiveDirection] = useState(0);
  const [searchResults, setSearchResults] = useState<LocationKey[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const destination = destinationId ? zooLocations[destinationId as LocationKey] : null;

  useEffect(() => {
    if (destinationId) {
      setShowDirections(true);
      toast.success(`Directions to ${zooLocations[destinationId as LocationKey]?.name || 'destination'} loaded`);
    }
  }, [destinationId]);

  useEffect(() => {
    if (search.length > 1) {
      const results = Object.keys(zooLocations).filter((key) => 
        zooLocations[key as LocationKey].name.toLowerCase().includes(search.toLowerCase())
      ) as LocationKey[];
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setShowSearchResults(false);
    }
  }, [search]);

  const handleNavigateToLocation = (locationKey: LocationKey) => {
    setShowSearchResults(false);
    setSearch("");
    setShowDirections(true);
    setActiveDirection(0);
    
    // In a real app, we would navigate to this destination on the map
    toast.success(`Navigating to ${zooLocations[locationKey].name}`);
  };

  const handleGetCurrentLocation = () => {
    // In a real app, this would get the user's current location
    toast.info("Getting your current location...");
    
    // Simulate a delay
    setTimeout(() => {
      toast.success("Location updated");
    }, 1500);
  };

  const nextDirection = () => {
    if (destination && activeDirection < destination.directions.length - 1) {
      setActiveDirection(activeDirection + 1);
    } else {
      toast.success("You have reached your destination!");
    }
  };

  const prevDirection = () => {
    if (activeDirection > 0) {
      setActiveDirection(activeDirection - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="" showBackButton showSettings />
      
      <div className="h-screen w-full bg-gray-200 relative">
        <div className="absolute inset-0 bg-gray-200">
          <img
            src="public/lovable-uploads/f74294e2-bf7f-442d-ab97-78c98dcc394d.png"
            alt="Zoo Map"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute top-16 left-0 right-0 px-4 z-10">
          <SearchBar 
            placeholder="Where are you going to?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          {showSearchResults && (
            <div className="mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((key) => (
                <button
                  key={key}
                  onClick={() => handleNavigateToLocation(key)}
                  className="w-full px-4 py-3 flex items-center border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                    <img src={zooLocations[key].image} alt={zooLocations[key].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{zooLocations[key].name}</p>
                    <p className="text-xs text-gray-500">{zooLocations[key].distance} walk</p>
                  </div>
                  <MapPin className="w-5 h-5 text-zoo-primary ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="absolute bottom-32 right-4 flex flex-col gap-2">
          <button 
            onClick={handleGetCurrentLocation}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
          >
            <Compass className="w-5 h-5 text-zoo-primary" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-zoo-primary" />
          </button>
        </div>
        
        <div className="absolute bottom-1/3 left-1/4">
          <div className="relative">
            <div className="w-10 h-10 bg-zoo-primary rounded-full flex items-center justify-center shadow-lg">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-zoo-primary"></div>
          </div>
        </div>
        
        {destination && (
          <div className="absolute top-1/3 right-1/3">
            <div className="w-10 h-10 bg-white border-2 border-zoo-primary rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-zoo-primary" />
            </div>
          </div>
        )}
        
        {showDirections && destination && (
          <div className="absolute bottom-20 left-0 right-0 p-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center p-3 border-b border-gray-100">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-16 h-12 object-cover rounded-lg mr-3"
                />
                <div>
                  <h3 className="font-semibold">{destination.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {destination.distance} Left
                  </p>
                </div>
              </div>
              
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Step {activeDirection + 1} of {destination.directions.length}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={prevDirection}
                      disabled={activeDirection === 0}
                      className="h-6 px-2"
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={nextDirection}
                      className="h-6 px-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <p className="font-medium text-gray-800">
                  {destination.directions[activeDirection]}
                </p>
              </div>
              
              <div className="flex justify-between p-2">
                <button className="w-10 h-10 rounded-full text-zoo-primary hover:bg-zoo-secondary flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full text-zoo-primary hover:bg-zoo-secondary flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowDirections(false)}
                  className="w-10 h-10 rounded-full bg-zoo-primary text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default MapPage;
