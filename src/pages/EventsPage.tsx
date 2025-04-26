
import { useState } from "react";
import { Calendar, Clock, MapPin, ChevronRight, Filter } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import { useEvents } from "@/contexts/EventsContext";
import NotificationIcon from "@/components/NotificationIcon";

const filterOptions = ["All Events", "Today", "Tomorrow", "This Week", "Feedings", "Talks"];

const EventsPage = () => {
  const { events, toggleNotification } = useEvents();
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredEvents = events.filter(event => {
    // First apply search term filter if present
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Then apply category filter
    if (activeFilter === "All Events") return true;
    if (activeFilter === "Today") return event.date === "Today";
    if (activeFilter === "Tomorrow") return event.date === "Tomorrow";
    if (activeFilter === "This Week") return true; // Simplified for demo
    if (activeFilter === "Feedings") return event.title.toLowerCase().includes("feeding");
    if (activeFilter === "Talks") return event.title.toLowerCase().includes("talk");
    return true;
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
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">Upcoming Events</h2>
          <Button variant="outline" className="rounded-lg bg-card border-border hover:bg-accent/10">
            <Filter className="h-5 w-5 text-foreground mr-2" />
            <span className="text-foreground">Filter</span>
          </Button>
        </div>
        
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 hide-scrollbar">
            {filterOptions.map((filter) => (
              <Button 
                key={filter}
                variant="outline"
                className={`py-2 px-4 rounded-full whitespace-nowrap ${activeFilter === filter 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card text-foreground hover:bg-accent/10'}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        
        {filteredEvents.length > 0 ? (
          <div className="space-y-5">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                    <NotificationIcon
                      enabled={event.notificationEnabled} 
                      onToggle={() => toggleNotification(event.id)}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="mr-2">{event.time}</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                      {event.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <Link
                      to={`/events/${event.id}`}
                      className="text-primary flex items-center text-xs"
                    >
                      View details <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-muted-foreground text-lg mb-2">No events found</div>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              No events match your search criteria. Try adjusting your filters or search term.
            </p>
          </div>
        )}
        
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Calendar View</h2>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <button className="text-muted-foreground">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h3 className="font-medium text-foreground">July 2023</h3>
              <button className="text-muted-foreground">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }, (_, i) => (
                <button
                  key={i}
                  className={`rounded-full w-8 h-8 mx-auto flex items-center justify-center text-sm ${
                    i === 14
                      ? "bg-primary text-primary-foreground"
                      : i === 15 || i === 20
                      ? "bg-primary/20 text-primary"
                      : "text-foreground hover:bg-accent/10"
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
