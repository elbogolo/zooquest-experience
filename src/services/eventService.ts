
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
    const newEvent = {
      id: `event-${Date.now()}`,
      title: data.title || "New Event",
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || "12:00",
      location: data.location || "Main Area",
      status: data.status || "Scheduled", // Ensure status is always provided
      ...data,
      createdAt: new Date().toISOString()
    } as AdminEvent;
    
    // Validation for required fields in the mock database structure
    if (!newEvent.title) newEvent.title = "New Event";
    if (!newEvent.date) newEvent.date = new Date().toISOString().split('T')[0];
    if (!newEvent.time) newEvent.time = "12:00";
    if (!newEvent.location) newEvent.location = "Main Area";
    if (!newEvent.status) newEvent.status = "Scheduled";
    
    mockDatabase.events.push(newEvent);
    return simulateAPI(newEvent);
  },

  updateEvent: async (id: string, data: Partial<AdminEvent>): Promise<AdminEvent> => {
    const index = mockDatabase.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Event not found: ${id}`);
    
    const updatedEvent = {
      ...mockDatabase.events[index],
      ...data,
      // Ensure required fields are present
      title: data.title || mockDatabase.events[index].title || "Untitled Event",
      date: data.date || mockDatabase.events[index].date || new Date().toISOString().split('T')[0],
      time: data.time || mockDatabase.events[index].time || "12:00",
      location: data.location || mockDatabase.events[index].location || "Main Area",
      status: data.status || mockDatabase.events[index].status || "Scheduled",
      updatedAt: new Date().toISOString()
    } as AdminEvent;
    
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
