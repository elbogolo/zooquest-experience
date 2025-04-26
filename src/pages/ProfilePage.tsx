import { UserCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { logout } = useAuth();
  const user = {
    name: "Yaw Anderson",
    email: "yanderson@gmail.com",
    profileImage: null, // placeholder for profile image
  };
  
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const menuSections = [
    {
      title: "Account",
      items: [
        { icon: "user-circle", label: "Edit profile", path: "/profile/edit" },
        { icon: "heart", label: "Favorites", path: "/profile/favorites" },
        { icon: "shield", label: "Security", path: "/profile/security" },
        { icon: "bell", label: "Notifications", path: "/profile/notifications" },
        { icon: "lock", label: "Privacy", path: "/profile/privacy" },
      ],
    },
    {
      title: "Support & About",
      items: [
        { icon: "help-circle", label: "Help & Support", path: "/help" },
        { icon: "file-text", label: "Terms and Policies", path: "/terms" },
      ],
    },
    {
      title: "Actions",
      items: [
        { icon: "flag", label: "Report a problem", path: "/report" },
        { icon: "help-circle", label: "FAQs", path: "/faqs" },
        { icon: "log-out", label: "Log out", path: "#", onClick: handleLogout },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Settings" showBackButton />
      
      <div className="pt-16 px-5 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx} className="bg-card rounded-xl overflow-hidden shadow-sm">
            <h2 className="text-lg font-medium px-4 pt-4 pb-2 text-foreground">{section.title}</h2>
            <div className="divide-y divide-border">
              {section.items.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  to={item.path}
                  onClick={item.onClick}
                  className="flex items-center justify-between p-4 hover:bg-accent/10 text-foreground"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default ProfilePage;
