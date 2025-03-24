
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const HelpPage = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      toast.success("Your message has been sent! We'll get back to you soon.");
      setMessage("");
    } else {
      toast.error("Please enter a message");
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Help & Support" showBackButton showThemeToggle />
      
      <div className="pt-16 px-5">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-foreground">How can we help you?</h2>
          <p className="text-muted-foreground">
            Our support team is here to assist you with any questions or issues.
          </p>
        </div>
        
        <div className="space-y-5 mb-8">
          <div className="bg-card rounded-xl p-4 flex items-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zoo-secondary flex items-center justify-center mr-4">
              <Phone className="w-6 h-6 text-zoo-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Call Us</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground">Available 9 AM - 5 PM, Monday - Friday</p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 flex items-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zoo-secondary flex items-center justify-center mr-4">
              <Mail className="w-6 h-6 text-zoo-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Email Us</h3>
              <p className="text-sm text-muted-foreground">support@zooadventure.com</p>
              <p className="text-xs text-muted-foreground">We usually respond within 24 hours</p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 flex items-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zoo-secondary flex items-center justify-center mr-4">
              <MessageCircle className="w-6 h-6 text-zoo-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our support team</p>
              <p className="text-xs text-muted-foreground">Available 24/7</p>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Send us a message</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium mb-1 text-foreground">
                Your Message
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-zoo-primary focus:border-transparent transition-all"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button type="submit" className="zoo-button w-full">
              Submit
            </button>
          </form>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default HelpPage;
