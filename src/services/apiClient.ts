/**
 * API Client for ZooQuest Backend
 * Handles all HTTP communication with the backend server
 */

import type {
  DatabaseAnimal,
  DatabaseEvent,
  DatabaseNotification,
  DatabaseHealthReport,
  DatabaseUser,
  LoginResponse,
  RegisterResponse,
  SystemStats,
  SystemSettings
} from '../types/api';

// Handle environment variables safely for browser
const getApiBaseUrl = () => {
  // Check if we're in a browser environment with webpack
  if (typeof window !== 'undefined') {
    // Check if we're running on mobile (via Capacitor)
    if (window.location.protocol === 'capacitor:') {
      // Mobile app - use machine IP address
      return 'http://192.168.32.225:3000/api';
    }
    // Web browser - use localhost
    return 'http://localhost:3000/api';
  }
  // Fallback for other environments
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || data.message || 'An error occurred',
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Generic HTTP methods
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'GET' });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'DELETE' });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: HeadersInit = {};
      
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }
      // Don't set Content-Type for FormData, let browser set it with boundary

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('FormData upload failed:', error);
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { email: string; password: string; name: string; role?: string }) {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request<DatabaseUser>('/auth/me');
  }

  // Animals endpoints
  async getAnimals() {
    return this.request<DatabaseAnimal[]>('/animals');
  }

  async getAnimal(id: string) {
    return this.request<DatabaseAnimal>(`/animals/${id}`);
  }

  async createAnimal(animalData: Partial<DatabaseAnimal>) {
    return this.request<DatabaseAnimal>('/animals', {
      method: 'POST',
      body: JSON.stringify(animalData),
    });
  }

  async updateAnimal(id: string, animalData: Partial<DatabaseAnimal>) {
    return this.request<DatabaseAnimal>(`/animals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animalData),
    });
  }

  async deleteAnimal(id: string) {
    return this.request<{ message: string }>(`/animals/${id}`, {
      method: 'DELETE',
    });
  }

  // Events endpoints
  async getEvents() {
    return this.request<DatabaseEvent[]>('/events');
  }

  async getEvent(id: string) {
    return this.request<DatabaseEvent>(`/events/${id}`);
  }

  async createEvent(eventData: Partial<DatabaseEvent>) {
    return this.request<DatabaseEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<DatabaseEvent>) {
    return this.request<DatabaseEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string) {
    return this.request<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Health Reports endpoints
  async getHealthReports() {
    return this.request<DatabaseHealthReport[]>('/health-reports');
  }

  async getHealthReport(id: string) {
    return this.request<DatabaseHealthReport>(`/health-reports/${id}`);
  }

  async createHealthReport(reportData: Partial<DatabaseHealthReport>) {
    return this.request<DatabaseHealthReport>('/health-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request<DatabaseNotification[]>('/notifications');
  }

  async createNotification(notificationData: Partial<DatabaseNotification>) {
    return this.request<DatabaseNotification>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async markNotificationAsRead(id: string) {
    return this.request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Users endpoints (admin only)
  async getUsers() {
    return this.request<DatabaseUser[]>('/users');
  }

  async getUser(id: string) {
    return this.request<DatabaseUser>(`/users/${id}`);
  }

  // System endpoints
  async getSystemStats() {
    return this.request<SystemStats>('/system/stats');
  }

  async getSystemSettings() {
    return this.request<SystemSettings>('/system/settings');
  }

  // File upload endpoint
  async uploadFile(file: File, endpoint: string = '/upload') {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || data.message || 'Upload failed',
        };
      }

      return { data };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        error: 'Upload failed',
      };
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Image Upload Methods
  async uploadAnimalImage(animalId: string, imageFile: File) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.baseURL}/uploads/animals/${animalId}`, {
        method: 'POST',
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload animal image');
      }

      return data;
    } catch (error) {
      console.error('Animal image upload failed:', error);
      throw error;
    }
  }

  async uploadEventImage(eventId: string, imageFile: File) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.baseURL}/uploads/events/${eventId}`, {
        method: 'POST',
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload event image');
      }

      return data;
    } catch (error) {
      console.error('Event image upload failed:', error);
      throw error;
    }
  }

  async uploadProfileImage(imageFile: File) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.baseURL}/uploads/profile`, {
        method: 'POST',
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload profile image');
      }

      return data;
    } catch (error) {
      console.error('Profile image upload failed:', error);
      throw error;
    }
  }

  async deleteAnimalImage(animalId: string) {
    return this.request(`/uploads/animals/${animalId}`, {
      method: 'DELETE',
    });
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
