import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Sun, Moon, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';
import { adminService } from '@/services/adminService';
import type { AdminStaff, AdminSystemSettings } from '@/types/admin';

interface AdminSettingsProps {
  searchQuery: string;
  filterStatus: string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ searchQuery, filterStatus }) => {
  const { theme, setTheme } = useTheme();
  
  // Settings state
  const [systemSettings, setSystemSettings] = useState<AdminSystemSettings>({
    enableNotifications: true,
    lastBackupDate: new Date().toISOString(),
    theme: 'dark'
  });

  // Staff state
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadSystemSettings();
    loadStaff();
  }, []);

  const loadSystemSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const settings = await adminService.getSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error('Failed to load system settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const loadStaff = async () => {
    try {
      setIsLoadingStaff(true);
      const staffData = await adminService.getItems('staff') as AdminStaff[];
      setStaff(staffData);
    } catch (error) {
      console.error('Failed to load staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await adminService.updateSystemSettings(systemSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupData = async () => {
    try {
      setIsBackingUp(true);
      const result = await adminService.backupData();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleResetSystem = async () => {
    try {
      setIsResetting(true);
      const result = await adminService.resetSystem();
      if (result.success) {
        toast.success(result.message);
        setShowResetDialog(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('System reset failed:', error);
      toast.error('System reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  // Handle theme switching
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const filteredStaff = staff.filter(member => 
    (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (member.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (member.role?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (member.department?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-8">
          <TabsTrigger value="appearance" className="text-xs h-6">Theme</TabsTrigger>
          <TabsTrigger value="system" className="text-xs h-6">System</TabsTrigger>
          <TabsTrigger value="staff" className="text-xs h-6">Staff</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-xs h-6">Maintenance</TabsTrigger>
        </TabsList>

        {/* Theme Settings */}
        <TabsContent value="appearance" className="mt-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Appearance Settings</CardTitle>
              <CardDescription className="text-xs">
                Customize the theme and appearance of the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-xs font-medium">Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 h-8 text-xs px-3"
                    onClick={() => handleThemeChange("light")}
                  >
                    <Sun className="w-3 h-3" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 h-8 text-xs px-3"
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon className="w-3 h-3" />
                    Dark
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current theme: <span className="font-medium capitalize">{theme}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="mt-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">System Configuration</CardTitle>
              <CardDescription className="text-xs">
                General system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-xs ml-2">Loading settings...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="enableNotifications" className="text-xs font-medium">Enable Notifications</Label>
                      <Switch
                        id="enableNotifications"
                        checked={systemSettings.enableNotifications}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableNotifications: checked }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastBackupDate" className="text-xs font-medium">Last Backup</Label>
                      <Input
                        id="lastBackupDate"
                        value={new Date(systemSettings.lastBackupDate).toLocaleDateString()}
                        disabled
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <Button 
                      onClick={handleSaveSettings} 
                      disabled={isSaving}
                      className="w-full h-8 text-xs"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3 mr-2" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Management */}
        <TabsContent value="staff" className="mt-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Staff Directory</CardTitle>
              <CardDescription className="text-xs">
                Manage staff members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStaff ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-xs ml-2">Loading staff...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs h-8">Name</TableHead>
                      <TableHead className="text-xs h-8">Email</TableHead>
                      <TableHead className="text-xs h-8">Role</TableHead>
                      <TableHead className="text-xs h-8">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="text-xs py-2">
                          {member.name}
                        </TableCell>
                        <TableCell className="text-xs py-2">{member.email || 'N/A'}</TableCell>
                        <TableCell className="text-xs py-2">
                          <Badge variant="secondary" className="text-xs h-5">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs py-2">
                          <Badge 
                            variant={member.status === "Active" ? "default" : "secondary"}
                            className="text-xs h-5"
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance" className="mt-3">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">System Maintenance</CardTitle>
                <CardDescription className="text-xs">
                  Backup and restore system data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleBackupData}
                  disabled={isBackingUp}
                  className="w-full h-8 text-xs"
                >
                  {isBackingUp ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>Create Backup</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-xs">
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowResetDialog(true)}
                  className="w-full h-8 text-xs"
                >
                  <AlertTriangle className="w-3 h-3 mr-2" />
                  Reset System
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Confirm System Reset</DialogTitle>
            <DialogDescription className="text-xs">
              This will permanently delete ALL data including animals, events, notifications, and settings. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowResetDialog(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleResetSystem}
              disabled={isResetting}
              className="h-8 text-xs"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset System'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
