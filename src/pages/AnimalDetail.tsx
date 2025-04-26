
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Navigation, 
  Share,
  Bookmark,
  Info,
  AlertCircle
} from "lucide-react";
import BottomNavbar from "../components/BottomNavbar";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";
import { AdminAnimal } from "@/types/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Animal detail information - maps basic admin animal data to full detailed info
// This is used as a fallback for existing animals and as enhancement data for admin-added animals
const animalEnhancementData: Record<string, Partial<DetailedAnimal>> = {
  lion: {
    scientificName: "Panthera Leo",
    image: "lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    overview: "Lions are the second largest big cat species in the world (behind tigers). Known as the 'king of the jungle', lions are a symbol of strength and courage. They are highly social compared to other cat species, living in groups called 'prides'.",
    details: "Adult male lions are easily recognized by their manes, which make the animal's head and neck appear larger, providing an excellent intimidation display. Lions typically inhabit grasslands and savannas, but may also be found in dense bush and woodlands.",
    conservation: "Lions are listed as vulnerable on the IUCN Red List. Their population is declining due to habitat loss, human-wildlife conflict, and poaching. Conservation efforts include protected areas, anti-poaching initiatives, and community-based conservation programs.",
    feedingTimes: ["10:00 AM", "4:00 PM"],
    events: ["Lion Talk - 11:30 AM", "Big Cat Feeding - 3:00 PM"]
  },
  tiger: {
    scientificName: "Panthera Tigris",
    image: "lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    overview: "Tigers are the largest cat species in the world, known for their distinctive orange coat with black stripes. Each tiger's stripes are unique, like human fingerprints. They are powerful apex predators that play a crucial role in maintaining ecosystem balance.",
    details: "Tigers are solitary animals that require large territories to hunt and live. They are excellent swimmers and can swim up to 6 kilometers at a stretch. Tigers have exceptional night vision, being able to see six times better than humans in the dark.",
    conservation: "Tigers are endangered, with only about 3,900 remaining in the wild. Major threats include poaching, habitat loss, and human-wildlife conflict. Conservation efforts include anti-poaching patrols, habitat protection, and captive breeding programs.",
    feedingTimes: ["9:30 AM", "3:30 PM"],
    events: ["Tiger Talk - 2:00 PM", "Enrichment Activity - 11:00 AM"]
  },
  gorilla: {
    scientificName: "Gorilla Gorilla",
    image: "lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    overview: "Gorillas are the largest living primates and the next closest living relatives to humans after chimpanzees and bonobos. They are ground-dwelling herbivores that inhabit the forests of central Sub-Saharan Africa.",
    details: "Gorillas live in groups called troops, led by a dominant male known as a silverback. They have unique nose prints, which are used for identification. Despite their intimidating appearance, gorillas are generally peaceful and shy.",
    conservation: "All gorilla species are endangered, primarily due to habitat destruction, poaching, and disease. Conservation efforts include protected areas, anti-poaching measures, and ecotourism initiatives.",
    feedingTimes: ["10:30 AM", "2:30 PM"],
    events: ["Gorilla Talk - 12:00 PM", "Feeding Time - 2:30 PM"]
  },
  crocodile: {
    scientificName: "Crocodylus Niloticus",
    image: "lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
    overview: "Crocodiles are large aquatic reptiles that live throughout the tropics in Africa, Asia, the Americas, and Australia. They are ambush predators, capable of taking down large prey with their powerful jaws and teeth.",
    details: "Crocodiles can live up to 70-100 years in the wild. They have a four-chambered heart, like mammals, which makes them more capable of extended exertion than other reptiles. Despite their size, they can move quickly in short bursts.",
    conservation: "Some crocodile species are critically endangered, while others have healthy populations. Threats include habitat loss, pollution, and hunting. Conservation efforts include breeding programs, habitat protection, and sustainable harvesting in some areas.",
    feedingTimes: ["11:00 AM", "4:30 PM"],
    events: ["Reptile Talk - 1:30 PM", "Feeding Demonstration - 4:30 PM"]
  },
  elephant: {
    scientificName: "Loxodonta africana",
    image: "lovable-uploads/elephant.png",
    overview: "Elephants are the largest existing land animals. Three living species are currently recognised: the African bush elephant, the African forest elephant, and the Asian elephant.",
    details: "Elephants are known for their large ears, tusks made of ivory, and their long trunk, which is a fusion of nose and upper lip. They are highly intelligent animals with complex emotions, and have excellent memory.",
    conservation: "All elephant species are classified as endangered. The main threats are poaching and habitat destruction. Conservation efforts include anti-poaching patrols, protected areas, and education programs.",
    feedingTimes: ["9:00 AM", "3:00 PM"],
    events: ["Elephant Talk - 10:30 AM", "Elephant Bath - 2:00 PM"]
  },
  giraffe: {
    scientificName: "Giraffa camelopardalis",
    image: "lovable-uploads/giraffe.png",
    overview: "Giraffes are the tallest living terrestrial animals and the largest ruminants. They are known for their extremely long neck and legs, horn-like ossicones, and spotted patterns.",
    details: "Giraffes have long tongues (about 45 cm) which they use to grasp food in high branches. Their hearts are adapted to maintain blood pressure to the brain against gravity.",
    conservation: "Giraffes are classified as vulnerable. Their population has declined due to habitat loss, civil unrest, and illegal hunting. Conservation efforts include habitat protection and anti-poaching measures.",
    feedingTimes: ["11:00 AM", "4:00 PM"],
    events: ["Giraffe Feeding - 11:30 AM", "Savanna Tour - 2:30 PM"]
  }
};

// Combined animal data type
interface DetailedAnimal extends AdminAnimal {
  scientificName: string;
  image?: string; // Make image optional since we can also use imageUrl
  overview: string;
  details: string;
  conservation: string;
  feedingTimes: string[];
  events: string[];
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
  
  // Fetch the animal data
  useEffect(() => {
    const fetchAnimalData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch the animal from the admin service
        const adminAnimal = await adminService.getItem<AdminAnimal>('animals', id);
        
        if (!adminAnimal) {
          setError('Animal not found');
          setLoading(false);
          return;
        }
        
        // Get the enhancement data if available
        const enhancementData = animalEnhancementData[id] || {};
        
        // Create default enhancement data for admin-added animals that don't have predefined details
        const defaultEnhancement = {
          scientificName: adminAnimal.species || 'Species information coming soon',
          overview: `Meet ${adminAnimal.name}, one of our wonderful animals at the zoo. ${adminAnimal.species ? `This ${adminAnimal.species} is a fascinating creature that visitors love to observe.` : ''}`,
          details: `${adminAnimal.name} is located in the ${adminAnimal.location}. ${adminAnimal.dietaryNeeds ? `Their diet consists of ${adminAnimal.dietaryNeeds}.` : ''} ${adminAnimal.medicalHistory && adminAnimal.medicalHistory.length > 0 ? `They have received excellent care at our facility.` : ''} ${adminAnimal.caretaker ? `Their primary caretaker is ${adminAnimal.caretaker}.` : ''}`,
          conservation: adminAnimal.status === 'Healthy' ? 'This animal is in good health and part of our ongoing conservation efforts.' : 'This animal is currently receiving special attention as part of our conservation program.',
          feedingTimes: ['9:00 AM', '3:00 PM'],
          events: [`Visit ${adminAnimal.name} - Daily`, `Feeding Time - ${adminAnimal.status === 'Under observation' ? 'Currently on special schedule' : 'Regular schedule'}`]
        };
        
        // Combine admin data with enhancement data
        const detailedAnimal: DetailedAnimal = {
          ...adminAnimal,
          ...defaultEnhancement,
          ...enhancementData
        };
        
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
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="relative h-[40vh] bg-muted">
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
            <BackButton color="default" />
          </div>
          <Skeleton className="w-full h-full" />
        </div>
        <div className="p-5 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }
  
  // Show error state
  if (error || !animal) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="pt-16 px-5">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Animal not found'}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  const toggleFavorite = () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    
    // Update localStorage
    const storedFavorites = localStorage.getItem('zooFavorites');
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    if (newValue) {
      if (!favorites.includes(id)) {
        favorites.push(id);
      }
      toast.success(`${animal.name} added to your favorites`);
    } else {
      favorites = favorites.filter((favId: string) => favId !== id);
      toast.info(`${animal.name} removed from your favorites`);
    }
    
    localStorage.setItem('zooFavorites', JSON.stringify(favorites));
  };

  const navigateToMap = () => {
    navigate(`/map?destination=${animal.id}`);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header Image */}
      <div className="relative h-[40vh]">
        <img 
          src={animal.imageUrl || animal.image || '/lovable-uploads/default-animal.jpg'} 
          alt={animal.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, set a default
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('default-animal.jpg')) {
              target.src = '/lovable-uploads/default-animal.jpg';
            }
          }}
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
          <BackButton color="white" />
          <div className="flex space-x-2">
            <button 
              onClick={toggleFavorite}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
              aria-label="Share"
            >
              <Share className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
          <h1 className="text-3xl font-bold text-white">{animal.name}</h1>
          <p className="text-white/80 text-sm">Scientific Name: <em>{animal.scientificName}</em></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {["overview", "details", "conservation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center capitalize font-medium transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {activeTab === "overview" && (
          <div className="animate-fade-in">
            <p className="text-foreground/80 leading-relaxed">{animal.overview}</p>
            
            <div className="mt-6">
              <h3 className="font-medium text-foreground mb-2">Location</h3>
              <p className="text-foreground/80">{animal.location}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-foreground mb-2">Feeding Times</h3>
              <div className="flex flex-wrap gap-2">
                {animal.feedingTimes.map((time, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="animate-fade-in">
            <p className="text-foreground/80 leading-relaxed">{animal.details}</p>
          </div>
        )}

        {activeTab === "conservation" && (
          <div className="animate-fade-in">
            <p className="text-foreground/80 leading-relaxed">{animal.conservation}</p>
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="px-5 mt-4">
        <h3 className="font-medium text-foreground mb-3">Today's Events</h3>
        <div className="space-y-3">
          {animal.events.map((event, index) => (
            <div 
              key={index} 
              className="p-3 bg-background rounded-lg border border-border flex justify-between items-center"
            >
              <span className="text-foreground">{event}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary font-medium" 
                onClick={() => toast.success(`Added "${event}" to your schedule`)}
              >
                Add to Schedule
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 flex gap-4 p-5">
        <Button 
          onClick={toggleFavorite}
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Bookmark className={isFavorite ? "fill-primary" : ""} size={18} />
          <span>{isFavorite ? 'Saved' : 'Add to List'}</span>
        </Button>
        
        <Button 
          onClick={navigateToMap} 
          variant="default" 
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Navigation size={18} />
          <span>Visit Now</span>
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default AnimalDetail;
