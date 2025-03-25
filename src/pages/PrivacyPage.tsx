
import { useState } from "react";
import { Lock, Users, Globe, Map, Database } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const PrivacyPage = () => {
  const [locationSharing, setLocationSharing] = useState(true);
  const [activityVisible, setActivityVisible] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);

  const handleToggle = (setting: string, value: boolean) => {
    // In a real app, we would call an API to update the settings
    toast.success(`${setting} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Privacy" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5 space-y-6">
        <div className="bg-card rounded-xl overflow-hidden shadow-sm">
          <h2 className="text-lg font-semibold p-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-primary" />
            Privacy Settings
          </h2>
          
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Location Sharing</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow app to access your location while using it
                  </p>
                </div>
              </div>
              <Switch 
                checked={locationSharing} 
                onCheckedChange={(checked) => {
                  setLocationSharing(checked);
                  handleToggle('Location sharing', checked);
                }} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Activity Visibility</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show your activity to other users
                  </p>
                </div>
              </div>
              <Switch 
                checked={activityVisible} 
                onCheckedChange={(checked) => {
                  setActivityVisible(checked);
                  handleToggle('Activity visibility', checked);
                }} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data Collection</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow app to collect usage data to improve services
                  </p>
                </div>
              </div>
              <Switch 
                checked={dataCollection} 
                onCheckedChange={(checked) => {
                  setDataCollection(checked);
                  handleToggle('Data collection', checked);
                }} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zoo-secondary flex items-center justify-center text-zoo-primary mr-3">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Public Profile</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Make your profile visible to everyone
                  </p>
                </div>
              </div>
              <Switch 
                checked={profilePublic} 
                onCheckedChange={(checked) => {
                  setProfilePublic(checked);
                  handleToggle('Public profile', checked);
                }} 
              />
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl overflow-hidden shadow-sm p-4">
          <h3 className="text-sm font-medium mb-2">Data Deletion</h3>
          <p className="text-xs text-muted-foreground mb-4">
            You can request to delete all your data from our servers. This action cannot be undone.
          </p>
          <button
            onClick={() => {
              toast.info("Data deletion request submitted. Our team will contact you.");
            }}
            className="text-sm text-destructive hover:underline"
          >
            Request Data Deletion
          </button>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default PrivacyPage;
