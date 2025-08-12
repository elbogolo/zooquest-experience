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
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h1 className="text-lg font-bold text-foreground">Zoo Management</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 h-8 text-xs px-3"
                onClick={() => navigate('/')}
              >
                <span>← Back to Home</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 h-8 text-xs px-3"
                onClick={handleRefreshData}
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                onClick={handleAddItem} 
                className="flex items-center gap-1 h-8 text-xs px-3"
              >
                <Plus className="w-3 h-3" />
                <span>Add New</span>
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-8 text-xs px-3"
                onClick={() => setFilterStatus(filterStatus === "all" ? "active" : "all")}
              >
                <Filter className="w-3 h-3" />
                {filterStatus === "all" ? "All" : "Active"}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="animals" className="text-xs h-7">
                Animals
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs h-7">
                Events
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs h-7">
                Alerts
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs h-7">
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="animals" className="mt-0">
                <AnimalManagement 
                  searchQuery={searchQuery} 
                  filterStatus={filterStatus}
                />
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                <EventManagement 
                  searchQuery={searchQuery} 
                  filterStatus={filterStatus}
                />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <NotificationManagement 
                  searchQuery={searchQuery} 
                  filterStatus={filterStatus}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <AdminSettings 
                  searchQuery={searchQuery} 
                  filterStatus={filterStatus}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
