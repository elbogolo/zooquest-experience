
import { useState, useEffect } from "react";
import { Camera, X, Info, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";

// Sample animal AR content
const animalARContent = {
  lion: {
    name: "Lion",
    scientificName: "Panthera leo",
    description: "The lion is a large cat of the genus Panthera native to Africa and India. It has a muscular, broad-chested body, short, rounded head, round ears, and a hairy tuft at the end of its tail.",
    habitat: "Savanna, grassland, dense scrub, open woodland",
    diet: "Carnivore - primarily large mammals such as zebra, buffalo, and wildebeest",
    funFact: "Male lions are the only cats with manes.",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png"
  },
  tiger: {
    name: "Tiger",
    scientificName: "Panthera tigris",
    description: "The tiger is the largest living cat species and a member of the genus Panthera. It is recognizable by its dark vertical stripes on orange-brown fur with a white underside.",
    habitat: "Tropical rainforests, evergreen forests, mangrove swamps, grasslands",
    diet: "Carnivore - primarily ungulates such as deer and wild boar",
    funFact: "No two tigers have exactly the same pattern of stripes.",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png"
  },
  gorilla: {
    name: "Gorilla",
    scientificName: "Gorilla gorilla",
    description: "Gorillas are ground-dwelling, predominantly herbivorous great apes that inhabit the tropical forests of central Sub-Saharan Africa.",
    habitat: "Tropical forests and subtropical forests",
    diet: "Herbivore - leaves, stems, fruits, and bamboo shoots",
    funFact: "Gorillas can live for 40-50 years in the wild.",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png"
  }
};

// In a real app, this would be an actual AR implementation
const ARPage = () => {
  const [activeAnimal, setActiveAnimal] = useState<keyof typeof animalARContent>("lion");
  const [showInfo, setShowInfo] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate camera permission request
    const requestPermission = async () => {
      setLoading(true);
      toast.info("Requesting camera permission...");
      
      // Simulate a delay for demonstration
      setTimeout(() => {
        setCameraPermission(true);
        setLoading(false);
        toast.success("AR experience ready! Point your camera at an animal marker.");
      }, 2000);
    };
    
    requestPermission();
  }, []);

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    toast.info(audioEnabled ? "Audio disabled" : "Audio enabled");
  };

  const resetExperience = () => {
    setLoading(true);
    toast.info("Resetting AR experience...");
    
    // Simulate reset
    setTimeout(() => {
      setLoading(false);
      toast.success("AR experience reset");
    }, 1000);
  };

  const switchAnimal = (animal: keyof typeof animalARContent) => {
    setActiveAnimal(animal);
    setShowInfo(false);
    toast.success(`Now viewing: ${animalARContent[animal].name}`);
  };

  const takePhoto = () => {
    toast.success("Photo captured! Saved to your gallery.");
  };

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute top-0 left-0 right-0 z-50">
        <PageHeader title="" showBackButton transparent />
      </div>
      
      {/* AR Camera View (Simulated) */}
      <div className="h-screen w-full relative overflow-hidden">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
              <p>Initializing AR Experience...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Simulated camera feed */}
            <div className="absolute inset-0 bg-gray-900">
              <img
                src={animalARContent[activeAnimal].image}
                alt="AR View"
                className="w-full h-full object-contain opacity-90"
              />
              
              {/* AR overlay effects */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-8 h-8 border-2 border-white rounded-full animate-ping opacity-30"></div>
                <div className="absolute top-1/3 right-1/4 w-6 h-6 border border-white rounded-full animate-ping opacity-30 animation-delay-500"></div>
                <div className="absolute bottom-1/3 left-1/3 w-10 h-10 border border-white rounded-full animate-ping opacity-30 animation-delay-1000"></div>
              </div>
            </div>
          </>
        )}
        
        {/* AR Info Card */}
        {showInfo && !loading && (
          <div className="absolute bottom-24 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">{animalARContent[activeAnimal].name}</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 italic text-sm mb-2">{animalARContent[activeAnimal].scientificName}</p>
            <p className="text-sm mb-2">{animalARContent[activeAnimal].description}</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-400">Habitat</h3>
                <p className="text-sm">{animalARContent[activeAnimal].habitat}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-400">Diet</h3>
                <p className="text-sm">{animalARContent[activeAnimal].diet}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/20">
              <h3 className="text-xs font-semibold uppercase text-gray-400">Fun Fact</h3>
              <p className="text-sm">{animalARContent[activeAnimal].funFact}</p>
            </div>
          </div>
        )}
        
        {/* Control buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 px-4">
          <button
            onClick={toggleAudio}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <button
            onClick={takePhoto}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center"
          >
            <Camera className="w-7 h-7 text-black" />
          </button>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        
        {/* AR Controls */}
        <div className="absolute top-20 right-4 flex flex-col gap-2">
          <button
            onClick={resetExperience}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Animal selector */}
        <div className="absolute top-20 left-4 flex flex-col gap-2">
          {Object.keys(animalARContent).map((animal) => (
            <button
              key={animal}
              onClick={() => switchAnimal(animal as keyof typeof animalARContent)}
              className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                activeAnimal === animal ? "border-white" : "border-transparent"
              }`}
            >
              <img 
                src={animalARContent[animal as keyof typeof animalARContent].image} 
                alt={animal} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ARPage;
