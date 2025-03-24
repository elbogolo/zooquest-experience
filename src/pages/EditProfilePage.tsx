
import { useState } from "react";
import { Camera } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";

const EditProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "Yaw Anderson",
    email: "yanderson@gmail.com",
    password: "••••••••••••",
    dateOfBirth: "23/05/1995",
    country: "Ghana",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would submit this data to an API
    console.log("Submitting form data:", formData);
    // Show success message
    alert("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      <PageHeader title="Edit Profile" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5">
        {/* Profile Image */}
        <div className="flex justify-center my-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
              <div className="text-gray-400 text-4xl">
                {formData.name.charAt(0)}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-zoo-primary text-white flex items-center justify-center shadow-md">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">Name</label>
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
            <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
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
            <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
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
            <label htmlFor="dateOfBirth" className="block text-gray-700 mb-1">Date of Birth</label>
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
                  <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="country" className="block text-gray-700 mb-1">Country/Region</label>
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
                  <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          <button type="submit" className="zoo-button w-full mt-8">Save changes</button>
        </form>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default EditProfilePage;
