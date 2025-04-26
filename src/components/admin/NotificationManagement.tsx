
import React, { useState, useEffect } from "react";
import { Bell, Edit, Trash2, Send, Calendar, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminNotification } from "@/types/admin";
import { notificationService } from "@/services/notificationService";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationManagementProps {
  searchQuery: string;
  filterStatus: string;
}

const NotificationManagement = ({ searchQuery, filterStatus }: NotificationManagementProps) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNotification, setNewNotification] = useState<Partial<AdminNotification>>({
    title: "",
    message: "",
    recipients: "All visitors",
    status: "Draft",
    date: new Date().toLocaleDateString(),
    priority: "Medium"
  });
  const [scheduledDate, setScheduledDate] = useState("");

  const { refetchNotifications: refreshUserNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error("Failed to load notifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || notification.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  };

  const handleCreateNotification = async () => {
    if (!newNotification.title) {
      toast.error("Notification title is required");
      return;
    }

    if (!newNotification.message) {
      toast.error("Notification message is required");
      return;
    }

    setLoading(true);
    try {
      const notificationData = {
        ...newNotification,
        id: crypto.randomUUID().substring(0, 8),
        status: "Draft" as "Draft" | "Scheduled" | "Sent" | "Cancelled"
      };
      const createdNotification = await notificationService.createNotification(notificationData);
      setNotifications([...notifications, createdNotification]);
      setNewNotification({
        title: "",
        message: "",
        recipients: "All visitors",
        status: "Draft",
        date: new Date().toLocaleDateString(),
        priority: "Medium"
      });
      toast.success("Notification saved as draft");
    } catch (error) {
      toast.error("Failed to create notification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error("Title and message are required");
      return;
    }

    const notificationData = {
      ...newNotification,
      id: crypto.randomUUID().substring(0, 8),
      status: "Draft" as "Draft" | "Scheduled" | "Sent" | "Cancelled",
      date: new Date().toLocaleDateString()
    };

    setLoading(true);
    try {
      // First create the notification as a draft
      const createdNotification = await notificationService.createNotification(notificationData);
      
      // Then send it
      const sentNotification = await notificationService.sendNotification(createdNotification.id);
      setNotifications([...notifications.filter(n => n.id !== createdNotification.id), sentNotification]);
      
      // Refresh user notifications to show the new one
      refreshUserNotifications();
      
      setNewNotification({
        title: "",
        message: "",
        recipients: "All visitors",
        status: "Draft",
        date: new Date().toLocaleDateString(),
        priority: "Medium"
      });
      toast.success("Notification sent successfully");
    } catch (error) {
      toast.error("Failed to send notification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error("Title and message are required");
      return;
    }

    if (!scheduledDate) {
      toast.error("Please select a scheduled date");
      return;
    }

    const notificationData = {
      ...newNotification,
      id: crypto.randomUUID().substring(0, 8),
      status: "Draft" as "Draft" | "Scheduled" | "Sent" | "Cancelled",
      scheduledTime: scheduledDate
    };

    setLoading(true);
    try {
      // First create the notification as a draft
      const createdNotification = await notificationService.createNotification(notificationData);
      
      // Then schedule it
      const scheduledNotification = await notificationService.scheduleNotification(createdNotification.id, new Date(scheduledDate));
      setNotifications([...notifications.filter(n => n.id !== createdNotification.id), scheduledNotification]);
      
      setNewNotification({
        title: "",
        message: "",
        recipients: "All visitors",
        status: "Draft",
        date: new Date().toLocaleDateString(),
        priority: "Medium"
      });
      setScheduledDate("");
      toast.success(`Notification scheduled for ${scheduledDate}`);
    } catch (error) {
      toast.error("Failed to schedule notification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotification = async (id: string) => {
    const notificationToEdit = notifications.find(n => n.id === id);
    if (!notificationToEdit) return;

    // In a real app, you would open a modal for editing
    // This is a simplified example for demo purposes
    const updatedTitle = `${notificationToEdit.title} (Updated)`;
    
    setLoading(true);
    try {
      const updatedNotification = await notificationService.updateNotification(
        id, 
        { 
          title: updatedTitle,
          status: notificationToEdit.status,
          recipients: notificationToEdit.recipients,
          date: notificationToEdit.date
        }
      );
      
      setNotifications(notifications.map(n => n.id === id ? updatedNotification : n));
      toast.success("Notification updated successfully");
      
      // Refresh user notifications if this was a sent notification
      if (notificationToEdit.status === "Sent") {
        refreshUserNotifications();
      }
    } catch (error) {
      toast.error("Failed to update notification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      setLoading(true);
      try {
        await notificationService.deleteNotification(id);
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success("Notification deleted successfully");
        
        // Refresh user notifications to make sure deleted ones are removed
        refreshUserNotifications();
      } catch (error) {
        toast.error("Failed to delete notification");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        Notifications Management
      </h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading notifications data...</p>
                </TableCell>
              </TableRow>
            ) : getFilteredNotifications().length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-gray-500">No notifications found matching your criteria</p>
                </TableCell>
              </TableRow>
            ) : (
              getFilteredNotifications().map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell>{notification.recipients}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notification.status === "Sent" 
                        ? "bg-green-100 text-green-800" 
                        : notification.status === "Scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : notification.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {notification.status}
                    </span>
                  </TableCell>
                  <TableCell className="flex flex-col">
                  <span>{notification.date}</span>
                  {notification.priority && (
                    <Badge variant={notification.priority === "High" ? "destructive" : 
                                   notification.priority === "Medium" ? "default" : 
                                   "outline"} 
                           className="mt-1 inline-flex w-fit text-xs">
                      {notification.priority === "High" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {notification.priority}
                    </Badge>
                  )}
                </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditNotification(notification.id)}
                        className="h-8 w-8 p-0"
                        disabled={loading || notification.status === "Sent"}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium mb-2">Send New Notification</h3>
        <div className="space-y-2">
          <div>
            <Label htmlFor="notification-title">Title</Label>
            <Input 
              id="notification-title"
              type="text" 
              placeholder="Notification title" 
              className="w-full"
              value={newNotification.title}
              onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="notification-recipients">Recipients</Label>
            <select 
              id="notification-recipients"
              className="w-full h-10 px-3 py-2 border rounded-md"
              value={newNotification.recipients}
              onChange={(e) => setNewNotification({...newNotification, recipients: e.target.value})}
            >
              <option value="All Visitors">All Visitors</option>
              <option value="Today's Visitors">Today's Visitors</option>
              <option value="Members Only">Members Only</option>
              <option value="Staff Only">Staff Only</option>
            </select>
          </div>
          <div>
            <Label htmlFor="notification-message">Message</Label>
            <textarea 
              id="notification-message"
              placeholder="Notification message" 
              className="w-full p-2 border rounded-md min-h-[80px]"
              value={newNotification.message}
              onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="notification-priority">Priority</Label>
            <select 
              id="notification-priority"
              className="w-full h-10 px-3 py-2 border rounded-md mt-1"
              value={newNotification.priority || "Medium"}
              onChange={(e) => setNewNotification({
                ...newNotification, 
                priority: e.target.value as "Low" | "Medium" | "High" | undefined
              })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCreateNotification}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              onClick={handleSendNotification}
              className="flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Send className="w-4 h-4" />
              <span>Send Now</span>
            </Button>
          </div>
          <div className="border-t pt-3 mt-3">
            <Label htmlFor="scheduled-date">Schedule for later</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleScheduleNotification}
                disabled={loading || !scheduledDate}
                className="whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
