import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
  variant?: "default" | "ghost";
  color?: "default" | "white";
}

const BackButton = ({ 
  onClick, 
  className,
  variant = "default",
  color = "default" 
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full",
        variant === "default" && color === "default" && "bg-background/10 hover:bg-background/20",
        variant === "default" && color === "white" && "bg-white/10 hover:bg-white/20",
        variant === "ghost" && color === "default" && "hover:bg-background/10",
        variant === "ghost" && color === "white" && "hover:bg-white/10",
        color === "white" ? "text-white" : "text-foreground",
        className
      )}
      aria-label="Go back"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
};

export default BackButton;
