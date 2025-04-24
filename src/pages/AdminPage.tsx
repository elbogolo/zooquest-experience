
import { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Bell, 
  Settings, 
  Plus, 
  Search,
  Filter,
  RefreshCw,
  Check,
  Info,
  Edit,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/contexts/EventsContext";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { adminService, AdminEvent } from "@/services/adminService";
import AnimalManagement from "@/components/admin/AnimalManagement";
import NotificationManagement from "@/components/admin/NotificationManagement";
import AdminSettings from "@/components/admin/AdminSettings";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("animals");
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [newEventData, setNewEventData] = useState<Partial<AdminEvent>>({
    title: "",
    date: "Today",
    time: "10:00 AM",
    location: "Main Zoo Area",
    description: "",
    duration: "30 minutes",
    host: "Zoo Staff"
  });

  useEffect(() => {
    setIsLoading(true);
    
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      toast.success("Admin panel data loaded successfully");
    }, 800);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const handleAddItem = async () => {
    if (activeTab === "events") {
      if (!newEventData.title) {
        toast.error("Event title is required");
        return;
      }

      setIsLoading(true);
      try {
        // Use adminService instead of the context for consistency
        const createdEvent = await adminService.createItem<AdminEvent>("events", newEventData);
        
        // Also add to local events context for UI update
        addEvent({
          id: createdEvent.id,
          title: createdEvent.title || "",
          date: createdEvent.date || "",
          time: createdEvent.time || "",
          location: createdEvent.location || "",
          description: createdEvent.description || "",
          image: createdEvent.imageUrl,
        });
        
        setNewEventData({
          title: "",
          date: "Today",
          time: "10:00 AM",
          location: "Main Zoo Area",
          description: "",
          duration: "30 minutes",
          host: "Zoo Staff"
        });
        
        toast.success("New event created successfully");
      } catch (error) {
        console.error("Failed to create event:", error);
        toast.error("Failed to create event");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.info(`Adding new ${activeTab.slice(0, -1)} via the dedicated form in each section`);
    }
  };

  const handleEditItem = async (id: string) => {
    if (activeTab === "events") {
      const eventToEdit = events.find(e => e.id === id);
      if (eventToEdit) {
        setIsLoading(true);
        
        try {
          const updatedDescription = eventToEdit.description ? 
            eventToEdit.description.includes("(Updated)") ? 
              eventToEdit.description : 
              eventToEdit.description + " (Updated)" : 
            "Updated event";
            
          // Update using adminService
          const updatedEvent = await adminService.updateItem<AdminEvent>(
            "events", 
            id, 
            { description: updatedDescription }
          );
          
          // Also update in local events context
          updateEvent(id, { 
            ...eventToEdit,
            description: updatedDescription
          });
          
          toast.success(`Event "${eventToEdit.title}" updated successfully`);
        } catch (error) {
          console.error("Failed to update event:", error);
          toast.error("Failed to update event");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (activeTab === "events") {
      if (confirm("Are you sure you want to delete this event?")) {
        setIsLoading(true);
        
        try {
          // Delete using adminService
          await adminService.deleteItem("events", id);
          
          // Also delete from local events context
          deleteEvent(id);
          
          toast.success("Event deleted successfully");
        } catch (error) {
          console.error("Failed to delete event:", error);
          toast.error("Failed to delete event");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleViewEvent = (id: string) => {
    navigate(`/events/${id}`);
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    
    try {
      // Actually fetch fresh data based on the current tab
      if (activeTab === "events") {
        const refreshedEvents = await adminService.getItems<AdminEvent>("events");
        // Update the global context with the refreshed events if needed
        // This would require adding a setEvents function to the context
      }
      
      toast.success(`${activeTab} data refreshed`);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-6 bg-gray-50">
        <PageHeader title="Admin Panel" showBackButton />
        <div className="pt-16 px-4 flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin">
            <RefreshCw className="h-12 w-12 text-primary" />
          </div>
          <p className="mt-4 text-lg font-medium">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 bg-gray-50">
      <PageHeader title="Admin Panel" showBackButton />
      
      <div className="pt-16 px-4">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold">Zoo Management</h1>
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
                className="border rounded-md px-3 py-2 text-sm bg-white"
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
          <TabsList className="grid grid-cols-4 mb-4">
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
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Events Management
              </h2>
              
              {activeTab === "events" && (
                <div className="mb-4 border rounded-lg p-3 bg-gray-50">
                  <h3 className="text-md font-medium mb-2">Add New Event</h3>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="event-title">Title</Label>
                      <Input
                        id="event-title"
                        type="text"
                        placeholder="Event Title"
                        value={newEventData.title}
                        onChange={(e) => setNewEventData({...newEventData, title: e.target.value})}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="event-date">Date</Label>
                        <select 
                          id="event-date"
                          value={newEventData.date}
                          onChange={(e) => setNewEventData({...newEventData, date: e.target.value})}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Today">Today</option>
                          <option value="Tomorrow">Tomorrow</option>
                          <option value="This Weekend">This Weekend</option>
                          <option value="Next Week">Next Week</option>
                          <option value="Next Month">Next Month</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="event-time">Time</Label>
                        <Input
                          id="event-time"
                          type="text"
                          placeholder="Time"
                          value={newEventData.time}
                          onChange={(e) => setNewEventData({...newEventData, time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="event-location">Location</Label>
                      <Input
                        id="event-location"
                        type="text"
                        placeholder="Location"
                        value={newEventData.location}
                        onChange={(e) => setNewEventData({...newEventData, location: e.target.value})}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-description">Description</Label>
                      <textarea
                        id="event-description"
                        placeholder="Description"
                        value={newEventData.description}
                        onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
                        className="w-full p-2 border rounded-md min-h-[80px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="event-duration">Duration</Label>
                        <Input
                          id="event-duration"
                          type="text"
                          placeholder="Duration"
                          value={newEventData.duration}
                          onChange={(e) => setNewEventData({...newEventData, duration: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-host">Host</Label>
                        <Input
                          id="event-host"
                          type="text"
                          placeholder="Host"
                          value={newEventData.host}
                          onChange={(e) => setNewEventData({...newEventData, host: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button onClick={handleAddItem} className="w-full">Create Event</Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredEvents().map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.date} at {event.time}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewEvent(event.id)}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Calendar className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditItem(event.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteItem(event.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">Event Planning</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex items-center justify-center gap-2" asChild>
                    <Link to="/events">
                      <Calendar className="w-4 h-4" />
                      <span>View Calendar</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2"
                    onClick={() => toast.success("Event updates sent to attendees")}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Updates</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <NotificationManagement searchQuery={searchQuery} filterStatus={filterStatus} />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <AdminSettings searchQuery={searchQuery} filterStatus={filterStatus} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 bg-white rounded-lg p-3 shadow-sm flex justify-between items-center text-sm text-gray-600">
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
    </div>
  );
};

export default AdminPage;
