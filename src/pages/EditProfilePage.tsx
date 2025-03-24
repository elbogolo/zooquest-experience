
import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";

const EditProfilePage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(localStorage.getItem("userImage") || null);
  const [formData, setFormData] = useState({
    name: localStorage.getItem("userName") || "Guest",
    email: "user@example.com",
    password: "••••••••••••",
    dateOfBirth: "23/05/1995",
    country: "Ghana",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        localStorage.setItem("userImage", result);
        toast.success("Profile image updated");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would submit this data to an API
    console.log("Submitting form data:", formData);
    
    // Update localStorage
    localStorage.setItem("userName", formData.name);
    
    // Show success message
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Edit Profile" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5">
        {/* Profile Image */}
        <div className="flex justify-center my-6">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <div onClick={handleImageClick} className="cursor-pointer">
              <UserAvatar size="lg" linkToProfile={false} className="border-4 border-white shadow-md" />
            </div>
            <button 
              onClick={handleImageClick}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-zoo-primary text-white flex items-center justify-center shadow-md"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-foreground mb-1">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="zoo-text-field"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-foreground mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="zoo-text-field"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-foreground mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="zoo-text-field"
            />
          </div>
          
          <div>
            <label htmlFor="dateOfBirth" className="block text-foreground mb-1">Date of Birth</label>
            <div className="relative">
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="text"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="zoo-text-field"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="country" className="block text-foreground mb-1">Country/Region</label>
            <div className="relative">
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                className="zoo-text-field"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-8">Save changes</Button>
        </form>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default EditProfilePage;
