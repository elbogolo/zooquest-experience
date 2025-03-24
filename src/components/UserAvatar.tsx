
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  showFallback?: boolean;
  className?: string;
  linkToProfile?: boolean;
}

const UserAvatar = ({ 
  size = "md", 
  showFallback = true, 
  className = "",
  linkToProfile = true 
}: UserAvatarProps) => {
  // In a real app, we would fetch this from a user context/auth state
  const userName = localStorage.getItem("userName") || "Guest";
  const userImage = localStorage.getItem("userImage") || null;
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };
  
  const avatar = (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {userImage && <AvatarImage src={userImage} alt={userName} />}
      {showFallback && (
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {userImage ? null : (
            userName === "Guest" ? 
              <UserCircle className="h-5 w-5" /> : 
              userName.charAt(0).toUpperCase()
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );
  
  if (linkToProfile) {
    return <Link to="/profile">{avatar}</Link>;
  }
  
  return avatar;
};

export default UserAvatar;
