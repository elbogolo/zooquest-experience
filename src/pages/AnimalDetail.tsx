
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  Heart, 
  NavigationArrow, 
  Info, 
  Bookmark,
  Share
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";

// Sample detailed animal data
const animalData = {
  lion: {
    id: "lion",
    name: "Lion",
    scientificName: "Panthera Leo",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    overview: "Lions are the second largest big cat species in the world (behind tigers). Known as the 'king of the jungle', lions are a symbol of strength and courage. They are highly social compared to other cat species, living in groups called 'prides'.",
    details: "Adult male lions are easily recognized by their manes, which make the animal's head and neck appear larger, providing an excellent intimidation display. Lions typically inhabit grasslands and savannas, but may also be found in dense bush and woodlands.",
    conservation: "Lions are listed as vulnerable on the IUCN Red List. Their population is declining due to habitat loss, human-wildlife conflict, and poaching. Conservation efforts include protected areas, anti-poaching initiatives, and community-based conservation programs.",
    location: "African Lion Enclosure",
    feedingTimes: ["10:00 AM", "4:00 PM"],
    events: ["Lion Talk - 11:30 AM", "Big Cat Feeding - 3:00 PM"]
  },
  tiger: {
    id: "tiger",
    name: "Tiger",
    scientificName: "Panthera Tigris",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    overview: "Tigers are the largest cat species in the world, known for their distinctive orange coat with black stripes. Each tiger's stripes are unique, like human fingerprints. They are powerful apex predators that play a crucial role in maintaining ecosystem balance.",
    details: "Tigers are solitary animals that require large territories to hunt and live. They are excellent swimmers and can swim up to 6 kilometers at a stretch. Tigers have exceptional night vision, being able to see six times better than humans in the dark.",
    conservation: "Tigers are endangered, with only about 3,900 remaining in the wild. Major threats include poaching, habitat loss, and human-wildlife conflict. Conservation efforts include anti-poaching patrols, habitat protection, and captive breeding programs.",
    location: "Tiger Territory",
    feedingTimes: ["9:30 AM", "3:30 PM"],
    events: ["Tiger Talk - 2:00 PM", "Enrichment Activity - 11:00 AM"]
  },
  gorilla: {
    id: "gorilla",
    name: "Gorilla",
    scientificName: "Gorilla Gorilla",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    overview: "Gorillas are the largest living primates and the next closest living relatives to humans after chimpanzees and bonobos. They are ground-dwelling herbivores that inhabit the forests of central Sub-Saharan Africa.",
    details: "Gorillas live in groups called troops, led by a dominant male known as a silverback. They have unique nose prints, which are used for identification. Despite their intimidating appearance, gorillas are generally peaceful and shy.",
    conservation: "All gorilla species are endangered, primarily due to habitat destruction, poaching, and disease. Conservation efforts include protected areas, anti-poaching measures, and ecotourism initiatives.",
    location: "Great Ape House",
    feedingTimes: ["10:30 AM", "2:30 PM"],
    events: ["Gorilla Talk - 12:00 PM", "Feeding Time - 2:30 PM"]
  },
  crocodile: {
    id: "crocodile",
    name: "Crocodile",
    scientificName: "Crocodylus Niloticus",
    image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
    overview: "Crocodiles are large aquatic reptiles that live throughout the tropics in Africa, Asia, the Americas, and Australia. They are ambush predators, capable of taking down large prey with their powerful jaws and teeth.",
    details: "Crocodiles can live up to 70-100 years in the wild. They have a four-chambered heart, like mammals, which makes them more capable of extended exertion than other reptiles. Despite their size, they can move quickly in short bursts.",
    conservation: "Some crocodile species are critically endangered, while others have healthy populations. Threats include habitat loss, pollution, and hunting. Conservation efforts include breeding programs, habitat protection, and sustainable harvesting in some areas.",
    location: "Reptile House",
    feedingTimes: ["11:00 AM", "4:30 PM"],
    events: ["Reptile Talk - 1:30 PM", "Feeding Demonstration - 4:30 PM"]
  }
};

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);
  
  // In a real app, we would fetch this data from an API
  const animal = animalData[id as keyof typeof animalData];
  
  if (!animal) {
    return <div>Animal not found</div>;
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header Image */}
      <div className="relative h-[40vh]">
        <img 
          src={animal.image} 
          alt={animal.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4">
          <PageHeader transparent showBackButton />
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
                  ? "text-zoo-primary border-b-2 border-zoo-primary"
                  : "text-gray-600"
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
            <p className="text-gray-700 leading-relaxed">{animal.overview}</p>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Location</h3>
              <p className="text-gray-700">{animal.location}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Feeding Times</h3>
              <div className="flex flex-wrap gap-2">
                {animal.feedingTimes.map((time, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-zoo-secondary text-zoo-primary rounded-full text-sm"
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
            <p className="text-gray-700 leading-relaxed">{animal.details}</p>
          </div>
        )}

        {activeTab === "conservation" && (
          <div className="animate-fade-in">
            <p className="text-gray-700 leading-relaxed">{animal.conservation}</p>
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="px-5 mt-4">
        <h3 className="font-medium text-gray-900 mb-3">Today's Events</h3>
        <div className="space-y-3">
          {animal.events.map((event, index) => (
            <div 
              key={index} 
              className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center"
            >
              <span>{event}</span>
              <button className="text-zoo-primary text-sm font-medium">Add to Schedule</button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 flex gap-4 p-5">
        <button 
          onClick={toggleFavorite}
          className="flex-1 zoo-button-outline flex items-center justify-center gap-2"
        >
          <Bookmark className={isFavorite ? "fill-zoo-primary" : ""} size={18} />
          <span>Add to List</span>
        </button>
        
        <Link to={`/map?destination=${animal.id}`} className="flex-1 zoo-button flex items-center justify-center gap-2">
          <NavigationArrow size={18} />
          <span>Visit Now</span>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default AnimalDetail;
