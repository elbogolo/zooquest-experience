
import { toast } from "sonner";

// Helper to simulate API delays with optional failure rate
export const simulateAPI = async (response: any, failureRate = 0): Promise<any> => {
  const delay = Math.random() * 500 + 300; // 300-800ms delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate random failures if specified
  if (failureRate > 0 && Math.random() < failureRate) {
    throw new Error("API request failed");
  }
  
  return response;
};

// Mock database for all admin services
export const mockDatabase = {
  animals: [
    { id: "lion", name: "Lion", location: "Lion Enclosure", status: "Healthy", lastCheckup: "2023-07-10" },
    { id: "tiger", name: "Tiger", location: "Tiger Territory", status: "Under observation", lastCheckup: "2023-07-08" },
    { id: "gorilla", name: "Gorilla", location: "Gorilla Habitat", status: "Healthy", lastCheckup: "2023-07-12" },
    { id: "crocodile", name: "Crocodile", location: "Reptile House", status: "Healthy", lastCheckup: "2023-07-05" },
    { id: "elephant", name: "Elephant", location: "Savanna Area", status: "Healthy", lastCheckup: "2023-07-09" },
    { id: "giraffe", name: "Giraffe", location: "Giraffe Overlook", status: "Scheduled for checkup", lastCheckup: "2023-06-28" }
  ],
  events: [
    { id: "event1", title: "Feeding Time", date: "Today", time: "10:00 AM", location: "Lion Enclosure", status: "Scheduled" },
    { id: "event2", title: "Zoo Tour", date: "Tomorrow", time: "09:00 AM", location: "Main Entrance", status: "Scheduled" },
    { id: "event3", title: "Bird Show", date: "Today", time: "02:00 PM", location: "Aviary", status: "Scheduled" },
    { id: "event4", title: "Conservation Talk", date: "This Weekend", time: "11:00 AM", location: "Education Center", status: "Scheduled" }
  ],
  notifications: [
    { id: "notif1", title: "Zoo closing early", status: "Sent", recipients: "All visitors", date: "2023-07-14", message: "Due to expected severe weather, the zoo will close at 3:00 PM today." },
    { id: "notif2", title: "Tiger exhibit closed", status: "Scheduled", recipients: "Today's visitors", date: "2023-07-15", message: "The tiger exhibit will be temporarily closed for maintenance." },
    { id: "notif3", title: "New panda exhibit", status: "Draft", recipients: "All members", date: "2023-07-20", message: "We're excited to announce our new panda exhibit opening next month!" },
    { id: "notif4", title: "Holiday hours", status: "Sent", recipients: "All visitors", date: "2023-07-11", message: "Special holiday opening hours next week." }
  ],
  staff: [],
  healthReports: [],
  systemSettings: {
    enableNotifications: true,
    lastBackupDate: new Date().toISOString(),
    theme: "light" as const
  }
};
