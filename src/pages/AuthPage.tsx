
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "signin" | "signup" | "welcome" | "forgotPassword";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, loginWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  // Get the location we should redirect to after login
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast.success("Logged in successfully!");
        navigate(from);
      } else {
        toast.error("Failed to log in with Google");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === "signup") {
        // Validate form data
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        
        if (!formData.agreeToTerms) {
          toast.error("You must agree to the Terms of Use and Privacy Policy");
          return;
        }

        const success = await signUp(formData.name, formData.email, formData.password);
        if (success) {
          toast.success("Account created successfully!");
          navigate(from);
        } else {
          toast.error("Failed to create account");
        }
      } else if (mode === "signin") {
        const success = await login(formData.email, formData.password);
        if (success) {
          toast.success("Logged in successfully!");
          navigate(from);
        } else {
          toast.error("Invalid email or password");
        }
      } else if (mode === "forgotPassword") {
        if (forgotEmail) {
          try {
            await resetPassword(forgotEmail);
            toast.success(`Password reset link sent to ${forgotEmail}`);
            setMode("signin");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send reset email");
          }
        } else {
          toast.error("Please enter your email address");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zoo-primary flex flex-col">
      {/* Language selector and back button */}
      <div className="flex justify-between items-center p-4">
        <button 
          onClick={() => mode !== "welcome" ? setMode("welcome") : null}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${mode === "welcome" ? "opacity-0" : ""}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="bg-white/10 rounded-full px-4 py-1 text-white flex items-center">
          English
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
            <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Welcome Screen */}
      {mode === "welcome" && (
        <div className="flex-1 flex flex-col items-center justify-center text-white px-8">
          <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm mb-8 flex items-center justify-center">
            <img 
              src="lovable-uploads/2721d049-baba-46d1-af7f-d6b85bfa1caf.png" 
              alt="Accra Zoo Logo" 
              className="w-24 h-24 object-contain" 
            />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">
            Ready to take your zoo visiting experience to another level?
          </h1>
          
          <button 
            onClick={() => setMode("signup")} 
            className="w-full py-3 bg-black text-white rounded-lg font-medium mb-4"
          >
            Let's Go
          </button>
        </div>
      )}

      {/* Sign Up Form */}
      {mode === "signup" && (
        <div className="flex-1 flex flex-col justify-center px-8">
          <h1 className="text-2xl font-bold text-white text-center mb-8">Create your account</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="e.g. Jon Smith"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="e.g. jon.smith@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 mr-2"
                required
              />
              <label htmlFor="agreeToTerms" className="text-white/80 text-sm">
                I understand the <a href="/terms" className="underline">Terms of Use</a> & <a href="/privacy" className="underline">Privacy Policy</a>
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-white text-zoo-primary rounded-lg font-medium"
            >
              {isLoading ? "Creating Account..." : "SIGN UP"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-white">
            <p className="mb-4">or sign up with</p>
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
              className="w-full py-3 bg-white rounded-lg font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            </button>
          </div>
          
          <div className="mt-6 text-center text-white">
            <p>
              Have an account?{" "}
              <button onClick={() => setMode("signin")} className="font-medium underline">
                SIGN IN
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Sign In Form */}
      {mode === "signin" && (
        <div className="flex-1 flex flex-col justify-center px-8">
          <h1 className="text-2xl font-bold text-white text-center mb-8">Sign in your account</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="e.g. jon.smith@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => setMode("forgotPassword")} 
                className="text-white/80 text-sm underline"
              >
                Forgot Password?
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-white text-zoo-primary rounded-lg font-medium mt-4"
            >
              {isLoading ? "Signing In..." : "SIGN IN"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-white">
            <p className="mb-4">or sign in with</p>
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
              className="w-full py-3 bg-white rounded-lg font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            </button>
          </div>
          
          <div className="mt-6 text-center text-white">
            <p>
              Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="font-medium underline">
                SIGN UP
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Forgot Password Form */}
      {mode === "forgotPassword" && (
        <div className="flex-1 flex flex-col justify-center px-8">
          <h1 className="text-2xl font-bold text-white text-center mb-8">Reset your password</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-white/80 mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              <input
                type="email"
                placeholder="e.g. jon.smith@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-white text-zoo-primary rounded-lg font-medium mt-4"
            >
              {isLoading ? "Sending..." : "SEND RESET LINK"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-white">
            <p>
              Remember your password?{" "}
              <button onClick={() => setMode("signin")} className="font-medium underline">
                SIGN IN
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
