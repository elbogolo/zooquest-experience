
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SplashPage = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    
    // Show logo for 2 seconds, then show welcome screen or navigate
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate("/");
      } else {
        setShowWelcome(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {!showWelcome ? (
          <motion.div
            key="logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8"
          >
            <img 
              src="/lovable-uploads/2721d049-baba-46d1-af7f-d6b85bfa1caf.png" 
              alt="Zoo Logo" 
              className="w-32 h-32 object-contain" 
            />
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center px-6 text-center"
          >
            <img 
              src="/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png" 
              alt="Welcome Lion" 
              className="w-64 h-64 object-contain mb-8 rounded-2xl" 
            />
            <h1 className="text-2xl font-bold mb-4">Ready to explore the wild?</h1>
            <p className="text-muted-foreground mb-8">
              Get ready for an amazing journey through our zoo, where every animal has a story to tell.
            </p>
            <Button 
              onClick={handleGetStarted}
              className="flex items-center gap-2"
              size="lg"
            >
              Let's Go <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashPage;
