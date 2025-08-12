import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import BottomNavbar from "@/components/BottomNavbar";
import { AdminAnimal, AdminEvent } from "@/types/admin";
import adminService from "@/services/adminService";
import { eventService } from "@/services/eventService";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { 
  Bookmark, 
  Navigation, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Combined animal data type
interface DetailedAnimal extends AdminAnimal {
  scientificName: string;
  overview: string;
  details: string;
  conservation: string;
  relatedEvents: AdminEvent[];
}

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [animal, setAnimal] = useState<DetailedAnimal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(() => {
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem('zooFavorites');
    if (storedFavorites) {
      const favorites = JSON.parse(storedFavorites);
      return favorites.includes(id);
    }
    return false;
  });
  const [visitStartTime] = useState(Date.now());

  // Helper function to format location for display
  const formatLocationForDisplay = (location: string | { lat: number; lng: number } | undefined | null): string => {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
      return `${location.lat}, ${location.lng}`;
    }
    return 'Unknown';
  };

  // Fetch the animal data
  useEffect(() => {
    // Generate comprehensive animal details from backend data
    const generateAnimalDetails = async (adminAnimal: AdminAnimal): Promise<DetailedAnimal> => {
      const scientificName = adminAnimal.species || 'Species information being updated';
      
      const overview = adminAnimal.dietaryNeeds 
        ? `Meet ${adminAnimal.name}, a wonderful ${adminAnimal.species || 'animal'} currently residing at ${formatLocationForDisplay(adminAnimal.location)}. ${adminAnimal.dietaryNeeds ? `Their dietary needs include ${adminAnimal.dietaryNeeds}.` : ''} ${adminAnimal.caretaker ? `They are under the excellent care of ${adminAnimal.caretaker}.` : ''}`
        : `${adminAnimal.name} is a ${adminAnimal.species || 'magnificent animal'} at our zoo. Visit them at ${formatLocationForDisplay(adminAnimal.location)} to learn more about this fascinating creature.`;
      
      const details = [
        `${adminAnimal.name} lives in our ${formatLocationForDisplay(adminAnimal.location)}.`,
        adminAnimal.species ? `As a ${adminAnimal.species}, they have unique characteristics that make them special.` : '',
        adminAnimal.dietaryNeeds ? `Their diet consists of ${adminAnimal.dietaryNeeds}.` : '',
        adminAnimal.caretaker ? `${adminAnimal.caretaker} is their dedicated caretaker who ensures their wellbeing.` : '',
        adminAnimal.nextCheckup ? `Their next health checkup is scheduled for ${new Date(adminAnimal.nextCheckup).toLocaleDateString()}.` : ''
      ].filter(Boolean).join(' ');
      
      const conservation = adminAnimal.status === 'Healthy' 
        ? `${adminAnimal.name} is in excellent health and is part of our ongoing conservation efforts. We are committed to providing the best care and contributing to the preservation of their species.`
        : `${adminAnimal.name} is currently receiving special attention as part of our comprehensive care program. Our veterinary team is dedicated to ensuring their wellbeing and recovery.`;
      
      // Fetch real events related to this animal's location
      let relatedEvents: AdminEvent[] = [];
      try {
        const allEvents = await eventService.getEvents();
        // Filter events by location or those that might be related to this animal
        const animalLocationStr = formatLocationForDisplay(adminAnimal.location).toLowerCase();
        relatedEvents = allEvents.filter(event => 
          event.location.toLowerCase().includes(animalLocationStr) ||
          event.title.toLowerCase().includes(adminAnimal.species?.toLowerCase() || '') ||
          event.title.toLowerCase().includes(adminAnimal.name.toLowerCase()) ||
          event.location.toLowerCase() === 'main zoo area' // General events
        ).slice(0, 3); // Show max 3 events
      } catch (error) {
        console.error('Error fetching related events:', error);
      }
      
      return {
        ...adminAnimal,
        scientificName,
        overview,
        details,
        conservation,
        relatedEvents
      };
    };

    const fetchAnimalData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const adminAnimal = await adminService.getItem('animals', id) as AdminAnimal;
        
        if (!adminAnimal) {
          setError('Animal not found');
          setLoading(false);
          return;
        }
        
        // Generate detailed animal information from backend data
        const detailedAnimal = await generateAnimalDetails(adminAnimal);
        
        setAnimal(detailedAnimal);
      } catch (err) {
        console.error('Error fetching animal:', err);
        setError('Failed to load animal data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimalData();
  }, [id]);

  // Record visit when component unmounts or user navigates away
  useEffect(() => {
    const recordVisit = async () => {
      if (animal && userService.getCurrentUser()) {
        const visitDuration = Math.round((Date.now() - visitStartTime) / 1000 / 60); // in minutes
        if (visitDuration > 0) { // Only record if user spent at least a minute
          try {
            await userService.recordVisit(
              animal.id,
              animal.name,
              animal.species || 'Unknown',
              visitDuration
            );
          } catch (error) {
            console.error('Error recording visit:', error);
          }
        }
      }
    };

    return () => {
      recordVisit();
    };
  }, [animal, visitStartTime]);

  const toggleFavorite = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    // Update localStorage
    const storedFavorites = localStorage.getItem('zooFavorites');
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    if (newFavoriteState) {
      if (!favorites.includes(id)) {
        favorites.push(id);
        toast.success(`${animal?.name} added to favorites!`);
      }
    } else {
      favorites = favorites.filter((fav: string) => fav !== id);
      toast.success(`${animal?.name} removed from favorites`);
    }
    
    localStorage.setItem('zooFavorites', JSON.stringify(favorites));
  };

  const navigateToMap = () => {
    if (animal?.location) {
      // Navigate to map with location parameter
      const locationStr = formatLocationForDisplay(animal.location);
      navigate(`/map?location=${encodeURIComponent(locationStr)}`);
      toast.success(`Navigate to ${locationStr}`);
    } else {
      toast.error('Location information not available');
    }
  };

  const handleEventClick = (event: AdminEvent) => {
    // Navigate to event detail page or show event information
    navigate(`/events`);
    toast.success(`Opening events page`);
  };

  const addEventToSchedule = (event: AdminEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add to personal schedule (localStorage for now)
    const storedSchedule = localStorage.getItem('zooSchedule');
    const schedule = storedSchedule ? JSON.parse(storedSchedule) : [];
    
    if (!schedule.find((item: AdminEvent) => item.id === event.id)) {
      schedule.push(event);
      localStorage.setItem('zooSchedule', JSON.stringify(schedule));
      toast.success(`"${event.title}" added to your schedule`);
    } else {
      toast.info(`"${event.title}" is already in your schedule`);
    }
  };

  const shareAnimal = () => {
    if (navigator.share && animal) {
      navigator.share({
        title: `Meet ${animal.name}`,
        text: `Check out ${animal.name}, a ${animal.species} at the zoo!`,
        url: window.location.href,
      }).catch(() => {
        // Fallback for browsers that don't support Web Share API
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="relative h-[40vh] bg-muted">
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between">
            <BackButton color="default" />
          </div>
          <Skeleton className="w-full h-full" />
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="space-y-1 pt-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  // Show error state
  if (error || !animal) {
    return (
      <div className="min-h-screen pb-20 bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Animal not found'}
          </AlertDescription>
          <Button 
            onClick={() => navigate('/search')} 
            className="mt-3 w-full"
            variant="outline"
          >
            Browse Animals
          </Button>
        </Alert>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header Image */}
      <div className="relative h-[40vh]">
        <img 
          src={animal.imageUrl || '/api/placeholder/400/300'} 
          alt={animal.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('/api/placeholder/400/300')) {
              target.src = '/api/placeholder/400/300';
            }
          }}
        />
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between">
          <BackButton color="default" />
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
              onClick={shareAnimal}
            >
              <Heart size={14} />
            </Button>
          </div>
        </div>
        
        {/* Animal Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h1 className="text-xl font-semibold text-white mb-1">{animal.name}</h1>
          <p className="text-xs text-white/80">{animal.scientificName}</p>
          <div className="flex items-center gap-2 mt-1">
            <MapPin size={12} className="text-white/80" />
            <span className="text-xs text-white/80">{formatLocationForDisplay(animal.location)}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              animal.status === 'Healthy' 
                ? 'bg-green-500/80 text-white' 
                : animal.status === 'Under observation' 
                ? 'bg-yellow-500/80 text-black'
                : 'bg-red-500/80 text-white'
            }`}>
              {animal.status}
            </span>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="flex">
          {[
            { id: "overview", label: "Overview" },
            { id: "details", label: "Details" },
            { id: "conservation", label: "Conservation" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-foreground/80 leading-relaxed">{animal.overview}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-medium text-foreground mb-1">Species</h3>
                  <p className="text-xs text-foreground/80 bg-secondary/10 px-2 py-1 rounded">{animal.species || 'Not specified'}</p>
                </div>
                
                {animal.caretaker && (
                  <div>
                    <h3 className="text-xs font-medium text-foreground mb-1">Primary Caretaker</h3>
                    <p className="text-xs text-foreground/80 bg-secondary/10 px-2 py-1 rounded">{animal.caretaker}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-medium text-foreground mb-1">Health Status</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    animal.status === 'Healthy' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : animal.status === 'Under observation' 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {animal.status}
                  </span>
                </div>
                
                {animal.nextCheckup && (
                  <div>
                    <h3 className="text-xs font-medium text-foreground mb-1">Next Checkup</h3>
                    <p className="text-xs text-foreground/80 bg-secondary/10 px-2 py-1 rounded">
                      {new Date(animal.nextCheckup).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {animal.dietaryNeeds && (
              <div>
                <h3 className="text-xs font-medium text-foreground mb-1">Dietary Needs</h3>
                <p className="text-xs text-foreground/80 bg-secondary/10 px-2 py-1 rounded">{animal.dietaryNeeds}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="animate-fade-in">
            <p className="text-xs text-foreground/80 leading-relaxed">{animal.details}</p>
          </div>
        )}

        {activeTab === "conservation" && (
          <div className="animate-fade-in">
            <p className="text-xs text-foreground/80 leading-relaxed">{animal.conservation}</p>
          </div>
        )}
      </div>

      {/* Related Events Section */}
      {animal.relatedEvents && animal.relatedEvents.length > 0 && (
        <div className="px-4 mt-3">
          <h3 className="text-xs font-medium text-foreground mb-2">Related Events</h3>
          <div className="space-y-2">
            {animal.relatedEvents.map((event) => (
              <div 
                key={event.id} 
                className="p-3 bg-background rounded border border-border hover:bg-accent transition-colors cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-xs font-medium text-foreground mb-1">{event.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-foreground/60">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={10} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary text-xs h-6 px-2 ml-2" 
                    onClick={(e) => addEventToSchedule(event, e)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 flex gap-3 p-4">
        <Button 
          onClick={toggleFavorite}
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2 h-8 text-xs"
        >
          <Bookmark className={isFavorite ? "fill-primary" : ""} size={14} />
          <span>{isFavorite ? 'Saved' : 'Add to List'}</span>
        </Button>
        
        <Button 
          onClick={navigateToMap} 
          variant="default" 
          className="flex-1 flex items-center justify-center gap-2 h-8 text-xs"
        >
          <Navigation size={14} />
          <span>Visit Now</span>
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default AnimalDetail;
