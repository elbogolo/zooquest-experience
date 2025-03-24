
import { Home, Search, Bookmark, Map, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Bookmark, label: "Visit List", path: "/visit-list" },
    { icon: Map, label: "Map", path: "/map" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-1 animate-slide-in">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item p-2 ${
                isActive ? "text-zoo-primary" : "text-gray-500"
              }`}
            >
              <item.icon className={isActive ? "text-zoo-primary" : "text-gray-500"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
