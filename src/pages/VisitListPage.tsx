
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import AnimalCard from "../components/AnimalCard";

// Sample animal data for the visit list
const visitListAnimals = [
  {
    id: "crocodile",
    name: "Crocodile",
    image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
    isFavorite: true,
  },
  {
    id: "tortoise",
    name: "Tortoise",
    image: "public/lovable-uploads/009a33ba-77b2-49a3-86ae-0586197bf4ab.png",
    isFavorite: true,
  },
  {
    id: "peacock",
    name: "Peacock",
    image: "public/lovable-uploads/d65de9b2-e507-4511-a47c-4962de992a26.png",
    isFavorite: true,
  },
  {
    id: "gorilla",
    name: "Gorilla",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    isFavorite: true,
  },
  {
    id: "lion",
    name: "Lion",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    isFavorite: true,
  },
  {
    id: "zebra",
    name: "Zebra",
    image: "public/lovable-uploads/c0779203-cebe-4f61-be65-f8939ee46040.png",
    isFavorite: true,
  },
  {
    id: "shop",
    name: "Shop",
    image: "public/lovable-uploads/e75bf6ec-5927-4fae-9fff-7807edd185ad.png",
    isFavorite: true,
  },
];

const VisitListPage = () => {
  const [visitList, setVisitList] = useState(visitListAnimals);

  const startVisit = () => {
    // In a real app, this would navigate to the map with the first item in the visit list
    window.location.href = "/map?destination=lion";
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      <PageHeader title="Visit List" showBackButton showSettings />
      
      <div className="pt-16 px-5">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {visitList.map((animal) => (
            <AnimalCard
              key={animal.id}
              id={animal.id}
              name={animal.name}
              image={animal.image}
              isFavorite={animal.isFavorite}
            />
          ))}
        </div>
        
        <button 
          onClick={startVisit}
          className="zoo-button w-full py-4 text-lg"
        >
          Start
        </button>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default VisitListPage;
