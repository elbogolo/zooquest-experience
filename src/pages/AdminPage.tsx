
import { useState } from "react";
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Image, 
  MessageSquare,
  Bell,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for demonstration
const animalsList = [
  { id: "lion", name: "Lion", location: "Lion Enclosure", status: "Healthy" },
  { id: "tiger", name: "Tiger", location: "Tiger Territory", status: "Under observation" },
  { id: "gorilla", name: "Gorilla", location: "Gorilla Habitat", status: "Healthy" },
  { id: "crocodile", name: "Crocodile", location: "Reptile House", status: "Healthy" }
];

const eventsList = [
  { id: "event1", title: "Lion Feeding", time: "10:00 AM", date: "2023-07-15" },
  { id: "event2", title: "Tiger Talk", time: "11:30 AM", date: "2023-07-15" },
  { id: "event3", title: "Gorilla Encounter", time: "2:00 PM", date: "2023-07-15" }
];

const notificationsList = [
  { id: "notif1", title: "Zoo closing early", status: "Sent", recipients: "All visitors", date: "2023-07-14" },
  { id: "notif2", title: "Tiger exhibit closed", status: "Scheduled", recipients: "Today's visitors", date: "2023-07-15" }
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("animals");

  const handleAddItem = () => {
    toast.info(`Adding new ${activeTab.slice(0, -1)}`);
  };

  const handleEditItem = (id: string) => {
    toast.info(`Editing item ${id}`);
  };

  const handleDeleteItem = (id: string) => {
    toast.info(`Deleting item ${id}`);
    toast.error("This action would require confirmation in a real app");
  };

  const handleSendNotification = () => {
    toast.info("Preparing to send notification");
  };

  const handleUploadImage = () => {
    toast.info("Image upload functionality would open here");
  };

  return (
    <div className="min-h-screen pb-6 bg-gray-50">
      <PageHeader title="Admin Panel" showBackButton />
      
      <div className="pt-16 px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Zoo Management</h1>
          <Button onClick={handleAddItem} className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </Button>
        </div>
        
        <Tabs defaultValue="animals" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="animals" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3">Animals Management</h2>
              <div className="space-y-3">
                {animalsList.map((animal) => (
                  <div key={animal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{animal.name}</h3>
                      <p className="text-sm text-gray-500">Location: {animal.location}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        animal.status === "Healthy" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {animal.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditItem(animal.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(animal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex items-center justify-center gap-2" onClick={handleUploadImage}>
                    <Image className="w-4 h-4" />
                    <span>Upload Images</span>
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Health Reports</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3">Events Management</h2>
              <div className="space-y-3">
                {eventsList.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.time} on {event.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditItem(event.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">Event Planning</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>View Calendar</span>
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Updates</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3">Notifications Management</h2>
              <div className="space-y-3">
                {notificationsList.map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{notif.title}</h3>
                      <p className="text-sm text-gray-500">To: {notif.recipients}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notif.status === "Sent" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {notif.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditItem(notif.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(notif.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">Send New Notification</h3>
                <div className="space-y-2">
                  <div className="flex items-center p-2 border rounded">
                    <input 
                      type="text" 
                      placeholder="Notification title" 
                      className="flex-1 border-none outline-none bg-transparent"
                    />
                  </div>
                  <div className="flex items-center p-2 border rounded">
                    <textarea 
                      placeholder="Notification message" 
                      className="flex-1 border-none outline-none bg-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleSendNotification} className="w-full flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>Send Notification</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3">Admin Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">User Management</h3>
                  <div className="border rounded-lg divide-y">
                    <div className="p-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-gray-600" />
                        <span>Staff Accounts</span>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-gray-600" />
                        <span>Permission Levels</span>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">App Settings</h3>
                  <div className="border rounded-lg divide-y">
                    <div className="p-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-gray-600" />
                        <span>Notification Settings</span>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-gray-600" />
                        <span>Data Backups</span>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Button variant="destructive" className="w-full">
                    Reset System (Use with caution)
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
