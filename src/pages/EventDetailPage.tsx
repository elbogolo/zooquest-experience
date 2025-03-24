
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Calendar, Bell, Share2, ArrowLeft } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// This would come from an API in a real app
const getEventById = (id: string) => {
  // Sample data matching the events on the home page and events page
  const events = [
    {
      id: "event1",
      title: "Lion Feeding",
      time: "10:00 AM",
      location: "Lion Enclosure",
      date: "Today",
      description: "Watch our lions during their feeding time. Learn about their diet and behavior from our expert zookeepers.",
      image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
      notificationEnabled: false,
      duration: "30 minutes",
      host: "Senior Zookeeper Davis"
    },
    {
      id: "event2",
      title: "Tiger Talk",
      time: "11:30 AM",
      location: "Tiger Territory",
      date: "Today",
      description: "Join our conservation experts for an educational talk about tigers and our conservation efforts.",
      image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
      notificationEnabled: false,
      duration: "45 minutes",
      host: "Dr. Emily Chen, Conservation Specialist"
    },
    {
      id: "event3",
      title: "Gorilla Encounter",
      time: "2:00 PM",
      location: "Gorilla Habitat",
      date: "Today",
      description: "Get up close with our gorilla family and learn about these intelligent primates from our primate specialists.",
      image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
      notificationEnabled: false,
      duration: "40 minutes",
      host: "Primate Specialist Johnson"
    }
  ];
  
  return events.find(event => event.id === id);
};

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    if (id) {
      const eventData = getEventById(id);
      if (eventData) {
        setEvent(eventData);
        setNotificationEnabled(eventData.notificationEnabled);
      } else {
        toast.error("Event not found");
        navigate("/events");
      }
      setLoading(false);
    }
  }, [id, navigate]);

  const toggleNotification = () => {
    const newStatus = !notificationEnabled;
    setNotificationEnabled(newStatus);
    
    if (newStatus) {
      toast.success(`You'll be notified before ${event?.title}`);
    } else {
      toast.info(`Notification for ${event?.title} turned off`);
    }
  };

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
      <PageHeader title="Event Details" showBackButton />
      
      <div className="pt-16">
        {/* Event Image */}
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
        
        {/* Event Details */}
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
              <Button
                variant="outline"
                size="icon"
                className={notificationEnabled ? "text-zoo-primary border-zoo-primary" : ""}
                onClick={toggleNotification}
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
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
