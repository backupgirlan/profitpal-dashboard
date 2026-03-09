import { ReactNode, useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Home, BarChart3, Brain, LogOut,
  Menu, X, TrendingUp, ClipboardList, Shield, Youtube, KeyRound, Smartphone, Trash2,
  GraduationCap, FileText, Wind, BookOpen, Award, Settings, ChevronLeft, ChevronRight,
  Dot, Eye
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
import HorusCheckinModal from '@/components/horus/HorusCheckinModal';
import ProtectionModeOverlay from '@/components/horus/ProtectionModeOverlay';

const NAV_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
      { path: '/dashboard/management', label: 'Registrar Operação', icon: ClipboardList },
      { path: '/dashboard/report', label: 'Relatórios', icon: FileText },
    ],
  },
  {
    title: 'Mentalidade',
    items: [
      { path: '/dashboard/psychology', label: 'Psicologia', icon: Brain },
      { path: '/dashboard/breathing', label: 'Respiração', icon: Wind },
      { path: '/dashboard/mental', label: 'Modo Disciplina', icon: Shield },
      { path: '/dashboard/diary', label: 'Diário Emocional', icon: BookOpen },
    ],
  },
  {
    title: 'Progressão',
    items: [
      { path: '/dashboard/rankings', label: 'Conquistas', icon: Award },
      { path: '/dashboard/evolution', label: 'Evolução', icon: TrendingUp },
    ],
  },
  {
    title: 'Premium',
    items: [
      { path: '/dashboard/horus', label: 'Horus IA', icon: Eye },
      { path: '/dashboard/super-vip', label: 'Comprar Super VIP', icon: Award },
    ],
  },
  {
    title: 'Aprendizado',
    items: [
      { path: '/dashboard/videos', label: 'Vídeos', icon: Youtube },
      { path: '/dashboard/courses', label: 'Cursos', icon: GraduationCap },
    ],
  },
];

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
  const [userLevel, setUserLevel] = useState<'common' | 'vip' | 'super_vip'>('common');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [installOpen, setInstallOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Horus IA behavioral system
  const [showCheckin, setShowCheckin] = useState(false);
  const [showProtection, setShowProtection] = useState(false);
  const [consecutiveLosses, setConsecutiveLosses] = useState(0);
  const [protectionThreshold, setProtectionThreshold] = useState(2);
  const [lockoutMinutes, setLockoutMinutes] = useState(15);
  const [checkinEnabled, setCheckinEnabled] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  const allNavItems = NAV_SECTIONS.flatMap(s => s.items);

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

  // Load settings + check-in status + consecutive losses
  useEffect(() => {
    if (!user) return;
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data }) => setIsAdmin(!!data));
    supabase.from('profiles').select('display_name, is_vip, is_super_vip').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        if ((data as any)?.is_super_vip) setUserLevel('super_vip');
        else if ((data as any)?.is_vip) setUserLevel('vip');
        else setUserLevel('common');
      });

    // Load Horus flow settings
    supabase.from('horus_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['checkin_enabled', 'protection_enabled', 'protection_loss_threshold', 'protection_lockout_minutes'])
      .then(({ data: settings }) => {
        if (settings) {
          const map: Record<string, string> = {};
          settings.forEach(s => { map[s.setting_key] = s.setting_value; });
          setCheckinEnabled(map.checkin_enabled !== 'false');
          setProtectionThreshold(parseInt(map.protection_loss_threshold || '2'));
          setLockoutMinutes(parseInt(map.protection_lockout_minutes || '15'));
        }
      });

    // Check if today's check-in already done
    const today = new Date().toISOString().split('T')[0];
    supabase.from('emotional_checkins')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .limit(1)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          // No check-in today — show after a short delay
          setTimeout(() => setShowCheckin(true), 1200);
        }
      });

    // Check consecutive losses from recent trades
    supabase.from('trades')
      .select('result')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data: trades }) => {
        if (!trades) return;
        let losses = 0;
        for (const t of trades) {
          if (t.result === 'loss') losses++;
          else break;
        }
        setConsecutiveLosses(losses);
      });
  }, [user]);

  // Listen for real-time trade events to trigger protection mode
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('trades-monitor')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` }, async () => {
        // Re-fetch consecutive losses
        const { data: trades } = await supabase
          .from('trades')
          .select('result')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (!trades) return;
        let losses = 0;
        for (const t of trades) {
          if (t.result === 'loss') losses++;
          else break;
        }
        setConsecutiveLosses(losses);
        if (losses >= protectionThreshold) {
          setShowProtection(true);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, protectionThreshold]);

  // Show protection if consecutive losses already at threshold
  useEffect(() => {
    if (consecutiveLosses >= protectionThreshold && consecutiveLosses > 0) {
      setShowProtection(true);
    }
  }, [consecutiveLosses, protectionThreshold]);



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

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-xl p-2.5 text-primary shadow-lg backdrop-blur-sm"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ═══════ Sidebar ═══════ */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 ${sidebarWidth} bg-sidebar flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-sidebar-border">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">TG</span>
              </div>
              <div>
                <h2 className="font-display text-xs font-bold text-foreground tracking-wider leading-none">
                  TECHNICAL
                </h2>
                <span className="text-[10px] text-primary font-semibold tracking-widest">GIRLAN</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-xs">TG</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {(displayName || 'T')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground truncate">{displayName || 'Trader'}</p>
                  {userLevel === 'super_vip' ? (
                    <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md gradient-gold text-[9px] font-display font-bold text-primary-foreground leading-none">⭐ SUPER VIP</span>
                  ) : userLevel === 'vip' ? (
                    <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/15 border border-primary/30 text-[9px] font-display font-bold text-primary leading-none">VIP</span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-[9px] font-display font-bold text-muted-foreground leading-none">FREE</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <StreakDisplay />
              <div className="flex items-center gap-0.5">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5">
                  {section.title}
                </p>
              )}
              {sidebarCollapsed && <Separator className="my-1.5 bg-sidebar-border" />}
              <div className="space-y-0.5">
                {section.items
                  .filter((item) => {
                    // Hide "Comprar Super VIP" if user is already super_vip
                    if (item.path === '/dashboard/super-vip' && userLevel === 'super_vip') return false;
                    return true;
                  })
                  .map((item) => {
                  const isActive = location.pathname === item.path;
                  const isSuperVipLink = item.path === '/dashboard/super-vip';
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : isSuperVipLink
                            ? 'text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/70'
                      } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-primary' : isSuperVipLink ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      {!sidebarCollapsed && (
                        <span className="truncate flex items-center gap-1.5">
                          {item.label}
                          {isSuperVipLink && <span className="text-[9px] font-bold gradient-gold text-transparent bg-clip-text">⭐</span>}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Settings */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5">
                Sistema
              </p>
            )}
            {sidebarCollapsed && <Separator className="my-1.5 bg-sidebar-border" />}
            <div className="space-y-0.5">
              <Link
                to="/dashboard/settings"
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? 'Configurações' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative ${
                  location.pathname === '/dashboard/settings'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/70'
                } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                {location.pathname === '/dashboard/settings' && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Settings className={`w-[18px] h-[18px] shrink-0 ${location.pathname === '/dashboard/settings' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {!sidebarCollapsed && <span>Configurações</span>}
              </Link>

              {isAdmin && (
                <Link
                  to="/dashboard/admin"
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? 'Admin' : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative ${
                    location.pathname === '/dashboard/admin'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/70'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  {location.pathname === '/dashboard/admin' && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Shield className={`w-[18px] h-[18px] shrink-0 ${location.pathname === '/dashboard/admin' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  {!sidebarCollapsed && <span>Admin</span>}
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-sidebar-border">
          {!sidebarCollapsed ? (
            <div className="space-y-0.5">
              <Button variant="ghost" onClick={() => setInstallOpen(true)} className="w-full justify-start gap-3 text-primary hover:bg-primary/10 text-xs h-9 rounded-lg font-medium">
                <Smartphone className="w-4 h-4" /> {t('sidebar.installApp')}
              </Button>
              <Button variant="ghost" onClick={() => setShowPasswordDialog(true)} className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground text-xs h-9 rounded-lg">
                <KeyRound className="w-4 h-4" /> {t('sidebar.changePassword')}
              </Button>
              <Separator className="!my-1.5 bg-sidebar-border" />
              <Button variant="ghost" onClick={() => setShowResetDialog(true)} className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive text-xs h-9 rounded-lg">
                <Trash2 className="w-4 h-4" /> {t('sidebar.resetAccount')}
              </Button>
              <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive text-xs h-9 rounded-lg">
                <LogOut className="w-4 h-4" /> {t('sidebar.logout')}
              </Button>
            </div>
          ) : (
            <div className="space-y-1 flex flex-col items-center">
              <Button variant="ghost" size="icon" onClick={() => setInstallOpen(true)} className="text-primary hover:bg-primary/10 h-9 w-9 rounded-lg" title={t('sidebar.installApp')}>
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive h-9 w-9 rounded-lg" title={t('sidebar.logout')}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
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

      {/* ═══════ Topbar + Main ═══════ */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-14 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8" />
            <h1 className="font-display text-xs font-bold text-foreground tracking-wide hidden sm:block uppercase">
              {allNavItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
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
