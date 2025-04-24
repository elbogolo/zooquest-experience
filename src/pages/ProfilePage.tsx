import { UserCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";

const ProfilePage = () => {
  const user = {
    name: "Yaw Anderson",
    email: "yanderson@gmail.com",
    profileImage: null, // placeholder for profile image
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
        { icon: "log-out", label: "Log out", path: "/logout" },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <PageHeader title="Settings" showBackButton />
      
      <div className="pt-16 px-5 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <h2 className="text-lg font-medium px-4 pt-4 pb-2">{section.title}</h2>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  to={item.path}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
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
