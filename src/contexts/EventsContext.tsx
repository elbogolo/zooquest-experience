
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface Event {
  id: string;
  title: string;
  time: string;
  location: string;
  date: string;
  description: string;
  image: string;
  notificationEnabled: boolean;
  duration?: string;
  host?: string;
}

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, eventData: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  toggleNotification: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  // Load events from localStorage on component mount
  useEffect(() => {
    const storedEvents = localStorage.getItem("zooEvents");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      // Initial default events if none exist in storage
      const defaultEvents: Event[] = [
        {
          id: "lion-feeding",
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
          id: "tiger-talk",
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
          id: "gorilla-encounter",
          title: "Gorilla Encounter",
          time: "2:00 PM",
          location: "Gorilla Habitat",
          date: "Today",
          description: "Get up close with our gorilla family and learn about these intelligent primates from our primate specialists.",
          image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
          notificationEnabled: false,
          duration: "40 minutes",
          host: "Primate Specialist Johnson"
        },
        {
          id: "reptile-show",
          title: "Reptile Show",
          time: "3:30 PM",
          location: "Reptile House",
          date: "Today",
          description: "Experience our fascinating reptiles up close in this interactive demonstration.",
          image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
          notificationEnabled: false,
          duration: "35 minutes",
          host: "Reptile Expert Smith"
        },
        {
          id: "zebra-feeding",
          title: "Zebra Feeding",
          time: "9:30 AM",
          location: "African Savanna",
          date: "Tomorrow",
          description: "Watch our zebra herd during their morning feeding and learn about these striped equids.",
          image: "public/lovable-uploads/c0779203-cebe-4f61-be65-f8939ee46040.png",
          notificationEnabled: false,
          duration: "25 minutes",
          host: "Zookeeper Williams"
        },
        {
          id: "tortoise-time",
          title: "Tortoise Time",
          time: "1:00 PM",
          location: "Tortoise Enclosure",
          date: "Tomorrow",
          description: "Meet our giant tortoises and learn about these long-lived reptiles.",
          image: "public/lovable-uploads/009a33ba-77b2-49a3-86ae-0586197bf4ab.png",
          notificationEnabled: false,
          duration: "40 minutes",
          host: "Reptile Specialist Garcia"
        }
      ];
      setEvents(defaultEvents);
      localStorage.setItem("zooEvents", JSON.stringify(defaultEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("zooEvents", JSON.stringify(events));
  }, [events]);

  const addEvent = (eventData: Omit<Event, "id">) => {
    const id = eventData.title.toLowerCase().replace(/\s+/g, "-");
    const newEvent = { ...eventData, id, notificationEnabled: false };
    setEvents(prev => [...prev, newEvent]);
    toast.success(`New event "${eventData.title}" added`);
  };

  const updateEvent = (id: string, eventData: Partial<Event>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, ...eventData } : event
      )
    );
    toast.success(`Event "${eventData.title || 'Selected event'}" updated`);
  };

  const deleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    setEvents(prev => prev.filter(event => event.id !== id));
    if (eventToDelete) {
      toast.success(`Event "${eventToDelete.title}" deleted`);
    }
  };

  const toggleNotification = (id: string) => {
    setEvents(prev => 
      prev.map(event => {
        if (event.id === id) {
          const newStatus = !event.notificationEnabled;
          
          if (newStatus) {
            scheduleMockNotification(event.title);
            toast.success(`You'll be notified before ${event.title}`);
          } else {
            toast.info(`Notification for ${event.title} turned off`);
          }
          
          return { ...event, notificationEnabled: newStatus };
        }
        return event;
      })
    );
  };

  const scheduleMockNotification = (eventTitle: string) => {
    // This would be replaced with actual notification logic in a real app
    // For demo purposes, we'll just show a toast after a short delay
    setTimeout(() => {
      const notificationToast = toast.info(
        `Upcoming event: ${eventTitle} will start soon!`,
        {
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              console.log(`Notification clicked for ${eventTitle}`);
              // This would navigate to the event in a real implementation
            }
          }
        }
      );
      return notificationToast;
    }, 10000); // Show notification after 10 seconds to demo functionality
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleNotification,
        getEventById
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
