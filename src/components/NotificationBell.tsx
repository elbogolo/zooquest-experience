import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Consider all notifications as seen when the panel opens
      // But we don't mark them as read until user interacts with them
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

        <div className="mt-4 flex flex-col space-y-4 overflow-y-auto max-h-[80vh]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
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
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        
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
