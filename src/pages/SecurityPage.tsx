
import { useState } from "react";
import { Shield, Eye, EyeOff, Save } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SecurityPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [password, setPassword] = useState("••••••••••••");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSavePassword = () => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    // In a real app, we would call an API to update the password
    setPassword("••••••••••••");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated successfully");
  };

  const handleToggleTwoFactor = (checked: boolean) => {
    setTwoFactorAuth(checked);
    toast.success(`Two-factor authentication ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleToggleLoginAlerts = (checked: boolean) => {
    setLoginAlerts(checked);
    toast.success(`Login alerts ${checked ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Security" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5 space-y-6">
        <div className="bg-card rounded-xl overflow-hidden shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Password Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="current-password"
                  value={password}
                  readOnly
                  className="zoo-text-field pr-10"
                />
                <button 
                  onClick={handleTogglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="zoo-text-field"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="zoo-text-field"
                placeholder="Confirm new password"
              />
            </div>
            
            <Button 
              onClick={handleSavePassword} 
              className="w-full flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </div>
        
        <div className="bg-card rounded-xl overflow-hidden shadow-sm">
          <h2 className="text-lg font-semibold p-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Security Options
          </h2>
          
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch 
                checked={twoFactorAuth} 
                onCheckedChange={handleToggleTwoFactor} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="text-sm font-medium">Login Alerts</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Get notified when someone logs into your account
                </p>
              </div>
              <Switch 
                checked={loginAlerts} 
                onCheckedChange={handleToggleLoginAlerts} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default SecurityPage;
