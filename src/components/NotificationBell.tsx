import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { userService } from '@/services/userService';
import { AdminNotification } from '@/types/admin';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const currentUser = userService.getCurrentUser();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    checkPushPermission();

    // Set up real-time delivery
    const delivery = notificationService.setupRealTimeDelivery();
    delivery.start();

    return () => {
      delivery.stop();
    };
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

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Refresh notifications when panel opens
      loadNotifications();
      loadUnreadCount();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          
          {/* Badge showing unread count */}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.65rem] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs font-normal text-muted-foreground"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Push Notification Settings */}
        <div className="mt-4 p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Push Notifications</span>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handleTogglePushNotifications}
              disabled={!currentUser}
            />
          </div>
          {!currentUser && (
            <p className="text-xs text-muted-foreground mt-1">
              Sign in to enable push notifications
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col space-y-4 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <BellOff className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground/70">We'll notify you when something important happens</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div 
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer hover:bg-secondary/50 transition-colors",
                      { 
                        "border-l-4 border-l-primary": !unreadCount, 
                        "border-l-4 border-l-transparent": unreadCount 
                      }
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        )}
                        
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <span>{format(new Date(notification.date), 'MMM d, yyyy')}</span>
                          {notification.status === 'Scheduled' && notification.scheduledTime && (
                            <span className="ml-2">• Scheduled for {notification.scheduledTime}</span>
                          )}
                        </div>
                      </div>
                      
                      {notification.priority && (
                        <Badge 
                          variant={
                            notification.priority === 'High' 
                              ? 'destructive' 
                              : notification.priority === 'Medium' 
                                ? 'default' 
                                : 'secondary'
                          }
                          className="ml-2"
                        >
                          {notification.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
