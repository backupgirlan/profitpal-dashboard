import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import AdminMessagePopup from "./components/AdminMessagePopup";
import VipGate from "./components/VipGate";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Management from "./pages/dashboard/Management";
import HorusIA from "./pages/dashboard/HorusIA";
import Rankings from "./pages/dashboard/Rankings";
import Evolution from "./pages/dashboard/Evolution";
import Psychology from "./pages/dashboard/Psychology";
import AdminPanel from "./pages/dashboard/AdminPanel";
import Videos from "./pages/dashboard/Videos";
import Courses from "./pages/dashboard/Courses";
import TradeReport from "./pages/dashboard/TradeReport";
import MentalProtectionPage from "./pages/dashboard/MentalProtection";
import BreathingPage from "./pages/dashboard/Breathing";
import EmotionalDiary from "./pages/dashboard/EmotionalDiary";
import SettingsPage from "./pages/dashboard/SettingsPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse-gold w-8 h-8 rounded-full bg-primary" /></div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

const DashboardRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate>{children}</VipGate></DashboardLayout></ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/dashboard" element={<DashboardRoute><DashboardHome /></DashboardRoute>} />
    <Route path="/dashboard/management" element={<DashboardRoute><Management /></DashboardRoute>} />
    <Route path="/dashboard/horus" element={<DashboardRoute><HorusIA /></DashboardRoute>} />
    <Route path="/dashboard/rankings" element={<DashboardRoute><Rankings /></DashboardRoute>} />
    <Route path="/dashboard/evolution" element={<DashboardRoute><Evolution /></DashboardRoute>} />
    <Route path="/dashboard/psychology" element={<DashboardRoute><Psychology /></DashboardRoute>} />
    <Route path="/dashboard/videos" element={<DashboardRoute><Videos /></DashboardRoute>} />
    <Route path="/dashboard/courses" element={<DashboardRoute><Courses /></DashboardRoute>} />
    <Route path="/dashboard/report" element={<DashboardRoute><TradeReport /></DashboardRoute>} />
    <Route path="/dashboard/mental" element={<DashboardRoute><MentalProtectionPage /></DashboardRoute>} />
    <Route path="/dashboard/breathing" element={<DashboardRoute><BreathingPage /></DashboardRoute>} />
    <Route path="/dashboard/diary" element={<DashboardRoute><EmotionalDiary /></DashboardRoute>} />
    <Route path="/dashboard/settings" element={<DashboardRoute><SettingsPage /></DashboardRoute>} />
    <Route path="/dashboard/admin" element={<ProtectedRoute><DashboardLayout><AdminPanel /></DashboardLayout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
