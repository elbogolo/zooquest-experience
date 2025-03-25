
import React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationIconProps {
  enabled: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  enabled,
  onToggle,
  size = "md",
  className
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <button
      onClick={onToggle}
      className={cn(
        "rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-zoo-primary focus:ring-offset-2",
        enabled ? "text-zoo-primary bg-zoo-secondary/30" : "text-gray-400 hover:text-gray-600",
        className
      )}
      aria-label={enabled ? "Disable notifications" : "Enable notifications"}
    >
      <Bell className={sizeClasses[size]} />
    </button>
  );
};

export default NotificationIcon;
