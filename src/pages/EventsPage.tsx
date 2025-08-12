import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ChevronRight, Filter } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import NotificationIcon from "@/components/NotificationIcon";
import { eventService } from "@/services/adminService";
import { AdminEvent } from "@/types/admin";

const filterOptions = ["All Events", "Today", "Tomorrow", "This Week", "Feedings", "Talks"];

const EventsPage = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [searchTerm, setSearchTerm] = useState("");

  // Load events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventData = await eventService.getAll();
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  const isEventInTimeFrame = (eventDate: string, filter: string) => {
    const date = new Date(eventDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    switch (filter) {
      case "Today":
        return date.toDateString() === today.toDateString();
      case "Tomorrow":
        return date.toDateString() === tomorrow.toDateString();
      case "This Week":
        return date >= startOfWeek && date <= endOfWeek;
      default:
        return true;
    }
  };

  const filteredEvents = events.filter(event => {
    // First apply search term filter if present
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Then apply category filter
    if (activeFilter === "All Events") return true;
    if (activeFilter === "Feedings") return event.title.toLowerCase().includes("feeding");
    if (activeFilter === "Talks") return event.title.toLowerCase().includes("talk");
    
    // Apply time-based filters
    return isEventInTimeFrame(event.date, activeFilter);
  });

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Events & Schedules" showBackButton showSettings />
      
      <div className="pt-24 px-4">
        <div className="mb-6">
          <SearchBar 
            placeholder="Search events..." 
            onSubmit={handleSearch} 
            className="mb-6"
          />
          
          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterOptions.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="whitespace-nowrap h-8 text-xs"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Skeleton className="h-12 w-12 rounded" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="p-4 hover:bg-accent transition-colors">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    {/* Event Date Circle */}
                    <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex flex-col items-center justify-center text-white">
                      <div className="text-xs font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}
                      </div>
                      <div className="text-xs">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground mb-1">
                            {event.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatEventDate(event.date)}</span>
                            </div>
                          </div>
                          
                          {event.attendees && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground">
                                Attendees: {event.attendees}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <NotificationIcon 
                            enabled={false}
                            onToggle={() => {
                              // Handle notification toggle
                              toast.success("Notification preferences updated");
                            }}
                            size="sm"
                          />
                          <Link to={`/events/${event.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CardContent className="p-0">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-medium text-foreground mb-2">No events found</h3>
              <p className="text-xs text-muted-foreground">
                {searchTerm || activeFilter !== "All Events" 
                  ? "Try adjusting your search or filter criteria"
                  : "No events are currently scheduled"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default EventsPage;
