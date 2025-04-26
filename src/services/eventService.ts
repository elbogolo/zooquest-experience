
import { AdminEvent } from "@/types/admin";
import { mockDatabase, simulateAPI } from "@/utils/adminUtils";

export const eventService = {
  getEvents: async (): Promise<AdminEvent[]> => {
    console.log("Fetching all events");
    return simulateAPI(mockDatabase.events);
  },

  getEvent: async (id: string): Promise<AdminEvent | null> => {
    console.log(`Fetching event with ID: ${id}`);
    const event = mockDatabase.events.find(e => e.id === id);
    return simulateAPI(event || null);
  },

  createEvent: async (data: Partial<AdminEvent>): Promise<AdminEvent> => {
    // Default event properties
    const newEvent: AdminEvent = {
      id: crypto.randomUUID().substring(0, 8),
      title: data.title || "New Event",
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || "12:00",
      location: data.location || "Main Area",
      status: (data.status || "Scheduled") as "Scheduled" | "Ongoing" | "Completed" | "Cancelled", // Always provide a default status
      description: data.description || "",
      duration: data.duration,
      host: data.host,
      attendees: data.attendees,
      imageUrl: data.imageUrl
    };
    
    // Ensure the event object has all required fields before adding to database
    const validEvent = ensureRequiredFields(newEvent);
    mockDatabase.events.push(validEvent);
    return simulateAPI(validEvent);
  },

  updateEvent: async (id: string, data: Partial<AdminEvent>): Promise<AdminEvent> => {
    const index = mockDatabase.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Event not found: ${id}`);
    
    // Ensure all required fields are present with default values
    const updatedEvent: AdminEvent = {
      ...mockDatabase.events[index],
      ...data,
      // Ensure required fields have values
      title: data.title || mockDatabase.events[index].title || "Untitled Event",
      date: data.date || mockDatabase.events[index].date || new Date().toISOString().split('T')[0],
      time: data.time || mockDatabase.events[index].time || "12:00",
      location: data.location || mockDatabase.events[index].location || "Main Area",
      status: (data.status || mockDatabase.events[index].status || "Scheduled") as "Scheduled" | "Ongoing" | "Completed" | "Cancelled"
    };
    
    // Ensure the event object has all required fields before updating the database
    const validEvent = ensureRequiredFields(updatedEvent);
    mockDatabase.events[index] = validEvent;
    return simulateAPI(validEvent);
  },

  deleteEvent: async (id: string): Promise<void> => {
    const index = mockDatabase.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Event not found: ${id}`);
    
    mockDatabase.events.splice(index, 1);
    return simulateAPI(undefined);
  }
};

// Helper function to ensure all required fields are present in an event object
function ensureRequiredFields(event: AdminEvent): AdminEvent & { status: "Scheduled" | "Ongoing" | "Completed" | "Cancelled" } {
  return {
    ...event,
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    status: event.status || "Scheduled" as "Scheduled" | "Ongoing" | "Completed" | "Cancelled"
  };
}
