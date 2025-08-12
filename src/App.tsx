import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { EventsProvider } from "./contexts/EventsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import { useAuth } from "./hooks/useAuth";
import { ReactNode } from "react";
import 'leaflet/dist/leaflet.css';

// Pages
import HomePage from "./pages/HomePage";
import AnimalDetail from "./pages/AnimalDetail";
import MapPage from "./pages/MapPage";
import VisitListPage from "./pages/VisitListPage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AuthPage from "./pages/AuthPage";
import SplashPage from "./pages/SplashPage";
import NotFound from "./pages/NotFound";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import FAQPage from "./pages/FAQPage";
import TermsPage from "./pages/TermsPage";
import SecurityPage from "./pages/SecurityPage";
import NotificationsPage from "./pages/NotificationsPage";
import PrivacyPage from "./pages/PrivacyPage";
import FavoritesPage from "./pages/FavoritesPage";
import ReportProblemPage from "./pages/ReportProblemPage";
import UserProfile from "./pages/UserProfile";
import VisitHistory from "./pages/VisitHistory";
import SeedPage from "./pages/SeedPage";

const queryClient = new QueryClient();

// Protected route that requires authentication
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Only require email verification for users created after June 20, 2025
  // This allows existing users to continue without verification
  const emailVerificationCutoffDate = new Date('2025-06-20T00:00:00Z');
  const userCreatedAt = user.createdAt ? new Date(user.createdAt) : emailVerificationCutoffDate;
  const requiresEmailVerification = userCreatedAt > emailVerificationCutoffDate;

  // Redirect to auth page if email verification is required but not completed
  if (requiresEmailVerification && !user.emailVerified) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Protected route specifically for admin users
const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show access denied if not admin
  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <AppStateProvider>
            <UserPreferencesProvider>
              <EventsProvider>
                <NotificationProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                  <Routes>
                {/* Public routes */}
                <Route path="/splash" element={<SplashPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/faqs" element={<FAQPage />} />
                
                {/* Main routes - require authentication */}
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/animal/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
                <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                
                {/* User Profile routes - require login */}
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/visit-history" element={<ProtectedRoute><VisitHistory /></ProtectedRoute>} />
                <Route path="/visit-list" element={<ProtectedRoute><VisitListPage /></ProtectedRoute>} />
                <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
                <Route path="/profile/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
                <Route path="/profile/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/report" element={<ProtectedRoute><ReportProblemPage /></ProtectedRoute>} />
                
                {/* Admin routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedAdminRoute>
                      <AdminPage />
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/seed" 
                  element={
                    <ProtectedAdminRoute>
                      <SeedPage />
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/seed" 
                  element={
                    <ProtectedAdminRoute>
                      <SeedPage />
                    </ProtectedAdminRoute>
                  } 
                />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
                  </BrowserRouter>
                </NotificationProvider>
              </EventsProvider>
            </UserPreferencesProvider>
          </AppStateProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
