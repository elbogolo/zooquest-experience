export interface AdminAnimal {
  id: string;
  name: string;
  species?: string;
  location?: string | { lat: number; lng: number };
  status: "Healthy" | "Under observation" | "Scheduled for checkup" | "Treatment required";
  lastCheckup: string;
  nextCheckup?: string;
  dietaryNeeds?: string;
  medicalHistory?: string[];
  caretaker?: string;
  imageUrl?: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  duration?: string;
  host?: string;
  status?: "Scheduled" | "Ongoing" | "Completed" | "Cancelled";
  attendees?: number;
  imageUrl?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  status: "Draft" | "Scheduled" | "Sent" | "Cancelled";
  recipients: string;
  date: string;
  message?: string;
  priority?: "Low" | "Medium" | "High";
  sender?: string;
  scheduledTime?: string;
}

export interface AdminStaff {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Active" | "On Leave" | "Inactive";
  email?: string;
  phone?: string;
  startDate?: string;
  permissions?: string[];
}

export interface AdminSystemSettings {
  enableNotifications: boolean;
  lastBackupDate: string;
  theme: "light" | "dark" | "system";
}

export interface AdminHealthReport {
  id: string;
  animalId: string;
  date: string;
  veterinarian: string;
  findings: string;
  recommendations: string;
  followUpDate?: string;
}

export type AdminItemType = AdminAnimal | AdminEvent | AdminNotification | AdminStaff;
