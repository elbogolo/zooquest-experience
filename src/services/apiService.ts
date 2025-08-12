/**
 * API Service for ZooQuest Backend Communication
 * Handles all HTTP requests to the Express backend server
 */

import type {
  DatabaseAnimal,
  DatabaseEvent,
  DatabaseNotification,
  DatabaseHealthReport,
  DatabaseUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SystemStats,
  SystemSettings,
  ApiErrorResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'zooquest_auth_token';
  
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Basic token expiry check (decode JWT payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

// Base API client
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Add authentication header if token exists
    const token = TokenManager.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Request failed', data);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(0, 'Network error or server unavailable');
    }
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API client instance
const apiClient = new ApiClient(API_BASE_URL);

// API Services
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    
    TokenManager.setToken(response.token);
    return response;
  },
  
  async register(email: string, password: string, name: string, role: string = 'visitor'): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', { email, password, name, role });
    
    TokenManager.setToken(response.token);
    return response;
  },
  
  async getCurrentUser(): Promise<DatabaseUser> {
    return apiClient.get<DatabaseUser>('/auth/me');
  },
  
  async logout(): Promise<{ message: string }> {
    TokenManager.removeToken();
    return apiClient.post<{ message: string }>('/auth/logout');
  },
  
  isAuthenticated: () => TokenManager.isAuthenticated(),
  getToken: () => TokenManager.getToken(),
};

export const animalsApi = {
  async getAll(): Promise<DatabaseAnimal[]> {
    return apiClient.get<DatabaseAnimal[]>('/animals');
  },
  
  async getById(id: string): Promise<DatabaseAnimal> {
    return apiClient.get<DatabaseAnimal>(`/animals/${id}`);
  },
  
  async create(data: Partial<DatabaseAnimal>): Promise<DatabaseAnimal> {
    return apiClient.post<DatabaseAnimal>('/animals', data);
  },
  
  async update(id: string, data: Partial<DatabaseAnimal>): Promise<DatabaseAnimal> {
    return apiClient.put<DatabaseAnimal>(`/animals/${id}`, data);
  },
  
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/animals/${id}`);
  },
  
  async getByStatus(status: string): Promise<DatabaseAnimal[]> {
    return apiClient.get<DatabaseAnimal[]>(`/animals/status/${status}`);
  },
  
  async search(query: string): Promise<DatabaseAnimal[]> {
    return apiClient.get<DatabaseAnimal[]>(`/animals/search/${encodeURIComponent(query)}`);
  },
};

export const eventsApi = {
  async getAll(): Promise<DatabaseEvent[]> {
    return apiClient.get<DatabaseEvent[]>('/events');
  },
  
  async getById(id: string): Promise<DatabaseEvent> {
    return apiClient.get<DatabaseEvent>(`/events/${id}`);
  },
  
  async create(data: Partial<DatabaseEvent>): Promise<DatabaseEvent> {
    return apiClient.post<DatabaseEvent>('/events', data);
  },
  
  async update(id: string, data: Partial<DatabaseEvent>): Promise<DatabaseEvent> {
    return apiClient.put<DatabaseEvent>(`/events/${id}`, data);
  },
  
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/events/${id}`);
  },
};

export const notificationsApi = {
  async getAll(): Promise<DatabaseNotification[]> {
    return apiClient.get<DatabaseNotification[]>('/notifications');
  },
  
  async getById(id: string): Promise<DatabaseNotification> {
    return apiClient.get<DatabaseNotification>(`/notifications/${id}`);
  },
  
  async create(data: Partial<DatabaseNotification>): Promise<DatabaseNotification> {
    return apiClient.post<DatabaseNotification>('/notifications', data);
  },
  
  async update(id: string, data: Partial<DatabaseNotification>): Promise<DatabaseNotification> {
    return apiClient.put<DatabaseNotification>(`/notifications/${id}`, data);
  },
  
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/${id}`);
  },
};

export const healthReportsApi = {
  async getAll(): Promise<DatabaseHealthReport[]> {
    return apiClient.get<DatabaseHealthReport[]>('/health-reports');
  },
  
  async getByAnimalId(animalId: string): Promise<DatabaseHealthReport[]> {
    return apiClient.get<DatabaseHealthReport[]>(`/health-reports/animal/${animalId}`);
  },
  
  async create(data: Partial<DatabaseHealthReport>): Promise<DatabaseHealthReport> {
    return apiClient.post<DatabaseHealthReport>('/health-reports', data);
  },
};

export const usersApi = {
  async getAll(): Promise<DatabaseUser[]> {
    return apiClient.get<DatabaseUser[]>('/users');
  },
  
  async getById(id: string): Promise<DatabaseUser> {
    return apiClient.get<DatabaseUser>(`/users/${id}`);
  },
};

export const systemApi = {
  async getStats(): Promise<SystemStats> {
    return apiClient.get<SystemStats>('/system/stats');
  },
  
  async getSettings(): Promise<SystemSettings> {
    return apiClient.get<SystemSettings>('/system/settings');
  },
  
  async backup(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/system/backup');
  },
  
  async reset(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/system/reset');
  }
};

// Export types and utilities
export { ApiError, TokenManager };
export default apiClient;
