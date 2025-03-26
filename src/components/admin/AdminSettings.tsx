
import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Bell, 
  Upload, 
  Users, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Shield,
  LayoutDashboard
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminService, AdminSystemSettings, AdminStaff } from "@/services/adminService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminSettingsProps {
  searchQuery: string;
  filterStatus: string;
}

const AdminSettings = ({ searchQuery, filterStatus }: AdminSettingsProps) => {
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [systemSettings, setSystemSettings] = useState<AdminSystemSettings>({
    enableNotifications: true,
    lastBackupDate: new Date().toISOString(),
    theme: "light"
  });
  const [loading, setLoading] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffData, settingsData] = await Promise.all([
        adminService.getItems<AdminStaff>("staff"),
        adminService.getSystemSettings()
      ]);
      
      setStaff(staffData);
      setSystemSettings(settingsData);
    } catch (error) {
      toast.error("Failed to load settings data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStaff = () => {
    return staff.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || member.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  };

  const handleToggleNotifications = async () => {
    setLoading(true);
    try {
      const updatedSettings = await adminService.updateSystemSettings({
        enableNotifications: !systemSettings.enableNotifications
      });
      
      setSystemSettings(updatedSettings);
      toast.success(`Notifications ${updatedSettings.enableNotifications ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to update notification settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupData = async () => {
    setLoading(true);
    try {
      await adminService.backupData();
      const updatedSettings = await adminService.getSystemSettings();
      setSystemSettings(updatedSettings);
    } catch (error) {
      toast.error("Failed to backup data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSystem = async () => {
    setLoading(true);
    try {
      await adminService.resetSystem();
      setConfirmResetOpen(false);
      
      // Refetch all data after reset
      await fetchData();
      toast.success("System has been reset successfully");
    } catch (error) {
      toast.error("Failed to reset system");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTheme = async (theme: "light" | "dark" | "system") => {
    setLoading(true);
    try {
      const updatedSettings = await adminService.updateSystemSettings({ theme });
      setSystemSettings(updatedSettings);
      toast.success(`Theme changed to ${theme}`);
    } catch (error) {
      toast.error("Failed to update theme");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        Admin Settings
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">User Management</h3>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-gray-500">Loading staff data...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredStaff().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-gray-500">No staff found matching your criteria</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredStaff().map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.status === "Active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {member.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Manage</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">App Settings</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-gray-600" />
                <span>Push Notifications</span>
              </div>
              <div className="flex gap-2 items-center">
                <Switch 
                  checked={systemSettings.enableNotifications} 
                  onCheckedChange={handleToggleNotifications}
                  disabled={loading}
                />
                <span className="text-sm text-gray-500">
                  {systemSettings.enableNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <Upload className="w-5 h-5 mr-2 text-gray-600" />
                <span>Data Backups</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={true}
                >
                  Last Backup: {new Date(systemSettings.lastBackupDate).toLocaleString()}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBackupData}
                  disabled={loading}
                >
                  Backup Now
                </Button>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-gray-600" />
                <span>Database Management</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-gray-600" />
                <span>Security Settings</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <LayoutDashboard className="w-5 h-5 mr-2 text-gray-600" />
                <span>Theme</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={systemSettings.theme === "light" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleChangeTheme("light")}
                  disabled={loading}
                >
                  Light
                </Button>
                <Button 
                  variant={systemSettings.theme === "dark" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleChangeTheme("dark")}
                  disabled={loading}
                >
                  Dark
                </Button>
                <Button 
                  variant={systemSettings.theme === "system" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleChangeTheme("system")}
                  disabled={loading}
                >
                  System
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3 text-red-600">Danger Zone</h3>
          <div className="space-y-3">
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Reset System
              </h4>
              <p className="text-sm text-red-600 mt-1 mb-2">
                This action will reset all system data and cannot be undone.
              </p>
              <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Reset System
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Confirm System Reset
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-gray-700 mb-4">
                      Are you absolutely sure you want to reset the system? This action cannot be undone and will erase all data including:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 mb-4">
                      <li>All animal records</li>
                      <li>All event data</li>
                      <li>All notification history</li>
                      <li>All user settings</li>
                    </ul>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setConfirmResetOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleResetSystem}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          "Yes, Reset Everything"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
