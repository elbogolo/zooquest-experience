import { ChevronLeft, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import UserAvatar from "./UserAvatar";

interface PageHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSettings?: boolean;
  showThemeToggle?: boolean;
  showUserAvatar?: boolean;
  transparent?: boolean;
}

const PageHeader = ({
  title,
  showBackButton = false,
  showSettings = false,
  showThemeToggle = false,
  showUserAvatar = false,
  transparent = false,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between ${
        transparent ? "bg-transparent" : "bg-background border-b border-border"
      }`}
    >
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-foreground hover:bg-secondary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      {title && (
        <h1 className="flex-1 text-center text-lg font-semibold text-foreground">{title}</h1>
      )}

      <div className="flex items-center gap-2">
        {showThemeToggle && <ThemeToggle />}
        
        {showSettings && (
          <Link
            to="/settings"
            className="w-10 h-10 flex items-center justify-center rounded-full text-foreground hover:bg-secondary"
          >
            <Settings className="w-5 h-5" />
          </Link>
        )}

        {showUserAvatar && (
          <Link to="/profile">
            <UserAvatar size="sm" disableLink />
          </Link>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
