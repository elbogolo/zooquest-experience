import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface AnimalCardProps {
  id: string;
  name: string;
  image: string;
  isFavorite?: boolean;
  showDistance?: boolean;
  distance?: string;
  compact?: boolean;
  onClick?: () => void;
  onToggleFavorite?: (isFavorite: boolean) => void;
}

const AnimalCard = ({
  id,
  name,
  image,
  isFavorite = false,
  showDistance = false,
  distance,
  compact = false,
  onClick,
  onToggleFavorite,
}: AnimalCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);
    
    if (onToggleFavorite) {
      onToggleFavorite(newFavoriteState);
    }
  };

  const cardContent = (
    <div
      className={`zoo-card relative overflow-hidden ${
        compact ? "h-32" : "aspect-[4/3]"
      } w-full`}
    >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={toggleFavorite}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm"
        >
          <Heart
            className={`w-5 h-5 ${
              favorite ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>
      
      <div className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex justify-between items-end">
          <h3 className="text-white font-medium">{name}</h3>
          {showDistance && distance && (
            <span className="text-white text-xs">{distance}</span>
          )}
        </div>
      </div>
    </div>
  );

  // If onClick is provided, wrap the content in a div with the onClick
  // Otherwise, use Link as before
  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={`/animals/${id}`}>
      {cardContent}
    </Link>
  );
};

export default AnimalCard;
