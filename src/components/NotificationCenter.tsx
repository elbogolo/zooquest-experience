import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, CheckAll, X, Trash2, Settings } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { userService } from '@/services/userService';
import { AdminNotification } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const currentUser = userService.getCurrentUser();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    checkPushPermission();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const userNotifications = await notificationService.getUserNotifications();
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleTogglePushNotifications = async () => {
    if (!currentUser) {
      toast.error('Please log in to manage notifications');
      return;
    }

    try {
      if (!pushEnabled) {
        // Request permission
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            // In a real app, you'd register a service worker here
            const subscription = {
              userId: currentUser.id,
              endpoint: 'mock-endpoint',
              keys: {
                p256dh: 'mock-key',
                auth: 'mock-auth'
              }
            };
            
            await notificationService.subscribeToPush(subscription);
            setPushEnabled(true);
          } else {
            toast.error('Push notifications permission denied');
          }
        }
      } else {
        // Unsubscribe
        await notificationService.unsubscribeFromPush(currentUser.id);
        setPushEnabled(false);
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
    }
  };

  const formatNotificationTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <CheckAll className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm">Push Notifications</span>
              </div>
              <Switch
                checked={pushEnabled}
                onCheckedChange={handleTogglePushNotifications}
                disabled={!currentUser}
              />
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellOff className="h-8 w-8 mx-auto mb-2" />
                <p>No notifications yet</p>
                <p className="text-sm">You'll see important updates here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {notification.title}
                          </p>
                          {notification.priority && (
                            <Badge 
                              variant="outline"
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatNotificationTime(notification.date)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  // In a real app, navigate to full notifications page
                }}
                className="text-sm"
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
