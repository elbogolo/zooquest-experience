import React, { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Image, Calendar, RefreshCw, Plus, Clock, MapPin, Users } from "lucide-react";
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
import { adminService, eventService } from "@/services/adminService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEvents } from "@/contexts/EventsContext";
import type { AdminEvent } from "@/types/admin";

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
      const data = await eventService.getAll();
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

  const openEventEditor = (event?: AdminEvent) => {
    if (event) {
      setSelectedEvent(event);
      setEventData({
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description || "",
        imageUrl: event.imageUrl,
        duration: event.duration,
        host: event.host,
        status: event.status,
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

  const handleAddEvent = async () => {
    if (!eventData.title?.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    setLoading(true);
    try {
      const newEvent = await eventService.create(eventData);
      setEvents([...events, newEvent]);
      
      // Add to events context
      addEvent({
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        description: newEvent.description || "",
        image: newEvent.imageUrl,
        duration: newEvent.duration,
        host: newEvent.host,
        notificationEnabled: false
      });
      
      toast.success(`Event "${newEvent.title}" created successfully`);
      setEventEditorOpen(false);
      resetEventData();
    } catch (error) {
      toast.error("Failed to create event");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent || !eventData.title?.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    setLoading(true);
    try {
      const updatedEvent = await eventService.update(selectedEvent.id, eventData);
      setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      
      // Update in events context
      updateEvent(selectedEvent.id, {
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
      
      toast.success(`Event "${updatedEvent.title}" updated successfully`);
      setEventEditorOpen(false);
      setSelectedEvent(null);
      resetEventData();
    } catch (error) {
      toast.error("Failed to update event");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (event: AdminEvent) => {
    setLoading(true);
    try {
      await eventService.delete(event.id);
      setEvents(events.filter(e => e.id !== event.id));
      
      // Remove from events context
      deleteEvent(event.id);
      
      toast.success(`Event "${event.title}" deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete event");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      const imageData = await adminService.uploadEventImage(selectedEvent.id, file);
      
      // Update the event with the new image URL
      const updatedEvent = await eventService.update(selectedEvent.id, { imageUrl: imageData.imageUrl });
      
      setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      toast.success(`Image for ${selectedEvent.title} uploaded successfully`);
      
      // Update in events context
      const contextEvent = events.find(e => e.id === selectedEvent.id);
      if (contextEvent) {
        updateEvent(selectedEvent.id, {
          ...contextEvent,
          image: imageData.imageUrl
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
    <div className="space-y-4">
      {/* Add New Event Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-foreground">Event Directory</h2>
        <Button 
          onClick={() => openEventEditor()}
          size="sm" 
          className="h-8 text-xs px-3"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Event
        </Button>
      </div>

      {/* Events Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs h-8 w-12">Image</TableHead>
              <TableHead className="text-xs h-8">Event</TableHead>
              <TableHead className="text-xs h-8 hidden sm:table-cell">Date/Time</TableHead>
              <TableHead className="text-xs h-8 hidden md:table-cell">Location</TableHead>
              <TableHead className="text-xs h-8">Status</TableHead>
              <TableHead className="text-xs h-8 w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-xs">Loading events...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : getFilteredEvents().length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <p className="text-xs text-muted-foreground">No events found</p>
                </TableCell>
              </TableRow>
            ) : (
              getFilteredEvents().map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="p-2">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div>
                      <p className="text-xs font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.host}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs py-2 hidden sm:table-cell">
                    <div>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.date}
                      </p>
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs py-2 hidden md:table-cell">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      event.status === "Scheduled" 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : event.status === "Ongoing"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : event.status === "Completed"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => openEventEditor(event)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteEvent(event)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Event Editor Dialog */}
      <Dialog open={eventEditorOpen} onOpenChange={setEventEditorOpen}>
        <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b border-border">
            <DialogTitle className="text-lg font-bold text-foreground">
              {isEditing ? "Edit Event" : "Add New Event"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {isEditing ? "Update event information and settings" : "Create a new zoo event with all necessary details"}
            </p>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="event-title" className="text-xs font-medium text-foreground mb-1.5 block">
                    Event Title *
                  </Label>
                  <Input
                    id="event-title"
                    value={eventData.title || ""}
                    onChange={(e) => setEventData({...eventData, title: e.target.value})}
                    placeholder="Enter event title (e.g., Lion Feeding Time)"
                    className="text-xs h-8"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event-description" className="text-xs font-medium text-foreground mb-1.5 block">
                    Description
                  </Label>
                  <textarea
                    id="event-description"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px] text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={eventData.description || ""}
                    onChange={(e) => setEventData({...eventData, description: e.target.value})}
                    placeholder="Describe the event, what visitors can expect, and any special information..."
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Location Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Schedule & Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="event-date" className="text-xs font-medium text-foreground mb-1.5 block">
                    Date *
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : ""}
                    onChange={(e) => setEventData({...eventData, date: e.target.value})}
                    className="text-xs h-8"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event-time" className="text-xs font-medium text-foreground mb-1.5 block">
                    Time *
                  </Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={eventData.time || ""}
                    onChange={(e) => setEventData({...eventData, time: e.target.value})}
                    className="text-xs h-8"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="event-location" className="text-xs font-medium text-foreground mb-1.5 block">
                    Location *
                  </Label>
                  <Input
                    id="event-location"
                    value={eventData.location || ""}
                    onChange={(e) => setEventData({...eventData, location: e.target.value})}
                    placeholder="e.g., Lion Enclosure, Main Amphitheater"
                    className="text-xs h-8"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event-duration" className="text-xs font-medium text-foreground mb-1.5 block">
                    Duration
                  </Label>
                  <Input
                    id="event-duration"
                    value={eventData.duration || ""}
                    onChange={(e) => setEventData({...eventData, duration: e.target.value})}
                    placeholder="e.g., 30 minutes, 1 hour"
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>

            {/* Event Management Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Event Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="event-host" className="text-xs font-medium text-foreground mb-1.5 block">
                    Host/Staff
                  </Label>
                  <Input
                    id="event-host"
                    value={eventData.host || ""}
                    onChange={(e) => setEventData({...eventData, host: e.target.value})}
                    placeholder="Staff member or department"
                    className="text-xs h-8"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event-status" className="text-xs font-medium text-foreground mb-1.5 block">
                    Status
                  </Label>
                  <select
                    id="event-status"
                    className="w-full rounded-md border border-input bg-background px-3 h-8 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  <Label htmlFor="event-attendees" className="text-xs font-medium text-foreground mb-1.5 block">
                    Expected Attendees
                  </Label>
                  <Input
                    id="event-attendees"
                    type="number"
                    min="0"
                    value={eventData.attendees?.toString() || "0"}
                    onChange={(e) => setEventData({...eventData, attendees: parseInt(e.target.value) || 0})}
                    placeholder="Expected number"
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                setEventEditorOpen(false);
                resetEventData();
              }}
              className="text-xs h-8 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={isEditing ? handleUpdateEvent : handleAddEvent}
              disabled={loading || !eventData.title?.trim()}
              className="text-xs h-8 px-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEditing ? "Update Event" : "Create Event"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
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
