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
import DashboardHome from "./pages/dashboard/DashboardHome";
import TraderCalculator from "./pages/dashboard/TraderCalculator";
import Management from "./pages/dashboard/Management";
import Rankings from "./pages/dashboard/Rankings";
import Evolution from "./pages/dashboard/Evolution";
import Psychology from "./pages/dashboard/Psychology";
import Advice from "./pages/dashboard/Advice";
import Rewards from "./pages/dashboard/Rewards";

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

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><DashboardHome /></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/calculator" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><TraderCalculator /></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/management" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><Management /></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/rankings" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><Rankings /></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/evolution" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><Evolution /></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/psychology" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><Psychology /></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/advice" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><Advice /></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/rewards" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><Rewards /></DashboardLayout></ProtectedRoute>} />
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
