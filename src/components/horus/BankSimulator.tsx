import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calculator, AlertTriangle, Sparkles, TrendingUp, TrendingDown,
  Activity, Target, BarChart3, Zap, Eye, Shield, Loader2, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import FieldHelp from '@/components/FieldHelp';
import { useToast } from '@/hooks/use-toast';

/* ─── Premium Color Tokens ──────────────────────────────────────── */
const C = {
  conservative: { main: 'hsl(217, 91%, 60%)', light: 'hsla(217, 91%, 60%, 0.15)', glow: 'hsla(217, 91%, 60%, 0.25)' },
  moderate:     { main: 'hsl(48, 96%, 53%)',  light: 'hsla(48, 96%, 53%, 0.12)',  glow: 'hsla(48, 96%, 53%, 0.20)' },
  aggressive:   { main: 'hsl(142, 71%, 45%)', light: 'hsla(142, 71%, 45%, 0.12)', glow: 'hsla(142, 71%, 45%, 0.20)' },
  discipline:   { main: 'hsl(218, 11%, 40%)', dash: '6 4' },
};

const STRATEGIC_QUOTES_PT = [
  'Crescimento saudável vem de repetição disciplinada, não de intensidade emocional.',
  'Seu futuro no mercado é reflexo do seu padrão repetido.',
  'Consistência faz curvas bonitas. Impulsividade faz picos e quedas.',
  'A banca cresce quando o comportamento não sabota o processo.',
];
const STRATEGIC_QUOTES_EN = [
  'Healthy growth comes from disciplined repetition, not emotional intensity.',
  'Your market future reflects your repeated pattern.',
  'Consistency makes beautiful curves. Impulsivity makes spikes and drops.',
  'The balance grows when behavior doesn\'t sabotage the process.',
];

export default function BankSimulator() {
  const { user, session } = useAuth();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isEn = i18n.language === 'en';
  const currency = isEn ? '$' : 'R$';
  const quotes = isEn ? STRATEGIC_QUOTES_EN : STRATEGIC_QUOTES_PT;

  const [balance, setBalance] = useState(1500);
  const [winRate, setWinRate] = useState(55);
  const [avgProfit, setAvgProfit] = useState(20);
  const [avgLoss, setAvgLoss] = useState(25);
  const [opsPerDay, setOpsPerDay] = useState(5);
  const [days, setDays] = useState(30);
  const [showDisciplineLine, setShowDisciplineLine] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quoteIdx, setQuoteIdx] = useState(0);

  // AI analysis
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [staticInsight, setStaticInsight] = useState('');

  useEffect(() => {
    const iv = setInterval(() => setQuoteIdx(i => (i + 1) % quotes.length), 7000);
    return () => clearInterval(iv);
  }, [quotes.length]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [{ data: profile }, { data: trades }] = await Promise.all([
          supabase.from('profiles').select('balance, total_profit').eq('user_id', user.id).single(),
          supabase.from('trades').select('profit, result, trade_date').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        ]);
        if (profile) setBalance(Number(profile.balance) || 1500);
        if (trades && trades.length > 0) {
          const wins = trades.filter(t => t.result === 'win').length;
          setWinRate(Math.round((wins / trades.length) * 100));
          const profits = trades.filter(t => t.profit && t.profit > 0).map(t => Number(t.profit));
          if (profits.length > 0) setAvgProfit(Math.round(profits.reduce((a, b) => a + b, 0) / profits.length));
          const losses = trades.filter(t => t.profit && t.profit < 0).map(t => Math.abs(Number(t.profit)));
          if (losses.length > 0) setAvgLoss(Math.round(losses.reduce((a, b) => a + b, 0) / losses.length));
          const uniqueDays = [...new Set(trades.map(t => t.trade_date).filter(Boolean))];
          if (uniqueDays.length > 0) setOpsPerDay(Math.round(trades.length / uniqueDays.length));
        }
        if (trades && trades.length >= 10) {
          const recentLosses = trades.slice(0, 5).filter(t => t.result === 'loss').length;
          const currentWinRate = Math.round((trades.filter(t => t.result === 'win').length / trades.length) * 100);
          if (recentLosses >= 3) setStaticInsight(t('horus.insightRecover'));
          else if (currentWinRate >= 60) setStaticInsight(t('horus.insightGood'));
          else setStaticInsight(t('horus.insightModerate'));
        }
      } catch (err) { console.error('Error loading simulator data:', err); }
      finally { setLoading(false); }
    };
    loadData();
  }, [user]);

  /* ─── Deterministic Calculation ──────────────────────────────── */
  const calcScenario = (wr: number) => {
    const winDec = Math.min(wr, 100) / 100;
    const totalOps = opsPerDay * days;
    const totalWins = Math.round(totalOps * winDec);
    const totalLosses = totalOps - totalWins;
    const profit = (totalWins * avgProfit) - (totalLosses * avgLoss);

    const data: { day: number; value: number }[] = [];
    let bal = balance;
    const dailyWins = Math.round(opsPerDay * winDec);
    const dailyLosses = opsPerDay - dailyWins;
    const dailyProfit = (dailyWins * avgProfit) - (dailyLosses * avgLoss);
    for (let d = 0; d <= days; d++) {
      data.push({ day: d, value: Math.round(bal) });
      if (d < days) bal = Math.max(0, bal + dailyProfit);
    }
    return { data, finalValue: Math.round(Math.max(0, balance + profit)), totalOps, totalWins, totalLosses, profit: Math.round(profit) };
  };

  // Discipline line: gentle 1%/day growth
  const disciplineData = useMemo(() => {
    const data: { day: number; value: number }[] = [];
    let bal = balance;
    for (let d = 0; d <= days; d++) {
      data.push({ day: d, value: Math.round(bal) });
      bal *= 1.01;
    }
    return data;
  }, [balance, days]);

  const projections = useMemo(() => {
    const c = calcScenario(Math.max(0, winRate - 10));
    const m = calcScenario(winRate);
    const a = calcScenario(Math.min(100, winRate + 10));
    return [
      { name: t('horus.conservative'), key: 'conservative', color: C.conservative, ...c, wrUsed: Math.max(0, winRate - 10) },
      { name: t('horus.moderate'), key: 'moderate', color: C.moderate, ...m, wrUsed: winRate },
      { name: t('horus.aggressive'), key: 'aggressive', color: C.aggressive, ...a, wrUsed: Math.min(100, winRate + 10) },
    ];
  }, [balance, winRate, avgProfit, avgLoss, opsPerDay, days, t]);

  const chartData = useMemo(() => {
    const merged: Record<number, any> = {};
    projections.forEach(p => {
      p.data.forEach(d => {
        if (!merged[d.day]) merged[d.day] = { day: d.day };
        merged[d.day][p.key] = d.value;
      });
    });
    if (showDisciplineLine) {
      disciplineData.forEach(d => {
        if (!merged[d.day]) merged[d.day] = { day: d.day };
        merged[d.day].discipline = d.value;
      });
    }
    return Object.values(merged).sort((a: any, b: any) => a.day - b.day);
  }, [projections, disciplineData, showDisciplineLine]);

  const alerts = useMemo(() => {
    const a: string[] = [];
    if (winRate < 52) a.push(t('horus.alertLowWinRate'));
    if (opsPerDay > 15) a.push(t('horus.alertHighOps'));
    if (projections[0]?.finalValue < balance) a.push(t('horus.alertNegativeGrowth'));
    return a;
  }, [winRate, opsPerDay, projections, balance, t]);

  /* ─── AI Analysis ──────────────────────────────────────────── */
  const requestAiAnalysis = async () => {
    if (!session || aiLoading) return;
    setAiLoading(true);
    setAiInsight('');
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/horus-simulator-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          balance, winRate, avgProfit, opsPerDay, days,
          conservative: projections[0].finalValue,
          moderate: projections[1].finalValue,
          aggressive: projections[2].finalValue,
          language: i18n.language,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: 'Erro', description: data.error || 'Falha na análise', variant: 'destructive' });
        return;
      }
      setAiInsight(data.insight);
    } catch {
      toast({ title: 'Erro', description: isEn ? 'AI temporarily unavailable.' : 'IA temporariamente indisponível.', variant: 'destructive' });
    } finally { setAiLoading(false); }
  };

  /* ─── Custom Tooltip ──────────────────────────────────────── */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl p-4 shadow-2xl min-w-[180px]">
        <p className="text-[11px] font-display font-bold text-foreground mb-3 pb-2 border-b border-border/50">
          {t('horus.day')} {label}
        </p>
        {payload.map((p: any, i: number) => {
          if (p.dataKey === 'discipline') {
            return (
              <div key="disc" className="flex items-center gap-2 mb-1.5 opacity-60">
                <div className="w-2 h-0.5 bg-muted-foreground rounded" />
                <div>
                  <p className="text-[9px] text-muted-foreground">{isEn ? 'Discipline Line' : 'Linha de Disciplina'}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{currency} {p.value?.toLocaleString()}</p>
                </div>
              </div>
            );
          }
          const proj = projections.find(pr => pr.key === p.dataKey);
          const growthPct = balance > 0 ? ((p.value - balance) / balance * 100).toFixed(1) : '0';
          return (
            <div key={i} className="flex items-center gap-2.5 mb-2 last:mb-0">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.stroke, boxShadow: `0 0 6px ${p.stroke}` }} />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">{proj?.name}</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold font-mono" style={{ color: p.stroke }}>{currency} {p.value?.toLocaleString()}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{Number(growthPct) > 0 ? '+' : ''}{growthPct}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ─── Skeleton Loading ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-72" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
            <Skeleton className="h-72 rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fmtNum = (n: number) => n.toLocaleString();
  const growthPct = (val: number) => balance > 0 ? ((val - balance) / balance * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* ═══ MAIN CARD ═══ */}
      <Card className="border-primary/10 bg-gradient-to-br from-card via-card to-primary/[0.02] overflow-hidden relative">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <CardContent className="p-5 sm:p-8">
          {/* ─── Header ─── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shadow-lg relative">
                <Calculator className="w-7 h-7 text-primary-foreground" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center">
                  <Eye className="w-2.5 h-2.5 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wider">{t('horus.bankSimulator')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t('horus.bankSimulatorDesc')}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-md leading-relaxed">
                  {isEn
                    ? 'Visualize how your balance can evolve over time based on discipline, win rate, operational frequency and risk taken.'
                    : 'Visualize como sua banca pode evoluir ao longo do tempo com base em disciplina, win rate, frequência operacional e risco assumido.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-display tracking-wider gap-1 px-3 py-1">
                <Sparkles className="w-3 h-3" />
                Powered by Horus IA
              </Badge>
            </div>
          </div>

          {/* ─── Stats Cards ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Target, label: t('horus.currentBank'), value: `${currency} ${fmtNum(balance)}`, accent: true },
              { icon: BarChart3, label: 'Win Rate', value: `${winRate}%` },
              { icon: TrendingUp, label: t('horus.avgProfit'), value: `${currency} ${avgProfit}`, success: true },
              { icon: Activity, label: t('horus.opsPerDay'), value: `${opsPerDay}` },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                  s.accent
                    ? 'border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 shadow-[0_0_20px_hsla(48,96%,53%,0.06)]'
                    : 'border-border/40 bg-secondary/20 hover:border-border/60'
                }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <s.icon className={`w-3.5 h-3.5 ${s.accent ? 'text-primary' : s.success ? 'text-success' : 'text-muted-foreground'}`} />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
                </div>
                <p className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${s.accent ? 'text-primary text-glow' : s.success ? 'text-success' : 'text-foreground'}`}>
                  {s.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ─── Simulation Controls ─── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider">{t('horus.simulationControls')}</h3>
            </div>
            <div className="p-5 rounded-2xl bg-secondary/10 border border-border/30 space-y-6">
              {/* Balance */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">{t('horus.initialBalance')}<FieldHelp text={t('horus.initialBalanceHelp')} /></span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{currency}</span>
                    <Input type="number" value={balance} onChange={e => setBalance(Math.max(0, Number(e.target.value)))}
                      className="w-28 h-8 text-xs font-mono text-right bg-card border-border/50 rounded-lg" />
                  </div>
                </div>
                <Slider value={[balance]} onValueChange={([v]) => setBalance(v)} min={100} max={50000} step={50} className="w-full" />
              </div>

              {/* Period with quick buttons */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">{t('horus.projectionPeriod')}<FieldHelp text={t('horus.projectionPeriodHelp')} /></span>
                  <div className="flex gap-1.5">
                    {[7, 15, 30, 60, 90].map(d => (
                      <button key={d} onClick={() => setDays(d)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all duration-200 ${
                          days === d
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                            : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                        }`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
                <Slider value={[days]} onValueChange={([v]) => setDays(v)} min={7} max={90} step={1} className="w-full" />
              </div>

              {/* Win Rate */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">{t('horus.simulatedWinRate')}<FieldHelp text={t('horus.winRateHelp')} /></span>
                  <span className="text-sm font-mono font-bold text-primary">{winRate}%</span>
                </div>
                <Slider value={[winRate]} onValueChange={([v]) => setWinRate(v)} min={30} max={90} step={1} className="w-full" />
              </div>

              {/* Profit and Loss side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">{t('horus.avgProfit')}<FieldHelp text={t('horus.avgProfitHelp')} /></span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{currency}</span>
                      <Input type="number" value={avgProfit} onChange={e => setAvgProfit(Math.max(1, Number(e.target.value)))}
                        className="w-20 h-7 text-xs font-mono text-right bg-card border-border/50 rounded-lg" />
                    </div>
                  </div>
                  <Slider value={[avgProfit]} onValueChange={([v]) => setAvgProfit(v)} min={1} max={500} step={1} className="w-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">{t('horus.avgLoss')}<FieldHelp text={t('horus.avgLossHelp')} /></span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{currency}</span>
                      <Input type="number" value={avgLoss} onChange={e => setAvgLoss(Math.max(1, Number(e.target.value)))}
                        className="w-20 h-7 text-xs font-mono text-right bg-card border-border/50 rounded-lg" />
                    </div>
                  </div>
                  <Slider value={[avgLoss]} onValueChange={([v]) => setAvgLoss(v)} min={1} max={500} step={1} className="w-full" />
                </div>
              </div>

              {/* Ops/Day */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">{t('horus.opsPerDay')}<FieldHelp text={t('horus.opsPerDayHelp')} /></span>
                  <Input type="number" value={opsPerDay} onChange={e => setOpsPerDay(Math.max(1, Math.min(30, Number(e.target.value))))}
                    className="w-16 h-7 text-xs font-mono text-right bg-card border-border/50 rounded-lg" />
                </div>
                <Slider value={[opsPerDay]} onValueChange={([v]) => setOpsPerDay(v)} min={1} max={30} step={1} className="w-full" />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/20">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Switch checked={showDisciplineLine} onCheckedChange={setShowDisciplineLine} />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                    {isEn ? 'Discipline Line' : 'Linha de Disciplina'}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Switch checked={showComparison} onCheckedChange={setShowComparison} />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                    {isEn ? 'Compare Scenarios' : 'Comparar Cenários'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* ─── Chart ─── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider">{t('horus.evolutionChart')}</h3>
            </div>
            <div className="relative p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-secondary/10 to-secondary/5 border border-border/30 shadow-inner">
              <div className="h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      {Object.entries({ conservative: C.conservative.main, moderate: C.moderate.main, aggressive: C.aggressive.main }).map(([key, color]) => (
                        <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" strokeOpacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(218, 11%, 50%)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(218, 11%, 50%)' }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${currency}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                      width={55} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }}
                      formatter={(value: string) => {
                        const labels: Record<string, string> = {
                          conservative: t('horus.conservative'),
                          moderate: t('horus.moderate'),
                          aggressive: t('horus.aggressive'),
                          discipline: isEn ? 'Discipline' : 'Disciplina',
                        };
                        return <span className="text-muted-foreground text-[10px]">{labels[value] || value}</span>;
                      }}
                    />
                    {/* Reference line at starting balance */}
                    <ReferenceLine y={balance} stroke="hsl(218, 11%, 30%)" strokeDasharray="4 4" strokeWidth={1} />
                    {showDisciplineLine && (
                      <Area type="monotone" dataKey="discipline" stroke={C.discipline.main} fill="none"
                        strokeWidth={1.5} strokeDasharray={C.discipline.dash} animationDuration={1800} animationBegin={800} dot={false} />
                    )}
                    <Area type="monotone" dataKey="conservative" stroke={C.conservative.main} fill={`url(#grad-conservative)`}
                      strokeWidth={2} animationDuration={1500} animationBegin={0} dot={false} />
                    <Area type="monotone" dataKey="moderate" stroke={C.moderate.main} fill={`url(#grad-moderate)`}
                      strokeWidth={2.5} animationDuration={1500} animationBegin={200} dot={false} />
                    <Area type="monotone" dataKey="aggressive" stroke={C.aggressive.main} fill={`url(#grad-aggressive)`}
                      strokeWidth={2} animationDuration={1500} animationBegin={400} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ─── Projection Results ─── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider">{t('horus.projectionResults')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {projections.map((proj, i) => {
                const helpKeys = ['conservativeHelp', 'moderateHelp', 'aggressiveHelp'];
                const gp = growthPct(proj.finalValue);
                const isNeg = proj.finalValue < balance;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="group relative p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                    style={{
                      borderColor: `${proj.color.main}25`,
                      background: `linear-gradient(145deg, ${proj.color.light}, transparent)`,
                    }}>
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle, ${proj.color.glow}, transparent)` }} />

                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className="text-[11px] text-muted-foreground uppercase font-display font-bold tracking-wider">{proj.name}</p>
                        <FieldHelp text={t(`horus.${helpKeys[i]}`)} />
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 text-center mb-3">WR: {proj.wrUsed}%</p>

                      <p className="text-2xl sm:text-3xl font-bold font-mono text-center mb-2 tracking-tight" style={{ color: proj.color.main }}>
                        {currency} {fmtNum(proj.finalValue)}
                      </p>

                      <div className="flex items-center justify-center gap-1.5 mb-4">
                        {isNeg ? <TrendingDown className="w-4 h-4 text-destructive" /> : <TrendingUp className="w-4 h-4" style={{ color: proj.color.main }} />}
                        <p className="text-sm font-mono font-bold" style={{ color: isNeg ? 'hsl(0, 84%, 60%)' : proj.color.main }}>
                          {Number(gp) > 0 ? '+' : ''}{gp}%
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t" style={{ borderColor: `${proj.color.main}15` }}>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{t('horus.totalOps')}</span>
                          <span className="font-mono text-foreground">{proj.totalOps}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{t('horus.totalWins')}</span>
                          <span className="font-mono text-success">{proj.totalWins}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{t('horus.totalLosses')}</span>
                          <span className="font-mono text-destructive">{proj.totalLosses}</span>
                        </div>
                        <div className="flex justify-between text-[10px] pt-1 border-t" style={{ borderColor: `${proj.color.main}10` }}>
                          <span className="text-muted-foreground font-medium">{t('horus.projectedProfit')}</span>
                          <span className={`font-mono font-bold ${proj.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {proj.profit >= 0 ? '+' : ''}{currency} {fmtNum(Math.abs(proj.profit))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ─── Comparison Mode ─── */}
          <AnimatePresence>
            {showComparison && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider">
                    {isEn ? 'Scenario Comparison' : 'Comparação de Cenários'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { a: projections[0], b: projections[1] },
                    { a: projections[1], b: projections[2] },
                  ].map(({ a, b }, idx) => {
                    const diff = b.finalValue - a.finalValue;
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-secondary/10 border border-border/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-display font-bold" style={{ color: a.color.main }}>{a.name}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-display font-bold" style={{ color: b.color.main }}>{b.name}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase">{a.name}</p>
                            <p className="text-sm font-mono font-bold" style={{ color: a.color.main }}>{currency} {fmtNum(a.finalValue)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase">{isEn ? 'Difference' : 'Diferença'}</p>
                            <p className={`text-sm font-mono font-bold ${diff >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {diff >= 0 ? '+' : ''}{currency} {fmtNum(Math.abs(diff))}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase">{b.name}</p>
                            <p className="text-sm font-mono font-bold" style={{ color: b.color.main }}>{currency} {fmtNum(b.finalValue)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Alerts ─── */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 mb-6">
                {alerts.map((alert, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/5 border border-destructive/15">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-[11px] text-destructive/80 leading-relaxed">{alert}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Strategic Quote ─── */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div key={quoteIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.4 }}
                className="text-center py-4 px-6 rounded-xl bg-secondary/5 border border-border/10">
                <p className="text-[11px] italic text-muted-foreground/70 leading-relaxed">"{quotes[quoteIdx]}"</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── Disclaimer ─── */}
          <div className="bg-secondary/10 border border-border/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">{t('horus.disclaimer')}</p>
            </div>
          </div>

          {/* ─── Horus IA Insight ─── */}
          <div className="space-y-4">
            {/* Static insight */}
            {staticInsight && !aiInsight && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-display font-bold text-primary mb-1">{t('horus.horusInsight')}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{staticInsight}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Generated insight */}
            {aiInsight && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/15 shadow-[0_0_30px_hsla(48,96%,53%,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-display font-bold text-primary mb-2">{t('horus.horusInsight')}</p>
                    <p className="text-xs text-foreground/80 leading-relaxed">{aiInsight}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ask AI Button */}
            <div className="flex justify-center">
              <Button
                onClick={requestAiAnalysis}
                disabled={aiLoading}
                className="gap-2 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground font-display text-xs tracking-wider shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 px-6"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEn ? 'Analyzing...' : 'Analisando...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {isEn ? 'Request Horus AI Analysis' : 'Pedir análise da Horus IA'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
