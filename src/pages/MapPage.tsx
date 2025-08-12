import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BackButton from "@/components/BackButton";
import BottomNavbar from "@/components/BottomNavbar";
import SafeMap from "@/components/SafeMap";
import { AdminAnimal } from "@/types/admin";
import adminService from "@/services/adminService";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Locate,
  AlertCircle
} from "lucide-react";

// Helper function to format location for display and comparison
const formatLocationForDisplay = (location?: string | { lat: number; lng: number }): string => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  return `${location.lat}, ${location.lng}`;
};

const MapPage = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<AdminAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState<AdminAnimal | null>(null);
  const [filterByStatus, setFilterByStatus] = useState<string>("all");
  const [showDirections, setShowDirections] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadAnimals = async () => {
      try {
        setLoading(true);
        const allAnimals = await adminService.getItems('animals') as AdminAnimal[];
        setAnimals(allAnimals);
      } catch (error) {
        console.error("Error loading animals:", error);
        setError("Failed to load animal locations");
        toast.error("Failed to load map data");
      } finally {
        setLoading(false);
      }
    };

    loadAnimals();
  }, []);

  const filteredAnimals = animals.filter(animal => {
    const locationStr = formatLocationForDisplay(animal.location);
    const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.species?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         locationStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterByStatus === "all" || animal.status === filterByStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAnimalSelect = (animal: AdminAnimal) => {
    navigate(`/animal/${animal.id}`);
  };

  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
    toast.info(offlineMode ? "Online mode enabled" : "Offline mode enabled");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton />
        <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="w-full h-96" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton />
        <div className="container mx-auto px-4 py-6 pb-24">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      
      <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Zoo Map & Navigation
          </h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Simulate GPS location request
                toast.success("Location enabled - showing your position on the map");
              }}
            >
              <Locate className="h-4 w-4 mr-1" />
              My Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOfflineMode}
            >
              {offlineMode ? "Online Mode" : "Offline Mode"}
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search animals or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterByStatus}
                  onChange={(e) => setFilterByStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">All Animals</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Under observation">Under Observation</option>
                  <option value="Treatment required">In Treatment</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Map */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Navigation className="w-5 h-5 mr-2" />
                Interactive Navigation Map
              </span>
              <div className="text-sm font-normal text-gray-600">
                {filteredAnimals.length} animal{filteredAnimals.length !== 1 ? 's' : ''} shown
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SafeMap
              animals={filteredAnimals}
              selectedAnimal={selectedAnimal}
              onAnimalSelect={handleAnimalSelect}
              showDirections={showDirections}
              offlineMode={offlineMode}
            />
          </CardContent>
        </Card>

        {/* Map Statistics */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{animals.length}</div>
                <div className="text-sm text-muted-foreground">Total Animals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{new Set(animals.map(animal => formatLocationForDisplay(animal.location))).size}</div>
                <div className="text-sm text-muted-foreground">Zoo Areas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {animals.filter(a => a.status === 'Healthy').length}
                </div>
                <div className="text-sm text-muted-foreground">Healthy Animals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {filteredAnimals.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {searchQuery || filterByStatus !== 'all' ? 'Found' : 'Showing'}
                </div>
              </div>
            </div>
            
            {(searchQuery || filterByStatus !== 'all') && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Filters Active: 
                    {searchQuery && ` "${searchQuery}"`}
                    {filterByStatus !== 'all' && ` ${filterByStatus} status`}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery("");
                      setFilterByStatus("all");
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 h-auto p-1"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center gap-1"
                onClick={() => navigate("/visit-history")}
              >
                <Navigation className="h-5 w-5" />
                <span className="text-xs">Visit History</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center gap-1"
                onClick={() => navigate("/favorites")}
              >
                <MapPin className="h-5 w-5" />
                <span className="text-xs">My Favorites</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center gap-1"
                onClick={() => {
                  toast.success("Finding your location...");
                  // Simulate location finding
                  setTimeout(() => {
                    toast.success("You are near the Main Entrance!");
                  }, 1500);
                }}
              >
                <Locate className="h-5 w-5" />
                <span className="text-xs">Find Me</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center gap-1"
                onClick={() => navigate("/events")}
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs">Events Today</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default MapPage;
