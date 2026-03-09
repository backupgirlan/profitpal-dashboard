import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminPlans from '@/components/admin/AdminPlans';
import AdminHorusIA from '@/components/admin/AdminHorusIA';
import AdminIntegrations from '@/components/admin/AdminIntegrations';
import AdminPayments from '@/components/admin/AdminPayments';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminUsageControl from '@/components/admin/AdminUsageControl';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminContent from '@/components/admin/AdminContent';
import AdminHorusFlows from '@/components/admin/AdminHorusFlows';

const AdminPanel = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    if (!user) return;
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }).then(({ data }) => {
      setIsAdmin(!!data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse-gold w-8 h-8 rounded-full bg-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-xl font-display font-bold text-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboard />;
      case 'users': return <AdminUsers />;
      case 'plans': return <AdminPlans />;
      case 'horus': return <AdminHorusIA />;
      case 'integrations': return <AdminIntegrations />;
      case 'payments': return <AdminPayments />;
      case 'analytics': return <AdminAnalytics />;
      case 'usage': return <AdminUsageControl />;
      case 'settings': return <AdminSettings />;
      case 'content': return <AdminContent />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="flex gap-0 -m-6 min-h-[calc(100vh-64px)]">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <motion.main
        key={activeSection}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 p-6 overflow-y-auto"
      >
        {renderSection()}
      </motion.main>
    </div>
  );
};

export default AdminPanel;
