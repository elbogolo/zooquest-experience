
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
      status: "Scheduled", // Set a default status
      ...data,
      createdAt: new Date().toISOString()
    } as AdminEvent;
    
    mockDatabase.events.push(newEvent);
    return simulateAPI(newEvent);
  },

  updateEvent: async (id: string, data: Partial<AdminEvent>): Promise<AdminEvent> => {
    const index = mockDatabase.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Event not found: ${id}`);
    
    const updatedEvent = {
      ...mockDatabase.events[index],
      ...data,
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
