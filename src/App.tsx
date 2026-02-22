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
import TraderCalculator from "./pages/dashboard/TraderCalculator";
import Management from "./pages/dashboard/Management";
import Rankings from "./pages/dashboard/Rankings";
import Evolution from "./pages/dashboard/Evolution";
import Psychology from "./pages/dashboard/Psychology";
import Advice from "./pages/dashboard/Advice";
import Rewards from "./pages/dashboard/Rewards";
import AdminPanel from "./pages/dashboard/AdminPanel";

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
    <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate><DashboardHome /></VipGate></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/calculator" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate><TraderCalculator /></VipGate></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/management" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate><Management /></VipGate></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/rankings" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate><Rankings /></VipGate></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/evolution" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate><Evolution /></VipGate></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/psychology" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate><Psychology /></VipGate></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/advice" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate><Advice /></VipGate></DashboardLayout></ProtectedRoute>} />
    <Route path="/dashboard/rewards" element={<ProtectedRoute><DashboardLayout><AdminMessagePopup /><VipGate><Rewards /></VipGate></DashboardLayout></ProtectedRoute>} />
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
