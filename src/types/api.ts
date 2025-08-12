/**
 * API Response Types for Backend Communication
 */

// Database response types (from backend API)
export interface DatabaseAnimal {
  id: string;
  name: string;
  species: string;
  location: string;
  status: "healthy" | "sick" | "quarantine" | "treatment";
  last_checkup?: string;
  next_checkup?: string;
  dietary_needs?: string;
  medical_history?: string;
  caretaker?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  duration?: number;
  host?: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  registered_count: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  status: "scheduled" | "draft" | "sent";
  priority: "low" | "medium" | "high";
  recipients: string;
  created_by: string;
  created_at: string;
  scheduled_for?: string;
}

export interface DatabaseHealthReport {
  id: string;
  animal_id: string;
  report_date: string;
  veterinarian: string;
  findings: string;
  treatment?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "visitor";
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: DatabaseUser;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface RegisterResponse {
  message: string;
  user: DatabaseUser;
  token: string;
}

export interface SystemStats {
  totalAnimals: number;
  totalEvents: number;
  totalNotifications: number;
  totalHealthReports: number;
  totalUsers: number;
  healthyAnimals: number;
  upcomingEvents: number;
  sentNotifications: number;
}

export interface SystemSettings {
  enableNotifications: boolean;
  theme: "light" | "dark" | "system";
  lastBackupDate: string;
}

// API Error response
export interface ApiErrorResponse {
  error: string;
  details?: string;
  validation?: Record<string, string>;
}
