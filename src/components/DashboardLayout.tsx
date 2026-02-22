import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Home, Calculator, BarChart3, Trophy, Brain, Gift, LogOut,
  Menu, X, TrendingUp, ClipboardList, MessageSquare, Shield, Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/dashboard', label: 'Início', icon: Home },
  { path: '/dashboard/calculator', label: 'Calculadora', icon: Calculator },
  { path: '/dashboard/management', label: 'Gerenciamento', icon: ClipboardList },
  { path: '/dashboard/rankings', label: 'Rankings', icon: Trophy },
  { path: '/dashboard/evolution', label: 'Evolução', icon: TrendingUp },
  { path: '/dashboard/psychology', label: 'Psicologia', icon: Brain },
  { path: '/dashboard/advice', label: 'Conselhos', icon: MessageSquare },
  { path: '/dashboard/videos', label: 'Vídeos', icon: Youtube },
  { path: '/dashboard/rewards', label: 'Brindes', icon: Gift },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [todayTradeCount, setTodayTradeCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data }) => setIsAdmin(!!data));

    supabase.from('profiles').select('display_name').eq('user_id', user.id).single()
      .then(({ data }) => { if (data?.display_name) setDisplayName(data.display_name); });

    const today = new Date().toISOString().split('T')[0];
    supabase.from('trades').select('id', { count: 'exact' }).eq('user_id', user.id).eq('trade_date', today)
      .then(({ count }) => setTodayTradeCount(count || 0));
  }, [user]);

  // Listen to route changes to refresh trade count
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    supabase.from('trades').select('id', { count: 'exact' }).eq('user_id', user.id).eq('trade_date', today)
      .then(({ count }) => setTodayTradeCount(count || 0));
  }, [location.pathname, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Mood: green if <= 3 trades today, red if > 3
  const isGoodMood = todayTradeCount <= 3;
  const moodEmoji = isGoodMood ? '😊' : '😡';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-md p-2 text-primary"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-primary text-glow">TECHNICAL GIRLAN</h2>
            <span className="text-2xl" title={isGoodMood ? 'Dentro do gerenciamento' : 'Fora do gerenciamento!'}>{moodEmoji}</span>
          </div>
          <p className="text-xs text-foreground mt-1 truncate font-medium">{displayName || user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary box-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/dashboard/admin"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mt-2 border-t border-border pt-3 ${
                location.pathname === '/dashboard/admin'
                  ? 'bg-primary/10 text-primary box-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
