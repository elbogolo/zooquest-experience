
import { ChevronLeft, Moon, Sun, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSettings?: boolean;
  showThemeToggle?: boolean;
  transparent?: boolean;
}

const PageHeader = ({
  title,
  showBackButton = false,
  showSettings = false,
  showThemeToggle = false,
  transparent = false,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between ${
        transparent ? "bg-transparent" : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      {title && (
        <h1 className="flex-1 text-center text-lg font-semibold">{title}</h1>
      )}

      <div className="flex items-center gap-2">
        {showThemeToggle && (
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100">
            <Moon className="w-5 h-5" />
          </button>
        )}
        
        {showSettings && (
          <Link
            to="/settings"
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          >
            <Settings className="w-5 h-5" />
          </Link>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
