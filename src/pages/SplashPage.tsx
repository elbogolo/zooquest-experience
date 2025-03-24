
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    
    // Simulate a loading delay
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate("/");
      } else {
        navigate("/auth");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zoo-primary flex flex-col items-center justify-center">
      <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 animate-pulse">
        <img 
          src="public/lovable-uploads/2721d049-baba-46d1-af7f-d6b85bfa1caf.png" 
          alt="Zoo Logo" 
          className="w-32 h-32 object-contain" 
        />
      </div>
      <h1 className="text-white text-2xl font-bold mb-2 animate-fade-in">ACCRA ZOO</h1>
      <p className="text-white/80 animate-fade-in">EXPERIENCE THE WILD IN THE CITY</p>
    </div>
  );
};

export default SplashPage;
