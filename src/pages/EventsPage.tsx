
import { useState } from "react";
import { Calendar, Clock, MapPin, ChevronRight, Bell, Filter } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Sample event data
const events = [
  {
    id: "lion-feeding",
    title: "Lion Feeding",
    time: "10:00 AM",
    location: "Lion Enclosure",
    date: "Today",
    description: "Watch our lions during their feeding time. Learn about their diet and behavior from our expert zookeepers.",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    notificationEnabled: false
  },
  {
    id: "tiger-talk",
    title: "Tiger Talk",
    time: "11:30 AM",
    location: "Tiger Territory",
    date: "Today",
    description: "Join our conservation experts for an educational talk about tigers and our conservation efforts.",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    notificationEnabled: true
  },
  {
    id: "gorilla-encounter",
    title: "Gorilla Encounter",
    time: "2:00 PM",
    location: "Gorilla Habitat",
    date: "Today",
    description: "Get up close with our gorilla family and learn about these intelligent primates from our primate specialists.",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    notificationEnabled: false
  },
  {
    id: "reptile-show",
    title: "Reptile Show",
    time: "3:30 PM",
    location: "Reptile House",
    date: "Today",
    description: "Experience our fascinating reptiles up close in this interactive demonstration.",
    image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
    notificationEnabled: false
  },
  {
    id: "zebra-feeding",
    title: "Zebra Feeding",
    time: "9:30 AM",
    location: "African Savanna",
    date: "Tomorrow",
    description: "Watch our zebra herd during their morning feeding and learn about these striped equids.",
    image: "public/lovable-uploads/c0779203-cebe-4f61-be65-f8939ee46040.png",
    notificationEnabled: false
  },
  {
    id: "tortoise-time",
    title: "Tortoise Time",
    time: "1:00 PM",
    location: "Tortoise Enclosure",
    date: "Tomorrow",
    description: "Meet our giant tortoises and learn about these long-lived reptiles.",
    image: "public/lovable-uploads/009a33ba-77b2-49a3-86ae-0586197bf4ab.png",
    notificationEnabled: false
  }
];

const filterOptions = ["All Events", "Today", "Tomorrow", "This Week", "Feedings", "Talks"];

const EventsPage = () => {
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [eventsList, setEventsList] = useState(events);

  const toggleNotification = (eventId: string) => {
    setEventsList(
      eventsList.map(event => {
        if (event.id === eventId) {
          const newStatus = !event.notificationEnabled;
          if (newStatus) {
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

  const navigateToEvent = (eventId: string) => {
    // In a real app, this would navigate to the event detail page
    // or show the event location on the map
    toast.info(`Navigating to event location on map`);
  };

  // Filter events based on the active filter
  const filteredEvents = eventsList.filter(event => {
    if (activeFilter === "All Events") return true;
    if (activeFilter === "Today") return event.date === "Today";
    if (activeFilter === "Tomorrow") return event.date === "Tomorrow";
    // Additional filters would be implemented here
    return true;
  });

  return (
    <div className="min-h-screen pb-20 bg-white">
      <PageHeader title="Events & Schedules" showBackButton showSettings />
      
      <div className="pt-16 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>
        
        <div className="mb-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setActiveFilter(option)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeFilter === option
                    ? "bg-zoo-primary text-white"
                    : "bg-white border border-gray-200 text-gray-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex h-24">
                <div className="w-1/3 h-full overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800">{event.title}</h3>
                      <button
                        onClick={() => toggleNotification(event.id)}
                        className={`rounded-full p-1 ${
                          event.notificationEnabled ? "text-zoo-primary" : "text-gray-400"
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="mr-2">{event.time}</span>
                      <span className="bg-zoo-secondary text-zoo-primary px-2 py-0.5 rounded-full text-xs">
                        {event.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <button
                      onClick={() => navigateToEvent(event.id)}
                      className="text-zoo-primary flex items-center text-xs"
                    >
                      View on map <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <button className="text-gray-500">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h3 className="font-medium">July 2023</h3>
              <button className="text-gray-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }, (_, i) => (
                <button
                  key={i}
                  className={`rounded-full w-8 h-8 mx-auto flex items-center justify-center text-sm ${
                    i === 14
                      ? "bg-zoo-primary text-white"
                      : i === 15 || i === 20
                      ? "bg-zoo-secondary text-zoo-primary"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default EventsPage;
