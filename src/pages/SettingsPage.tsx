
import { UserCircle, Bell, Lock, ShieldCheck, HelpCircle, FileText, Flag, LogOut, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  const handleLogout = () => {
    // In a real app, we would call an API to log the user out
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    toast.success("You have been logged out");
    
    // Redirect to login page
    window.location.href = "/auth";
  };

  const menuSections = [
    {
      title: "App Settings",
      items: [
        { 
          icon: <Bell className="w-5 h-5" />, 
          label: "Notifications", 
          action: (
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          )
        },
        { 
          icon: <Lock className="w-5 h-5" />, 
          label: "Location Services", 
          action: (
            <Switch 
              checked={location} 
              onCheckedChange={setLocation} 
            />
          )
        },
        { 
          icon: theme === "dark" ? <UserCircle className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />, 
          label: "Dark Mode", 
          action: (
            <Switch 
              checked={theme === "dark"} 
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
            />
          )
        },
      ],
    },
    {
      title: "Account",
      items: [
        { 
          icon: <UserCircle className="w-5 h-5" />, 
          label: "Edit profile", 
          path: "/profile/edit",
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        },
        { 
          icon: <ShieldCheck className="w-5 h-5" />, 
          label: "Security", 
          path: "/profile/security",
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        },
      ],
    },
    {
      title: "Support & About",
      items: [
        { 
          icon: <HelpCircle className="w-5 h-5" />, 
          label: "Help & Support", 
          path: "/help",
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        },
        { 
          icon: <FileText className="w-5 h-5" />, 
          label: "Terms and Policies", 
          path: "/terms",
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        },
        { 
          icon: <Flag className="w-5 h-5" />, 
          label: "Report a problem", 
          path: "/help",
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        },
        { 
          icon: <HelpCircle className="w-5 h-5" />, 
          label: "FAQs", 
          path: "/faqs",
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        },
      ],
    },
    {
      title: "Actions",
      items: [
        { 
          icon: <LogOut className="w-5 h-5 text-destructive" />, 
          label: "Log out", 
          labelClass: "text-destructive",
          onClick: handleLogout,
          action: null
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Settings" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx} className="bg-card rounded-xl overflow-hidden shadow-sm">
            <h2 className="text-lg font-medium px-4 pt-4 pb-2 text-foreground">{section.title}</h2>
            <div className="divide-y divide-border">
              {section.items.map((item, itemIdx) => {
                const Component = item.path ? Link : "button";
                const props = item.path 
                  ? { to: item.path } 
                  : item.onClick 
                    ? { onClick: item.onClick }
                    : {};

                return (
                  <Component
                    key={itemIdx}
                    {...props}
                    className={`w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-foreground`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                        {item.icon}
                      </div>
                      <span className={item.labelClass || ""}>{item.label}</span>
                    </div>
                    {item.action}
                  </Component>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default SettingsPage;
