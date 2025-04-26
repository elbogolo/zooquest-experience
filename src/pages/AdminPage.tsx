import { useState } from "react";
import { 
  Search,
  Filter,
  RefreshCw,
  Plus,
  Calendar,
  MessageSquare,
  Info,
  Check
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import AnimalManagement from "@/components/admin/AnimalManagement";
import EventManagement from "@/components/admin/EventManagement";
import NotificationManagement from "@/components/admin/NotificationManagement";
import AdminSettings from "@/components/admin/AdminSettings";
import { useTheme } from "@/components/ThemeProvider";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("animals");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "animals") {
        const animalManagementElement = document.getElementById('animal-management');
        if (animalManagementElement) {
          const refreshEvent = new CustomEvent('refreshAnimals');
          animalManagementElement.dispatchEvent(refreshEvent);
        }
      } else if (activeTab === "notifications") {
        const notificationElement = document.getElementById('notification-management');
        if (notificationElement) {
          const refreshEvent = new CustomEvent('refreshNotifications');
          notificationElement.dispatchEvent(refreshEvent);
        }
      }
      toast.success(`${activeTab} data refreshed`);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    toast.info(`Adding new ${activeTab.slice(0, -1)} via the dedicated form in each section`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-6 bg-background">
        <PageHeader title="Admin Panel" showBackButton />
        <div className="pt-16 px-4 flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin">
            <RefreshCw className="h-12 w-12 text-primary" />
          </div>
          <p className="mt-4 text-lg font-medium text-foreground">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Admin Panel" showBackButton />
      
      <div className="pt-16 px-4 pb-16">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-foreground">Zoo Management</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleRefreshData}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                onClick={handleAddItem} 
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy</option>
                <option value="under observation">Under Observation</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="animals" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 bg-muted">
            <TabsTrigger value="animals">
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">Animals</span>
                <span className="inline sm:hidden">🦁</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="events">
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">Events</span>
                <span className="inline sm:hidden">🎪</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">Alerts</span>
                <span className="inline sm:hidden">🔔</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">Settings</span>
                <span className="inline sm:hidden">⚙️</span>
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="animals" className="mt-0">
            <AnimalManagement searchQuery={searchQuery} filterStatus={filterStatus} />
          </TabsContent>
          
          <TabsContent value="events" className="mt-0">
            <EventManagement searchQuery={searchQuery} filterStatus={filterStatus} />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <div id="notification-management">
              <NotificationManagement searchQuery={searchQuery} filterStatus={filterStatus} />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <AdminSettings searchQuery={searchQuery} filterStatus={filterStatus} />
          </TabsContent>
        </Tabs>
        
        {/* Footer status bar - fixed at bottom */}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-card dark:bg-card border-t border-border dark:border-border p-3 shadow-sm flex flex-wrap justify-between items-center text-sm text-muted-foreground z-10">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>Last updated: Today at {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-600" />
            <span>System status: Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
