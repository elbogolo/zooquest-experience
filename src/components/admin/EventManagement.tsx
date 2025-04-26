import React, { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Image, Calendar, RefreshCw, Plus, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { adminService, AdminEvent } from "@/services/adminService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEvents } from "@/contexts/EventsContext";

interface EventManagementProps {
  searchQuery: string;
  filterStatus: string;
}

const EventManagement = ({ searchQuery, filterStatus }: EventManagementProps) => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addEvent, updateEvent, deleteEvent } = useEvents();
  const [eventEditorOpen, setEventEditorOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [eventData, setEventData] = useState<Partial<AdminEvent>>({
    title: "",
    date: new Date().toLocaleDateString(),
    time: "10:00 AM",
    location: "Main Zoo Area",
    description: "",
    duration: "30 minutes",
    host: "Zoo Staff",
    status: "Scheduled",
    attendees: 0
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await adminService.getItems<AdminEvent>("events");
      setEvents(data);
    } catch (error) {
      toast.error("Failed to load events");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || (event.status?.toLowerCase() === filterStatus.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  };

  const resetEventData = () => {
    setEventData({
      title: "",
      date: new Date().toLocaleDateString(),
      time: "10:00 AM",
      location: "Main Zoo Area",
      description: "",
      duration: "30 minutes",
      host: "Zoo Staff",
      status: "Scheduled",
      attendees: 0
    });
  };

  const handleAddEvent = async () => {
    if (!eventData.title) {
      toast.error("Event title is required");
      return;
    }

    setLoading(true);
    try {
      const createdEvent = await adminService.createItem<AdminEvent>("events", eventData);
      setEvents([...events, createdEvent]);
      
      // Update the events context
      addEvent({
        title: createdEvent.title,
        date: createdEvent.date,
        time: createdEvent.time,
        location: createdEvent.location,
        description: createdEvent.description || "",
        image: createdEvent.imageUrl,
        duration: createdEvent.duration,
        host: createdEvent.host,
        notificationEnabled: false
      });
      
      resetEventData();
      setEventEditorOpen(false);
      toast.success(`${createdEvent.title} added successfully`);
    } catch (error) {
      toast.error("Failed to add event");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent) return;
    if (!eventData.title) {
      toast.error("Event title is required");
      return;
    }

    setLoading(true);
    try {
      const updatedEvent = await adminService.updateItem<AdminEvent>(
        "events", 
        selectedEvent.id, 
        eventData
      );
      
      setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      
      // Update the events context
      updateEvent(selectedEvent.id, {
        id: updatedEvent.id,
        title: updatedEvent.title,
        date: updatedEvent.date,
        time: updatedEvent.time,
        location: updatedEvent.location,
        description: updatedEvent.description || "",
        image: updatedEvent.imageUrl,
        duration: updatedEvent.duration,
        host: updatedEvent.host,
        notificationEnabled: false
      });
      
      setEventEditorOpen(false);
      toast.success(`${updatedEvent.title} updated successfully`);
    } catch (error) {
      toast.error("Failed to update event");
      console.error(error);
    } finally {
      setLoading(false);
      setSelectedEvent(null);
      setIsEditing(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setLoading(true);
      try {
        await adminService.deleteItem("events", id);
        setEvents(events.filter(e => e.id !== id));
        
        // Update the events context
        deleteEvent(id);
        
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error("Failed to delete event");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEventEditor = (event?: AdminEvent) => {
    if (event) {
      setSelectedEvent(event);
      setEventData({
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description || "",
        duration: event.duration || "30 minutes",
        host: event.host || "Zoo Staff",
        status: event.status || "Scheduled",
        attendees: event.attendees || 0
      });
      setIsEditing(true);
    } else {
      setSelectedEvent(null);
      resetEventData();
      setIsEditing(false);
    }
    setEventEditorOpen(true);
  };

  const handleUploadImage = (id: string) => {
    setSelectedEvent(events.find(e => e.id === id) || null);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEvent || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setLoading(true);
    
    try {
      const imageUrl = await adminService.uploadImage(file, "events", selectedEvent.id);
      
      // Update the event with the new image URL
      const updatedEvent = await adminService.updateItem<AdminEvent>(
        "events",
        selectedEvent.id,
        { imageUrl }
      );
      
      setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      toast.success(`Image for ${selectedEvent.title} uploaded successfully`);
      
      // Update in events context
      const contextEvent = events.find(e => e.id === selectedEvent.id);
      if (contextEvent) {
        updateEvent(selectedEvent.id, {
          ...contextEvent,
          image: imageUrl
        });
      }
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setLoading(false);
      setSelectedEvent(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-card dark:bg-card border border-border rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
        <Calendar className="h-5 w-5 text-primary" />
        Events Management
      </h2>
      
      <div className="mb-4 border border-border rounded-lg p-3 bg-muted/30 dark:bg-muted/10">
        <h3 className="text-md font-medium mb-2 text-foreground">Quick Add Event</h3>
        <Button 
          onClick={() => openEventEditor()}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add New Event
        </Button>
      </div>
      
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={() => {
            if (events.length === 0) {
              toast.error("Add events first to manage them");
              return;
            }
            toast.info("Select an event from the list to edit it");
          }}
        >
          <Calendar className="w-4 h-4" />
          <span>Manage Schedule</span>
        </Button>
        <Button 
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={() => {
            if (events.length === 0) {
              toast.error("Add events first before promoting them");
              return;
            }
            toast.info("Feature to promote events coming soon");
          }}
        >
          <MapPin className="w-4 h-4" />
          <span>Promote Events</span>
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading events data...</p>
                </TableCell>
              </TableRow>
            ) : getFilteredEvents().length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No events found matching your criteria</p>
                </TableCell>
              </TableRow>
            ) : (
              getFilteredEvents().map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {event.imageUrl && (
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {event.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{event.date}</TableCell>
                  <TableCell className="text-foreground">{event.time}</TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.status === "Scheduled" 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" 
                        : event.status === "Ongoing"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                        : event.status === "Completed"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                    }`}>
                      {event.status || "Scheduled"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUploadImage(event.id)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <Image className="h-4 w-4" />
                        <span className="sr-only">Upload Image</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event);
                          setEventData({
                            ...event
                          });
                          setIsEditing(true);
                          setEventEditorOpen(true);
                        }}
                        className="h-8 w-8 p-0 hover:bg-muted/60 dark:hover:bg-muted/20"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* Event Editor Dialog */}
      <Dialog open={eventEditorOpen} onOpenChange={setEventEditorOpen}>
        <DialogContent className="w-full max-w-3xl">
          <DialogHeader>
            <DialogTitle>{ isEditing ? "Edit Event" : "Add New Event" }</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-3 text-foreground col-span-2">
              <div>
                <Label htmlFor="event-title" className="text-foreground">Event Title</Label>
                <Input
                  id="event-title"
                  value={eventData.title || ""}
                  onChange={(e) => setEventData({...eventData, title: e.target.value})}
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-date" className="text-foreground">Date</Label>
                  <Input
                    id="event-date"
                    value={eventData.date || ""}
                    onChange={(e) => setEventData({...eventData, date: e.target.value})}
                    placeholder="Event date"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event-time" className="text-foreground">Time</Label>
                  <Input
                    id="event-time"
                    value={eventData.time || ""}
                    onChange={(e) => setEventData({...eventData, time: e.target.value})}
                    placeholder="Event time"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="event-location" className="text-foreground">Location</Label>
                <Input
                  id="event-location"
                  value={eventData.location || ""}
                  onChange={(e) => setEventData({...eventData, location: e.target.value})}
                  placeholder="Event location"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-duration" className="text-foreground">Duration</Label>
                  <Input
                    id="event-duration"
                    value={eventData.duration || ""}
                    onChange={(e) => setEventData({...eventData, duration: e.target.value})}
                    placeholder="Duration (e.g. 30 minutes)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event-host" className="text-foreground">Host</Label>
                  <Input
                    id="event-host"
                    value={eventData.host || ""}
                    onChange={(e) => setEventData({...eventData, host: e.target.value})}
                    placeholder="Event host"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-status" className="text-foreground">Status</Label>
                  <select
                    id="event-status"
                    className="w-full rounded-md border border-input bg-background px-3 h-10 text-foreground"
                    value={eventData.status || "Scheduled"}
                    onChange={(e) => setEventData({
                      ...eventData, 
                      status: e.target.value as AdminEvent['status']
                    })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="event-attendees" className="text-foreground">Expected Attendees</Label>
                  <Input
                    id="event-attendees"
                    type="number"
                    value={eventData.attendees?.toString() || "0"}
                    onChange={(e) => setEventData({...eventData, attendees: parseInt(e.target.value) || 0})}
                    placeholder="Expected number of attendees"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="event-description" className="text-foreground">Description</Label>
                <textarea
                  id="event-description"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px] text-foreground"
                  value={eventData.description || ""}
                  onChange={(e) => setEventData({...eventData, description: e.target.value})}
                  placeholder="Event description"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setEventEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditing ? handleEditEvent : handleAddEvent}
              disabled={loading}
            >
              {isEditing ? "Update Event" : "Add Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="mt-4 border-t border-border pt-4">
        <h3 className="font-medium mb-2 text-foreground">Event Management Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => {
              if (events.length === 0) {
                toast.error("Add events first to manage them");
                return;
              }
              toast.info("Select an event from the list to edit it");
            }}
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Schedule</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => {
              if (events.length === 0) {
                toast.error("Add events first before promoting them");
                return;
              }
              toast.info("Feature to promote events coming soon");
            }}
          >
            <MapPin className="w-4 h-4" />
            <span>Promote Events</span>
          </Button>
        </div>
      </div>
      
      {/* Display alert if no events */}
      {events.length === 0 && !loading && (
        <Alert className="mt-4 border-border bg-muted/20 dark:bg-muted/10">
          <AlertDescription className="text-foreground">
            No events added yet. Use the button above to add your first event.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EventManagement;
