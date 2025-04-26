import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from '@/contexts/notification-context';

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};
