
import { Bell, MessageSquare, Calendar, BadgeInfo, Megaphone } from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const NotificationsPage = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(false);

  const handleToggle = (setting: string, value: boolean) => {
    // In a real app, we would call an API to update the settings
    toast.success(`${setting} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Notifications" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5 space-y-6">
        <div className="bg-card rounded-xl overflow-hidden shadow-sm">
          <h2 className="text-lg font-semibold p-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-primary" />
            Notification Settings
          </h2>
          
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Push Notifications</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive notifications on your device
                  </p>
                </div>
              </div>
              <Switch 
                checked={pushNotifications} 
                onCheckedChange={(checked) => {
                  setPushNotifications(checked);
                  handleToggle('Push notifications', checked);
                }} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={(checked) => {
                  setEmailNotifications(checked);
                  handleToggle('Email notifications', checked);
                }} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Event Reminders</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get reminders about upcoming events
                  </p>
                </div>
              </div>
              <Switch 
                checked={eventReminders} 
                onCheckedChange={(checked) => {
                  setEventReminders(checked);
                  handleToggle('Event reminders', checked);
                }} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <BadgeInfo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Message Alerts</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get notified about new messages
                  </p>
                </div>
              </div>
              <Switch 
                checked={messageAlerts} 
                onCheckedChange={(checked) => {
                  setMessageAlerts(checked);
                  handleToggle('Message alerts', checked);
                }} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">News & Updates</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get the latest news about the zoo
                  </p>
                </div>
              </div>
              <Switch 
                checked={newsUpdates} 
                onCheckedChange={(checked) => {
                  setNewsUpdates(checked);
                  handleToggle('News and updates', checked);
                }} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default NotificationsPage;
