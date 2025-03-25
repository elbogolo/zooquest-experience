
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
    <div className="min-h-screen pb-20 bg-white">
      <PageHeader title="Events & Schedules" showBackButton showSettings />
      
      <div className="pt-16 px-4">
        <div className="mb-4">
          <SearchBar 
            placeholder="Search events..." 
            onSubmit={handleSearch} 
            className="mb-4"
          />
        </div>
        
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
        
        {filteredEvents.length > 0 ? (
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
                        <NotificationIcon 
                          enabled={event.notificationEnabled} 
                          onToggle={() => toggleNotification(event.id)}
                          size="sm"
                        />
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
                      <Link
                        to={`/events/${event.id}`}
                        className="text-zoo-primary flex items-center text-xs"
                      >
                        View details <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-zinc-400 text-lg mb-2">No events found</div>
            <p className="text-zinc-500 text-sm text-center max-w-sm">
              No events match your search criteria. Try adjusting your filters or search term.
            </p>
          </div>
        )}
        
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
