import { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Image, 
  MessageSquare,
  Bell,
  Upload,
  Search,
  Filter,
  AlertTriangle,
  Check,
  Info,
  RefreshCw,
  X
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents, Event } from "@/contexts/EventsContext";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/adminService";

const animalsList = [
  { id: "lion", name: "Lion", location: "Lion Enclosure", status: "Healthy", lastCheckup: "2023-07-10" },
  { id: "tiger", name: "Tiger", location: "Tiger Territory", status: "Under observation", lastCheckup: "2023-07-08" },
  { id: "gorilla", name: "Gorilla", location: "Gorilla Habitat", status: "Healthy", lastCheckup: "2023-07-12" },
  { id: "crocodile", name: "Crocodile", location: "Reptile House", status: "Healthy", lastCheckup: "2023-07-05" },
  { id: "elephant", name: "Elephant", location: "Savanna Area", status: "Healthy", lastCheckup: "2023-07-09" },
  { id: "giraffe", name: "Giraffe", location: "Giraffe Overlook", status: "Scheduled for checkup", lastCheckup: "2023-06-28" }
];

const notificationsList = [
  { id: "notif1", title: "Zoo closing early", status: "Sent", recipients: "All visitors", date: "2023-07-14" },
  { id: "notif2", title: "Tiger exhibit closed", status: "Scheduled", recipients: "Today's visitors", date: "2023-07-15" },
  { id: "notif3", title: "New panda exhibit", status: "Draft", recipients: "All members", date: "2023-07-20" },
  { id: "notif4", title: "Holiday hours", status: "Sent", recipients: "All visitors", date: "2023-07-11" }
];

const staffList = [
  { id: "staff1", name: "John Smith", role: "Zookeeper", department: "Mammals", status: "Active" },
  { id: "staff2", name: "Emily Johnson", role: "Veterinarian", department: "Medical", status: "Active" },
  { id: "staff3", name: "Michael Brown", role: "Tour Guide", department: "Education", status: "On Leave" },
  { id: "staff4", name: "Sarah Davis", role: "Administrative", department: "Office", status: "Active" },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("animals");
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [newEventData, setNewEventData] = useState({
    title: "",
    date: "Today",
    time: "10:00 AM",
    location: "Main Zoo Area",
    description: "",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
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

  const getFilteredData = (data, type) => {
    return data.filter(item => {
      const searchField = type === 'animals' ? item.name : 
                         type === 'events' ? item.title : 
                         type === 'notifications' ? item.title :
                         item.name;
      
      const statusField = item.status;
      
      const matchesSearch = searchField.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || statusField.toLowerCase() === filterStatus.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });
  };

  const handleAddItem = () => {
    if (activeTab === "events") {
      if (!newEventData.title) {
        toast.error("Event title is required");
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        addEvent(newEventData as Omit<Event, "id">);
        setNewEventData({
          title: "",
          date: "Today",
          time: "10:00 AM",
          location: "Main Zoo Area",
          description: "",
          image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
          duration: "30 minutes",
          host: "Zoo Staff"
        });
        setIsLoading(false);
        toast.success("New event created successfully");
      }, 600);
    } else {
      toast.info(`Adding new ${activeTab.slice(0, -1)}`);
      adminService.createItem(activeTab, { name: "New Item", status: "Draft" })
        .then(() => {
          toast.success(`New ${activeTab.slice(0, -1)} added`);
        })
        .catch(error => {
          toast.error(`Failed to add: ${error.message}`);
        });
    }
  };

  const handleEditItem = (id: string) => {
    if (activeTab === "events") {
      const eventToEdit = events.find(e => e.id === id);
      if (eventToEdit) {
        setIsLoading(true);
        
        setTimeout(() => {
          updateEvent(id, { 
            ...eventToEdit,
            description: eventToEdit.description ? 
              eventToEdit.description.includes("(Updated)") ? 
                eventToEdit.description : 
                eventToEdit.description + " (Updated)" : 
              "Updated event"
          });
          setIsLoading(false);
          toast.success(`Event "${eventToEdit.title}" updated successfully`);
        }, 600);
      }
    } else {
      toast.info(`Editing ${activeTab.slice(0, -1)} ${id}`);
      adminService.updateItem(activeTab, id, { status: "Updated" })
        .then(() => {
          toast.success(`Item updated successfully`);
        })
        .catch(error => {
          toast.error(`Failed to update: ${error.message}`);
        });
    }
  };

  const handleDeleteItem = (id: string) => {
    if (activeTab === "events") {
      if (confirm("Are you sure you want to delete this event?")) {
        setIsLoading(true);
        
        setTimeout(() => {
          deleteEvent(id);
          setIsLoading(false);
          toast.success("Event deleted successfully");
        }, 600);
      }
    } else {
      if (confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
        adminService.deleteItem(activeTab, id)
          .then(() => {
            toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
          })
          .catch(error => {
            toast.error(`Failed to delete: ${error.message}`);
          });
      }
    }
  };

  const handleSendNotification = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Notification sent successfully");
    }, 800);
  };

  const handleUploadImage = () => {
    toast.info("Image upload functionality would open here");
  };

  const handleViewEvent = (id: string) => {
    navigate(`/events/${id}`);
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${activeTab} data refreshed`);
    }, 800);
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
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Animals Management
              </h2>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Checkup</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredData(animalsList, 'animals').map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell className="font-medium">{animal.name}</TableCell>
                        <TableCell>{animal.location}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            animal.status === "Healthy" 
                              ? "bg-green-100 text-green-800" 
                              : animal.status === "Under observation"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {animal.status}
                          </span>
                        </TableCell>
                        <TableCell>{animal.lastCheckup}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditItem(animal.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteItem(animal.id)}
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
                <h3 className="font-medium mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex items-center justify-center gap-2" onClick={handleUploadImage}>
                    <Image className="w-4 h-4" />
                    <span>Upload Images</span>
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Health Reports</span>
                  </Button>
                </div>
              </div>
            </div>
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
                    {getFilteredData(events, 'events').map((event) => (
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
                  <Button variant="outline" className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Updates</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications Management
              </h2>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredData(notificationsList, 'notifications').map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell className="font-medium">{notif.title}</TableCell>
                        <TableCell>{notif.recipients}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            notif.status === "Sent" 
                              ? "bg-green-100 text-green-800" 
                              : notif.status === "Scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {notif.status}
                          </span>
                        </TableCell>
                        <TableCell>{notif.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditItem(notif.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteItem(notif.id)}
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
                <h3 className="font-medium mb-2">Send New Notification</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="notification-title">Title</Label>
                    <Input 
                      id="notification-title"
                      type="text" 
                      placeholder="Notification title" 
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notification-recipients">Recipients</Label>
                    <select 
                      id="notification-recipients"
                      className="w-full h-10 px-3 py-2 border rounded-md"
                    >
                      <option value="all">All Visitors</option>
                      <option value="today">Today's Visitors</option>
                      <option value="members">Members Only</option>
                      <option value="staff">Staff Only</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="notification-message">Message</Label>
                    <textarea 
                      id="notification-message"
                      placeholder="Notification message" 
                      className="w-full p-2 border rounded-md min-h-[80px]"
                    />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" className="flex-1">Save as Draft</Button>
                    <Button onClick={handleSendNotification} className="flex-1 flex items-center justify-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span>Send</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Admin Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">User Management</h3>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffList.map((staff) => (
                          <TableRow key={staff.id}>
                            <TableCell className="font-medium">{staff.name}</TableCell>
                            <TableCell>{staff.role}</TableCell>
                            <TableCell>{staff.department}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                staff.status === "Active" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {staff.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditItem(staff.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteItem(staff.id)}
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
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">App Settings</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-gray-600" />
                        <span>Push Notifications</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-gray-600" />
                        <span>Data Backups</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Last Backup: Today</Button>
                        <Button variant="outline" size="sm">Backup Now</Button>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-gray-600" />
                        <span>Access Permissions</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 text-red-600">Danger Zone</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        Reset System
                      </h4>
                      <p className="text-sm text-red-600 mt-1 mb-2">
                        This action will reset all system data and cannot be undone.
                      </p>
                      <Button variant="destructive" size="sm">
                        Reset System
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
