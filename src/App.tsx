import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { EventsProvider } from "./contexts/EventsContext";

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
import ARPage from "./pages/ARPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import FAQPage from "./pages/FAQPage";
import TermsPage from "./pages/TermsPage";
import SecurityPage from "./pages/SecurityPage";
import NotificationsPage from "./pages/NotificationsPage";
import PrivacyPage from "./pages/PrivacyPage";
import FavoritesPage from "./pages/FavoritesPage";

const queryClient = new QueryClient();

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin");
    setIsAdmin(adminStatus === "true");
    
    if (adminStatus !== "true") {
      navigate("/auth");
    }
  }, [navigate]);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  return isAdmin ? <>{children}</> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <EventsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/animals/:id" element={<AnimalDetail />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/visit-list" element={<VisitListPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/favorites" element={<FavoritesPage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/profile/security" element={<SecurityPage />} />
              <Route path="/profile/notifications" element={<NotificationsPage />} />
              <Route path="/profile/privacy" element={<PrivacyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/ar" element={<ARPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminPage />
                  </ProtectedAdminRoute>
                } 
              />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/splash" element={<SplashPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/faqs" element={<FAQPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </EventsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
