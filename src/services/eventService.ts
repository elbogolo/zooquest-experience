
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
    // Ensure all required fields are present with default values
    const newEvent: AdminEvent = {
      id: `event-${Date.now()}`,
      title: data.title || "New Event",
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || "12:00",
      location: data.location || "Main Area",
      status: data.status || "Scheduled", // Always provide a default status
      description: data.description || "",
      duration: data.duration,
      host: data.host,
      attendees: data.attendees,
      imageUrl: data.imageUrl,
      createdAt: new Date().toISOString()
    };
    
    mockDatabase.events.push(newEvent);
    return simulateAPI(newEvent);
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
      status: data.status || mockDatabase.events[index].status || "Scheduled",
      updatedAt: new Date().toISOString()
    };
    
    mockDatabase.events[index] = updatedEvent;
    return simulateAPI(updatedEvent);
  },

  deleteEvent: async (id: string): Promise<void> => {
    const index = mockDatabase.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Event not found: ${id}`);
    
    mockDatabase.events.splice(index, 1);
    return simulateAPI(undefined);
  }
};
