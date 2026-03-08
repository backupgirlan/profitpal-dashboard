import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Home, BarChart3, Trophy, Brain, LogOut,
  Menu, X, TrendingUp, ClipboardList, Shield, Youtube, KeyRound, Smartphone, Trash2,
  GraduationCap, FileText, Wind, Target, BookOpen, Award, Settings, ChevronLeft
} from 'lucide-react';
import InstallAppDialog from '@/components/InstallAppDialog';
import StreakDisplay from '@/components/StreakDisplay';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [installOpen, setInstallOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/dashboard/management', label: 'Registrar Operação', icon: ClipboardList },
    { path: '/dashboard/report', label: 'Relatórios', icon: FileText },
    { path: '/dashboard/psychology', label: 'Psicologia do Trader', icon: Brain },
    { path: '/dashboard/breathing', label: 'Respiração do Trader', icon: Wind },
    { path: '/dashboard/mental', label: 'Modo Disciplina', icon: Shield },
    { path: '/dashboard/diary', label: 'Diário Emocional', icon: BookOpen },
    { path: '/dashboard/rankings', label: 'Conquistas e Patentes', icon: Award },
    { path: '/dashboard/evolution', label: 'Evolução', icon: TrendingUp },
    { path: '/dashboard/videos', label: 'Vídeos', icon: Youtube },
    { path: '/dashboard/courses', label: 'Cursos', icon: GraduationCap },
    { path: '/dashboard/settings', label: 'Configurações', icon: Settings },
  ];

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: t('common.error'), description: t('password.minError'), variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t('common.error'), description: t('password.mismatch'), variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('password.success') });
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
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleResetAccount = async () => {
    if (!user) return;
    setResetLoading(true);
    try {
      await supabase.from('trades').delete().eq('user_id', user.id);
      await supabase.from('deposits').delete().eq('user_id', user.id);
      await supabase.from('profiles').update({
        balance: 0, total_profit: 0, stop_loss: 0, stop_win: 0,
        entry_percentage: 2, soros_enabled: false, soros_level: 0, active_management_mode: null,
      }).eq('user_id', user.id);
      await supabase.from('streaks').update({
        streak_atual: 0, maior_streak: 0, streak_freeze_disponivel: 0, total_freezes: 0, ultimo_dia_ativo: null,
      }).eq('user_id', user.id);
      localStorage.removeItem('management_engine_state');
      localStorage.removeItem('soros_management_state');
      toast({ title: t('reset.success'), description: t('reset.successDesc') });
      setShowResetDialog(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast({ title: t('common.error'), description: err.message, variant: 'destructive' });
    } finally {
      setResetLoading(false);
    }
  };

  const sidebarWidth = sidebarCollapsed ? 'w-[68px]' : 'w-64';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-lg p-2 text-primary shadow-lg">
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 ${sidebarWidth} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="font-display text-sm font-bold text-primary tracking-wider">
                TECHNICAL GIRLAN
              </h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {!sidebarCollapsed && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground truncate">{displayName || user?.email}</p>
              <div className="mt-2 flex items-center justify-between">
                <StreakDisplay />
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <Separator className="my-2 bg-sidebar-border" />
              <Link
                to="/dashboard/admin"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  location.pathname === '/dashboard/admin'
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Admin</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-sidebar-border space-y-0.5">
          {!sidebarCollapsed ? (
            <>
              <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <Button variant="ghost" onClick={() => setInstallOpen(true)} className="w-full justify-start gap-3 text-primary hover:bg-primary/10 text-xs h-8">
                  <Smartphone className="w-4 h-4" /> {t('sidebar.installApp')}
                </Button>
              </motion.div>
              <Button variant="ghost" onClick={() => setShowPasswordDialog(true)} className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground text-xs h-8">
                <KeyRound className="w-4 h-4" /> {t('sidebar.changePassword')}
              </Button>
              <Button variant="ghost" onClick={() => setShowResetDialog(true)} className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive text-xs h-8">
                <Trash2 className="w-4 h-4" /> {t('sidebar.resetAccount')}
              </Button>
              <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive text-xs h-8">
                <LogOut className="w-4 h-4" /> {t('sidebar.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => setInstallOpen(true)} className="w-full text-primary hover:bg-primary/10 h-8" title={t('sidebar.installApp')}>
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="w-full text-muted-foreground hover:text-destructive h-8" title={t('sidebar.logout')}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Dialogs */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">{t('password.dialogTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t('password.newPassword')}</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-secondary" placeholder={t('password.minChars')} />
            </div>
            <div>
              <Label className="text-xs">{t('password.confirmPassword')}</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-secondary" />
            </div>
            <Button onClick={handleChangePassword} className="w-full gradient-gold text-primary-foreground font-display">
              {t('password.update')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-card border-destructive/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-display">
              <Trash2 className="w-5 h-5" /> {t('reset.title')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">{t('reset.cannotUndo')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed"><strong>{t('reset.warning')}</strong></p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>{t('reset.tradeHistory')}</li>
                <li>{t('reset.deposits')}</li>
                <li>{t('reset.balance')}</li>
                <li>{t('reset.streaks')}</li>
                <li>{t('reset.settings')}</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowResetDialog(false)} className="flex-1">{t('reset.cancel')}</Button>
              <Button variant="destructive" onClick={handleResetAccount} disabled={resetLoading} className="flex-1 gap-2">
                <Trash2 className="w-4 h-4" />
                {resetLoading ? t('reset.deleting') : t('reset.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InstallAppDialog open={installOpen} onOpenChange={setInstallOpen} />

      {/* Topbar + Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8" />
            <h1 className="font-display text-xs font-bold text-foreground tracking-wide hidden sm:block">
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{displayName}</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {(displayName || 'T')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
