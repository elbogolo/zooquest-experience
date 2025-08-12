import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import UserAvatar from "./UserAvatar";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  greeting?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
  actionItems?: React.ReactNode;
}

const AppHeader = ({
  greeting,
  showBackButton = false,
  onBackClick,
  title,
  subtitle,
  className,
  actionItems,
}: AppHeaderProps) => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  return (
    <div>
      {/* Top row with icons */}
      <div className="px-5 pt-6 pb-2 flex justify-end items-center gap-3">
        <ThemeToggle className="w-9 h-9" />
        
        <NotificationBell />
        
        {isAdmin && (
          <Link 
            to="/admin" 
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-foreground font-medium"
          >
            <Shield className="w-5 h-5 text-primary" />
            <span>Admin</span>
          </Link>
        )}
        
        <Link 
          to="/profile" 
          className="w-9 h-9 flex items-center justify-center"
        >
          <UserAvatar size="sm" disableLink={true} />
        </Link>
      </div>
      
      {/* Bottom row with greeting/title */}
      <header className={cn("px-5 pt-2 pb-4", className)}>
        <div>
          {greeting && (
            <h1 className="text-2xl font-bold flex items-center text-foreground">
              {greeting}, {user?.name || 'Guest'} <span className="ml-1 text-2xl">👋</span>
            </h1>
          )}
          
          {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
          
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        
        <div className="flex gap-3 items-center">
          {actionItems}
        </div>
      </header>
    </div>
  );
};

export default AppHeader;
