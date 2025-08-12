import React, { useState, useEffect } from "react";
import { Bell, Edit, Trash2, Send, Calendar, RefreshCw, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { notificationService } from "@/services/adminService";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationManagementProps {
  searchQuery: string;
  filterStatus: string;
}

const NotificationManagement = ({ searchQuery, filterStatus }: NotificationManagementProps) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
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
      const data = await notificationService.getAll();
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
      const createdNotification = await notificationService.create(notificationData);
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
      const createdNotification = await notificationService.create(notificationData);
      
      // Then send it
      const sentNotification = await notificationService.update(createdNotification.id, { status: "Sent" });
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
      const createdNotification = await notificationService.create(notificationData);
      
      // Then schedule it
      const scheduledNotification = await notificationService.update(createdNotification.id, { status: "Scheduled" });
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
      const updatedNotification = await notificationService.update(id, { 
        title: updatedTitle,
        status: notificationToEdit.status,
        recipients: notificationToEdit.recipients,
        date: notificationToEdit.date
      });
      
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
        await notificationService.delete(id);
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Notification Center</h2>
          <p className="text-xs text-muted-foreground">Manage and send notifications to visitors</p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)}
          size="sm" 
          className="h-8 text-xs px-3 w-fit"
        >
          <Plus className="w-3 h-3 mr-1" />
          Create Notification
        </Button>
      </div>

      {/* Quick Send Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Send</CardTitle>
          <CardDescription className="text-xs">
            Send instant notifications or schedule for later
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="notification-title" className="text-xs font-medium">Title</Label>
              <Input 
                id="notification-title"
                placeholder="Notification title" 
                className="h-8 text-xs"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-recipients" className="text-xs font-medium">Recipients</Label>
              <Select
                value={newNotification.recipients}
                onValueChange={(value) => setNewNotification({...newNotification, recipients: value})}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Visitors">All Visitors</SelectItem>
                  <SelectItem value="Today's Visitors">Today's Visitors</SelectItem>
                  <SelectItem value="Members Only">Members Only</SelectItem>
                  <SelectItem value="Staff Only">Staff Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notification-message" className="text-xs font-medium">Message</Label>
            <Textarea 
              id="notification-message"
              placeholder="Notification message" 
              className="min-h-[60px] text-xs resize-none"
              value={newNotification.message}
              onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="notification-priority" className="text-xs font-medium">Priority</Label>
              <Select
                value={newNotification.priority || "Medium"}
                onValueChange={(value) => setNewNotification({
                  ...newNotification, 
                  priority: value as "Low" | "Medium" | "High" | undefined
                })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled-date" className="text-xs font-medium">Schedule (Optional)</Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={handleCreateNotification}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              onClick={handleSendNotification}
              className="flex-1 h-8 text-xs"
              disabled={loading}
            >
              <Send className="w-3 h-3 mr-1" />
              Send Now
            </Button>
            {scheduledDate && (
              <Button
                onClick={handleScheduleNotification}
                disabled={loading}
                variant="secondary"
                className="h-8 text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Schedule
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Notification History</CardTitle>
          <CardDescription className="text-xs">
            View and manage all notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs h-8">Message</TableHead>
                <TableHead className="text-xs h-8 hidden sm:table-cell">Recipients</TableHead>
                <TableHead className="text-xs h-8">Status</TableHead>
                <TableHead className="text-xs h-8 hidden md:table-cell">Date</TableHead>
                <TableHead className="text-xs h-8 w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-xs">Loading notifications...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : getFilteredNotifications().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <p className="text-xs text-muted-foreground">No notifications found</p>
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredNotifications().map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="py-2">
                      <div>
                        <p className="text-xs font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{notification.message}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-2 hidden sm:table-cell">{notification.recipients}</TableCell>
                    <TableCell className="py-2">
                      <Badge 
                        variant={
                          notification.status === "Sent" ? "default" :
                          notification.status === "Draft" ? "secondary" : "outline"
                        }
                        className="text-xs h-5"
                      >
                        {notification.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs py-2 hidden md:table-cell">{notification.date}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEditNotification(notification.id)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManagement;
