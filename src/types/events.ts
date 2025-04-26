// Event types for the application
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  notificationEnabled: boolean;
  duration?: string;
  host?: string;
}
