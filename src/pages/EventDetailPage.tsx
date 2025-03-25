
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Calendar, Share2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEvents } from "@/contexts/EventsContext";
import NotificationIcon from "@/components/NotificationIcon";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, getEventById, toggleNotification } = useEvents();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const eventData = getEventById(id);
      if (eventData) {
        setEvent(eventData);
      } else {
        toast.error("Event not found");
        navigate("/events");
      }
      setLoading(false);
    }
  }, [id, navigate, getEventById, events]);

  const handleShare = () => {
    toast.info("Sharing functionality would open native share dialog");
  };

  const navigateToMap = () => {
    toast.info("Navigating to event location on map");
    navigate("/map", { state: { eventLocation: event?.location } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/events")}>View All Events</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Event Details" showBackButton showThemeToggle showUserAvatar />
      
      <div className="pt-16">
        <div className="w-full h-48 relative">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h1 className="text-white text-2xl font-bold">{event.title}</h1>
          </div>
        </div>
        
        <div className="p-5 space-y-6">
          <div className="flex justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-zoo-primary mr-2" />
                <span className="text-foreground">{event.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-zoo-primary mr-2" />
                <span className="text-foreground">{event.time} • {event.duration}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-zoo-primary mr-2" />
                <span className="text-foreground">{event.location}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <NotificationIcon 
                enabled={event.notificationEnabled} 
                onToggle={() => toggleNotification(event.id)}
                className="h-10 w-10"
                size="lg"
              />
              <Button variant="outline" size="icon" onClick={handleShare} className="h-10 w-10">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">About this event</h2>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">Host</h2>
            <p className="text-muted-foreground">{event.host}</p>
          </div>
          
          <Button 
            className="w-full bg-zoo-primary hover:bg-zoo-primary/90"
            onClick={navigateToMap}
          >
            View on Map
          </Button>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default EventDetailPage;
