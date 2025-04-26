import React, { useState, useEffect, ReactNode } from 'react';
import { AdminNotification } from '@/types/admin';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { NotificationContext, NotificationContextType } from './notification-context';

// Provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readNotifications, setReadNotifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const { user } = useAuth();
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

  // Fetch notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications();
      
      // Filter notifications based on user role or other criteria
      // For now, we're showing all notifications to all users
      setNotifications(data);
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [user, fetchNotifications]);

  // Store read notifications in local storage
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  }, [readNotifications]);

  // Mark a notification as read
  const markAsRead = React.useCallback((id: string) => {
    if (!readNotifications.includes(id)) {
      setReadNotifications(prev => [...prev, id]);
    }
  }, [readNotifications]);

  // Mark all notifications as read
  const markAllAsRead = React.useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(allIds);
  }, [notifications]);

  // Dismiss a notification (just marks it as read for now)
  const dismissNotification = React.useCallback(async (id: string) => {
    markAsRead(id);
    // In a real app, we might call an API to update the notification status
  }, [markAsRead]);

  // Update the context value
  const contextValue: NotificationContextType = React.useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    loading,
    error,
    refetchNotifications: fetchNotifications
  }), [
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    loading,
    error,
    fetchNotifications
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Context export is handled above
