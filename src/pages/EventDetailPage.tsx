import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Share } from "lucide-react";
import BackButton from "@/components/BackButton";
import BottomNavbar from "@/components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AdminEvent } from "@/types/admin";
import { eventService } from "@/services/adminService";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useAuth();

  // Fetch event data from backend
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        const events = await eventService.getAll();
        const foundEvent = events.find(e => e.id?.toString() === id);
        
        setEvent(foundEvent || null);
        
        // Check if user is already registered
        if (foundEvent) {
          const registeredEvents = localStorage.getItem('registeredEvents');
          if (registeredEvents) {
            const events = JSON.parse(registeredEvents);
            setIsRegistered(events.includes(id));
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = () => {
    if (!user) {
      toast.error("Please sign in to register for events");
      return;
    }
    
    if (!event) return;
    
    // Check if event has capacity limit (using attendees field as max capacity)
    if (event.attendees && event.attendees > 0) {
      // For now, we'll assume there's some capacity check
      // In a real app, this would be tracked by the backend
    }

    // Toggle registration status
    const newStatus = !isRegistered;
    setIsRegistered(newStatus);
    
    // Update local storage
    const registeredEvents = localStorage.getItem('registeredEvents');
    let events = registeredEvents ? JSON.parse(registeredEvents) : [];
    
    if (newStatus) {
      if (!events.includes(id)) {
        events.push(id);
      }
      toast.success(`You have registered for ${event?.title}`);
    } else {
      events = events.filter((eventId: string) => eventId !== id);
      toast.info(`You have cancelled your registration for ${event?.title}`);
    }
    
    localStorage.setItem('registeredEvents', JSON.stringify(events));
  };
  
  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      }).catch(() => {
        toast.info("Sharing functionality would open native share dialog");
      });
    } else {
      toast.info("Sharing functionality would open native share dialog");
    }
  };

  const navigateToMap = () => {
    // Pass the event location as state to the map page
    navigate("/map", { state: { eventLocation: event?.location } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-xs text-primary">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-lg font-bold mb-2">Event Not Found</h2>
        <p className="text-xs text-muted-foreground mb-4">We couldn't find the event you're looking for.</p>
        <Button onClick={() => navigate("/events")} className="h-8 text-xs">View All Events</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-background border-b border-border">
        <BackButton />
        <h1 className="text-sm font-semibold text-foreground truncate px-2">{event.title}</h1>
        <button 
          onClick={shareEvent}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary"
          aria-label="Share event"
        >
          <Share className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Content with proper bottom padding to avoid overlap with fixed button */}
      <div className="p-3 pb-32">
        {/* Event Image */}
        <div className="w-full h-48 bg-secondary/20 rounded-lg overflow-hidden mb-4">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${event.imageUrl ? 'hidden' : ''}`}>
            <div className="text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Event Image</p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <h2 className="text-sm font-bold text-foreground mb-1">{event.title}</h2>
            <p className="text-xs text-muted-foreground mb-3">{formatDate(event.date)} at {event.time}</p>
            {event.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">About This Event</h3>
                <p className="text-xs text-foreground/80 leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>
          
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
              <Calendar className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-xs text-foreground font-medium">{formatDate(event.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
              <Clock className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Time & Duration</p>
                <p className="text-xs text-foreground font-medium">{event.time} {event.duration && `(${event.duration})`}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
              <MapPin className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-xs text-foreground font-medium">{event.location}</p>
              </div>
            </div>

            {event.host && (
              <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
                <Users className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Host</p>
                  <p className="text-xs text-foreground font-medium">{event.host}</p>
                </div>
              </div>
            )}

            {event.attendees && event.attendees > 0 && (
              <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
                <Users className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Expected Attendees</p>
                  <p className="text-xs text-foreground font-medium">{event.attendees} people</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register Button */}
      <div className="fixed bottom-20 left-0 right-0 p-3">
        <Button 
          onClick={handleRegister} 
          className="w-full h-8 text-xs" 
          variant={isRegistered ? "outline" : "default"}
          disabled={!user}
        >
          {isRegistered ? 'Cancel Registration' : 'Register for Event'}
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default EventDetailPage;
