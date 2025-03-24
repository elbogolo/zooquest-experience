import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation, MapPin, Compass, X, RotateCcw } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import SearchBar from "../components/SearchBar";

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
  }
};

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const destinationId = searchParams.get('destination');
  const [search, setSearch] = useState("");
  const [showDirections, setShowDirections] = useState(!!destinationId);
  const [activeDirection, setActiveDirection] = useState(0);
  
  const destination = destinationId ? zooLocations[destinationId as keyof typeof zooLocations] : null;

  useEffect(() => {
    if (destinationId) {
      setShowDirections(true);
    }
  }, [destinationId]);

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
        
        <div className="absolute top-16 left-0 right-0 px-4">
          <SearchBar 
            placeholder="Where are you going to?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="absolute bottom-32 right-4 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
            <Compass className="w-5 h-5 text-zoo-primary" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-gray-700" />
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
