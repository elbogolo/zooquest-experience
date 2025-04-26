import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Share } from "lucide-react";
import BackButton from "@/components/BackButton";
import BottomNavbar from "@/components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Event } from "@/types/events";

// Sample event data with extended Event type properties
interface ExtendedEvent extends Event {
  maxAttendees: number;
  currentAttendees: number;
}

const sampleEvents: ExtendedEvent[] = [
  {
    id: "1",
    title: "Lion Feeding",
    description: "Watch our lions during their feeding time. Learn about their diet and hunting behaviors from our expert handlers.",
    date: "2023-06-15",
    time: "10:00 AM",
    location: "African Lion Enclosure",
    image: "lovable-uploads/lion-feeding.jpg",
    host: "Zookeeper John",
    duration: "30 minutes",
    maxAttendees: 30,
    currentAttendees: 12,
    notificationEnabled: true
  },
  {
    id: "2",
    title: "Penguin Parade",
    description: "Join us for the famous penguin parade! Watch these adorable birds march in formation as they return to their habitat.",
    date: "2023-06-15",
    time: "2:00 PM",
    location: "Penguin Pool",
    image: "lovable-uploads/penguin-parade.jpg",
    host: "Zookeeper Sarah",
    duration: "45 minutes",
    maxAttendees: 50,
    currentAttendees: 30,
    notificationEnabled: true
  },
  {
    id: "3",
    title: "Reptile Encounter",
    description: "Get up close with some amazing reptiles! Handle friendly snakes and lizards under expert supervision.",
    date: "2023-06-16",
    time: "11:30 AM",
    location: "Reptile House",
    image: "lovable-uploads/reptile-encounter.jpg",
    host: "Reptile Expert Mike",
    duration: "60 minutes",
    maxAttendees: 20,
    currentAttendees: 8,
    notificationEnabled: true
  }
];

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<ExtendedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useAuth();

  // Fetch event data
  useEffect(() => {
    // In a real app, this would be an API call
    const foundEvent = sampleEvents.find(e => e.id === id);
    
    setTimeout(() => {
      setEvent(foundEvent || null);
      setLoading(false);
      
      // Check if user is already registered
      const registeredEvents = localStorage.getItem('registeredEvents');
      if (registeredEvents) {
        const events = JSON.parse(registeredEvents);
        setIsRegistered(events.includes(id));
      }
    }, 500); // Simulate API delay
  }, [id]);

  const handleRegister = () => {
    if (!user) {
      toast.error("Please sign in to register for events");
      return;
    }
    
    if (event && event.currentAttendees >= event.maxAttendees) {
      toast.error("This event is fully booked");
      return;
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
        <div className="animate-pulse text-primary">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-5 text-center">
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the event you're looking for.</p>
        <Button onClick={() => navigate("/events")}>View All Events</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header Image */}
      <div className="relative h-[35vh]">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
          <BackButton color="white" />
          <button 
            onClick={shareEvent}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
            aria-label="Share event"
          >
            <Share className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
          <p className="text-white/90">{formatDate(event.date)} | {event.time}</p>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-5">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">About This Event</h2>
            <p className="text-foreground/80">{event.description}</p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-primary mr-3" />
              <div>
                <p className="text-foreground">{formatDate(event.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-primary mr-3" />
              <div>
                <p className="text-foreground">{event.time} ({event.duration})</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-primary mr-3" />
              <p className="text-foreground">{event.location}</p>
            </div>
            
            <div className="flex items-center">
              <Users className="w-5 h-5 text-primary mr-3" />
              <div>
                <p className="text-foreground">{event.currentAttendees} of {event.maxAttendees} spots filled</p>
                <div className="w-full bg-secondary/30 rounded-full h-2 mt-1">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Host</h2>
            <p className="text-foreground/80">{event.host}</p>
          </div>
          
          <Button 
            onClick={navigateToMap} 
            variant="outline"
            className="w-full mt-4"
          >
            View on Map
          </Button>
        </div>
      </div>

      {/* Register Button */}
      <div className="fixed bottom-20 left-0 right-0 p-5">
        <Button 
          onClick={handleRegister} 
          className="w-full" 
          variant={isRegistered ? "outline" : "default"}
          disabled={!user || (event.currentAttendees >= event.maxAttendees && !isRegistered)}
        >
          {isRegistered ? 'Cancel Registration' : 
            event.currentAttendees >= event.maxAttendees ? 'Event Full' : 'Register for Event'}
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default EventDetailPage;
