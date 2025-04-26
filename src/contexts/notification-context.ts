import { createContext } from 'react';
import { AdminNotification } from '@/types/admin';

// Define the shape of our context
export interface NotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  loading: boolean;
  error: string | null;
  refetchNotifications: () => Promise<void>;
}

// Create the context
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
