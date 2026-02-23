import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Home, Calculator, BarChart3, Trophy, Brain, Gift, LogOut,
  Menu, X, TrendingUp, ClipboardList, MessageSquare, Shield, Youtube, KeyRound, Smartphone, Trash2, GraduationCap
} from 'lucide-react';
import InstallAppDialog from '@/components/InstallAppDialog';
import StreakDisplay from '@/components/StreakDisplay';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { path: '/dashboard', label: 'Início', icon: Home },
  { path: '/dashboard/calculator', label: 'Calculadora', icon: Calculator },
  { path: '/dashboard/management', label: 'Gerenciamento', icon: ClipboardList },
  { path: '/dashboard/rankings', label: 'Rankings', icon: Trophy },
  { path: '/dashboard/evolution', label: 'Evolução', icon: TrendingUp },
  { path: '/dashboard/psychology', label: 'Psicologia', icon: Brain },
  { path: '/dashboard/advice', label: 'Conselhos', icon: MessageSquare },
  { path: '/dashboard/videos', label: 'Vídeos', icon: Youtube },
  { path: '/dashboard/courses', label: 'Curso', icon: GraduationCap },
  { path: '/dashboard/rewards', label: 'Brindes', icon: Gift },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [todayTradeCount, setTodayTradeCount] = useState(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [installOpen, setInstallOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'Erro', description: 'Senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Senha atualizada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(false);
    }
  };

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

  const handleResetAccount = async () => {
    if (!user) return;
    setResetLoading(true);
    try {
      // Delete all trades
      await supabase.from('trades').delete().eq('user_id', user.id);
      // Delete all deposits
      await supabase.from('deposits').delete().eq('user_id', user.id);
      // Reset profile
      await supabase.from('profiles').update({
        balance: 0,
        total_profit: 0,
        stop_loss: 0,
        stop_win: 0,
        entry_percentage: 2,
        soros_enabled: false,
        soros_level: 0,
        active_management_mode: null,
      }).eq('user_id', user.id);
      // Reset streaks
      await supabase.from('streaks').update({
        streak_atual: 0,
        maior_streak: 0,
        streak_freeze_disponivel: 0,
        total_freezes: 0,
        ultimo_dia_ativo: null,
      }).eq('user_id', user.id);
      // Clear localStorage
      localStorage.removeItem('management_engine_state');
      localStorage.removeItem('soros_management_state');
      
      toast({ title: '✅ Conta resetada!', description: 'Todos os dados foram apagados. Recarregando...' });
      setShowResetDialog(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setResetLoading(false);
    }
  };

  // Mood: follow active management module rules per mode
  const getMoodStatus = (): { isGood: boolean; label: string } => {
    try {
      // Check Soros x4 engine
      const soros = localStorage.getItem('soros_management_state');
      if (soros) {
        const state = JSON.parse(soros);
        if (state.ativo) {
          // Soros: respeita tentativasTotal e se está encerrado/pausado
          if (state.encerrado) return { isGood: false, label: 'Soros encerrado' };
          if (state.pausado) return { isGood: false, label: 'Soros pausado' };
          return { isGood: state.tentativasPerdidas < state.tentativasTotal, label: `Soros ${state.tentativaAtual}/${state.tentativasTotal}` };
        }
      }
      // Check other management engines
      const mgmt = localStorage.getItem('management_engine_state');
      if (mgmt) {
        const state = JSON.parse(mgmt);
        if (state.ativo) {
          if (state.encerrado || state.bloqueado) return { isGood: false, label: 'Sessão encerrada' };
          // Intermediário: respeita maxTrades
          // Conservador: respeita maxTrades e perdaSequencial
          // Agressivo: respeita maxTrades
          const overLimit = state.tradesDoDia >= state.maxTrades;
          const overStopLoss = state.stopLossPct > 0 && state.lucroSessao < 0 && Math.abs(state.lucroSessao) >= (state.bancaInicial * state.stopLossPct / 100);
          if (overLimit || overStopLoss) return { isGood: false, label: 'Limite atingido' };
          return { isGood: true, label: `${state.tradesDoDia}/${state.maxTrades} trades` };
        }
      }
    } catch {}
    // Livre: sem módulo ativo, usa limite padrão
    return { isGood: todayTradeCount <= 3, label: 'Modo livre' };
  };
  const moodStatus = getMoodStatus();
  const moodEmoji = moodStatus.isGood ? '😊' : '😡';

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
            <span className="text-2xl" title={moodStatus.isGood ? 'Dentro do gerenciamento' : 'Fora do gerenciamento!'}>{moodEmoji}</span>
          </div>
          <p className="text-xs text-foreground mt-1 truncate font-medium">{displayName || user?.email}</p>
          <div className="mt-2">
            <StreakDisplay />
          </div>
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

        <div className="p-4 border-t border-border space-y-1">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Button
              variant="ghost"
              onClick={() => setInstallOpen(true)}
              className="w-full justify-start gap-3 text-primary hover:bg-primary/10 font-medium"
            >
              <Smartphone className="w-4 h-4" />
              Instalar App
            </Button>
          </motion.div>
          <Button
            variant="ghost"
            onClick={() => setShowPasswordDialog(true)}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            <KeyRound className="w-4 h-4" />
            Trocar Senha
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowResetDialog(true)}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Resetar Conta
          </Button>
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

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Trocar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nova Senha</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-secondary" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <Label className="text-xs">Confirmar Senha</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-secondary" />
            </div>
            <Button onClick={handleChangePassword} className="w-full gradient-gold text-primary-foreground font-display">
              Atualizar Senha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Account Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-card border-destructive/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-display">
              <Trash2 className="w-5 h-5" /> Resetar Conta
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Esta ação não pode ser desfeita</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">
                ⚠️ <strong>Todos os seus dados serão apagados permanentemente:</strong>
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Histórico de operações</li>
                <li>Depósitos registrados</li>
                <li>Banca e lucro total</li>
                <li>Streaks e conquistas</li>
                <li>Configurações de gerenciamento</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetAccount}
                disabled={resetLoading}
                className="flex-1 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {resetLoading ? 'Apagando...' : 'Confirmar Reset'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InstallAppDialog open={installOpen} onOpenChange={setInstallOpen} />

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
