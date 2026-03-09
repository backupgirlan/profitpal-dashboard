import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Calculator, AlertTriangle, Sparkles, TrendingUp, TrendingDown, Activity, Target, BarChart3, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import FieldHelp from '@/components/FieldHelp';

const COLORS = {
  conservative: 'hsl(210, 70%, 60%)',
  moderate: 'hsl(45, 93%, 58%)',
  aggressive: 'hsl(142, 71%, 45%)',
};

export default function BankSimulator() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const currency = isEn ? '$' : 'R$';

  const [balance, setBalance] = useState(1500);
  const [winRate, setWinRate] = useState(55);
  const [avgProfit, setAvgProfit] = useState(20);
  const [opsPerDay, setOpsPerDay] = useState(5);
  const [days, setDays] = useState(30);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(true);

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
          const uniqueDays = [...new Set(trades.map(t => t.trade_date).filter(Boolean))];
          if (uniqueDays.length > 0) setOpsPerDay(Math.round(trades.length / uniqueDays.length));
        }
        if (trades && trades.length >= 10) {
          const recentLosses = trades.slice(0, 5).filter(t => t.result === 'loss').length;
          const currentWinRate = Math.round((trades.filter(t => t.result === 'win').length / trades.length) * 100);
          if (recentLosses >= 3) setAiInsight(t('horus.insightRecover'));
          else if (currentWinRate >= 60) setAiInsight(t('horus.insightGood'));
          else setAiInsight(t('horus.insightModerate'));
        }
      } catch (err) { console.error('Error loading simulator data:', err); }
      finally { setLoading(false); }
    };
    loadData();
  }, [user]);

  // Deterministic formula: no randomness
  const calcScenario = (wr: number) => {
    const lossRate = (100 - wr) / 100;
    const winRateDec = wr / 100;
    const avgLoss = winRateDec > 0 ? avgProfit * (winRateDec / lossRate) * 0.8 : avgProfit;
    const totalOps = opsPerDay * days;
    const totalWins = Math.round(totalOps * winRateDec);
    const totalLosses = totalOps - totalWins;
    const profit = (totalWins * avgProfit) - (totalLosses * avgLoss);
    const finalBalance = Math.max(0, balance + profit);

    // Day-by-day evolution
    const data: { day: number; value: number }[] = [];
    let runningBalance = balance;
    for (let d = 0; d <= days; d++) {
      data.push({ day: d, value: Math.round(runningBalance) });
      if (d < days) {
        const dailyWins = Math.round(opsPerDay * winRateDec);
        const dailyLosses = opsPerDay - dailyWins;
        const dailyProfit = (dailyWins * avgProfit) - (dailyLosses * avgLoss);
        runningBalance = Math.max(0, runningBalance + dailyProfit);
      }
    }
    return { data, finalValue: Math.round(finalBalance), totalOps, totalWins, totalLosses, profit: Math.round(profit) };
  };

  const projections = useMemo(() => {
    const conservative = calcScenario(Math.max(0, winRate - 10));
    const moderate = calcScenario(winRate);
    const aggressive = calcScenario(Math.min(100, winRate + 10));
    return [
      { name: t('horus.conservative'), key: 'conservative', color: COLORS.conservative, ...conservative },
      { name: t('horus.moderate'), key: 'moderate', color: COLORS.moderate, ...moderate },
      { name: t('horus.aggressive'), key: 'aggressive', color: COLORS.aggressive, ...aggressive },
    ];
  }, [balance, winRate, avgProfit, opsPerDay, days, t]);

  // Merge chart data
  const chartData = useMemo(() => {
    const merged: Record<number, any> = {};
    projections.forEach(p => {
      p.data.forEach(d => {
        if (!merged[d.day]) merged[d.day] = { day: d.day };
        merged[d.day][p.key] = d.value;
      });
    });
    return Object.values(merged).sort((a: any, b: any) => a.day - b.day);
  }, [projections]);

  // AI Alerts
  const alerts = useMemo(() => {
    const a: string[] = [];
    if (winRate < 52) a.push(t('horus.alertLowWinRate'));
    if (opsPerDay > 15) a.push(t('horus.alertHighOps'));
    if (projections[0]?.finalValue < balance) a.push(t('horus.alertNegativeGrowth'));
    return a;
  }, [winRate, opsPerDay, projections, balance, t]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-2xl">
        <p className="text-xs font-bold text-foreground mb-2">{t('horus.day')} {label}</p>
        {payload.map((p: any, i: number) => {
          const proj = projections.find(pr => pr.key === p.dataKey);
          const growthPct = balance > 0 ? ((p.value - balance) / balance * 100).toFixed(1) : '0';
          return (
            <div key={i} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }} />
              <div>
                <p className="text-[10px] text-muted-foreground">{proj?.name}</p>
                <p className="text-xs font-bold font-mono" style={{ color: p.stroke }}>{currency} {p.value.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{t('horus.growth')}: {Number(growthPct) > 0 ? '+' : ''}{growthPct}%</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 h-64 flex items-center justify-center">
          <div className="animate-pulse w-10 h-10 rounded-full bg-primary/30" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground uppercase tracking-wider">{t('horus.bankSimulator')}</h3>
                <p className="text-xs text-muted-foreground">{t('horus.bankSimulatorDesc')}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary font-mono">{days} {t('common.days')}</Badge>
          </div>

          {/* Current Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
              className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3 h-3 text-primary" />
                <p className="text-[10px] text-muted-foreground uppercase">{t('horus.currentBank')}</p>
              </div>
              <p className="text-lg font-bold text-primary font-mono">{currency} {balance.toLocaleString()}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="w-3 h-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase">Win Rate</p>
              </div>
              <p className="text-lg font-bold text-foreground font-mono">{winRate}%</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <p className="text-[10px] text-muted-foreground uppercase">{t('horus.avgProfit')}</p>
              </div>
              <p className="text-lg font-bold text-green-400 font-mono">{currency} {avgProfit}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3 h-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase">{t('horus.opsPerDay')}</p>
              </div>
              <p className="text-lg font-bold text-foreground font-mono">{opsPerDay}</p>
            </motion.div>
          </div>

          {/* Simulation Controls */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{t('horus.simulationControls')}</h4>
            </div>
            <div className="space-y-5 p-4 rounded-xl bg-secondary/10 border border-border/30">
              {/* Balance */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center">{t('horus.initialBalance')}<FieldHelp text={t('horus.initialBalanceHelp')} /></span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{currency}</span>
                    <Input type="number" value={balance} onChange={e => setBalance(Math.max(0, Number(e.target.value)))}
                      className="w-24 h-7 text-xs font-mono text-right bg-secondary/30 border-border/50" />
                  </div>
                </div>
                <Slider value={[balance]} onValueChange={([v]) => setBalance(v)} min={100} max={50000} step={100} className="w-full" />
              </div>

              {/* Projection Period */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center">{t('horus.projectionPeriod')}<FieldHelp text={t('horus.projectionPeriodHelp')} /></span>
                  <div className="flex gap-1">
                    {[7, 15, 30, 60, 90].map(d => (
                      <button key={d} onClick={() => setDays(d)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${days === d ? 'bg-primary text-primary-foreground font-bold' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'}`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
                <Slider value={[days]} onValueChange={([v]) => setDays(v)} min={7} max={90} step={1} className="w-full" />
              </div>

              {/* Win Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center">{t('horus.simulatedWinRate')}<FieldHelp text={t('horus.winRateHelp')} /></span>
                  <span className="text-xs font-mono text-primary font-bold">{winRate}%</span>
                </div>
                <Slider value={[winRate]} onValueChange={([v]) => setWinRate(v)} min={30} max={90} step={1} className="w-full" />
              </div>

              {/* Avg Profit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center">{t('horus.avgProfit')}<FieldHelp text={t('horus.avgProfitHelp')} /></span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{currency}</span>
                    <Input type="number" value={avgProfit} onChange={e => setAvgProfit(Math.max(1, Number(e.target.value)))}
                      className="w-20 h-7 text-xs font-mono text-right bg-secondary/30 border-border/50" />
                  </div>
                </div>
                <Slider value={[avgProfit]} onValueChange={([v]) => setAvgProfit(v)} min={1} max={500} step={1} className="w-full" />
              </div>

              {/* Ops Per Day */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center">{t('horus.opsPerDay')}<FieldHelp text={t('horus.opsPerDayHelp')} /></span>
                  <div className="flex items-center gap-1">
                    <Input type="number" value={opsPerDay} onChange={e => setOpsPerDay(Math.max(1, Math.min(30, Number(e.target.value))))}
                      className="w-16 h-7 text-xs font-mono text-right bg-secondary/30 border-border/50" />
                  </div>
                </div>
                <Slider value={[opsPerDay]} onValueChange={([v]) => setOpsPerDay(v)} min={1} max={30} step={1} className="w-full" />
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{t('horus.evolutionChart')}</h4>
            </div>
            <div className="h-64 sm:h-72 p-3 rounded-xl bg-secondary/10 border border-border/30">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    {Object.entries(COLORS).map(([key, color]) => (
                      <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" strokeOpacity={0.4} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(218, 11%, 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(218, 11%, 55%)' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${currency}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        conservative: t('horus.conservative'),
                        moderate: t('horus.moderate'),
                        aggressive: t('horus.aggressive'),
                      };
                      return <span className="text-muted-foreground">{labels[value] || value}</span>;
                    }}
                  />
                  <Area type="monotone" dataKey="conservative" stroke={COLORS.conservative} fill={`url(#grad-conservative)`} strokeWidth={2} animationDuration={1500} animationBegin={0} />
                  <Area type="monotone" dataKey="moderate" stroke={COLORS.moderate} fill={`url(#grad-moderate)`} strokeWidth={2.5} animationDuration={1500} animationBegin={300} />
                  <Area type="monotone" dataKey="aggressive" stroke={COLORS.aggressive} fill={`url(#grad-aggressive)`} strokeWidth={2} animationDuration={1500} animationBegin={600} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Projection Results */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{t('horus.projectionResults')}</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {projections.map((proj, i) => {
                const helpKeys = ['conservativeHelp', 'moderateHelp', 'aggressiveHelp'];
                const growthPct = balance > 0 ? ((proj.finalValue - balance) / balance * 100).toFixed(1) : '0';
                const isNegative = proj.finalValue < balance;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.4 }}
                    className="p-4 rounded-xl border transition-all hover:scale-[1.02]"
                    style={{ borderColor: `${proj.color}30`, background: `linear-gradient(135deg, ${proj.color}08, ${proj.color}03)` }}>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{proj.name}</p>
                      <FieldHelp text={t(`horus.${helpKeys[i]}`)} />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-center mb-1" style={{ color: proj.color }}>
                      {currency} {proj.finalValue.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      {isNegative ? <TrendingDown className="w-3 h-3 text-destructive" /> : <TrendingUp className="w-3 h-3" style={{ color: proj.color }} />}
                      <p className="text-xs font-mono" style={{ color: isNegative ? 'hsl(0, 84%, 60%)' : proj.color }}>
                        {Number(growthPct) > 0 ? '+' : ''}{growthPct}%
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t space-y-0.5" style={{ borderColor: `${proj.color}15` }}>
                      <p className="text-[9px] text-muted-foreground text-center">{t('horus.totalOps')}: <span className="font-mono text-foreground">{proj.totalOps}</span></p>
                      <p className="text-[9px] text-muted-foreground text-center">{t('horus.totalWins')}: <span className="font-mono text-green-400">{proj.totalWins}</span> · {t('horus.totalLosses')}: <span className="font-mono text-red-400">{proj.totalLosses}</span></p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mb-5">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-[11px] text-destructive/80 leading-relaxed">{alert}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <div className="bg-secondary/20 border border-border/30 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">{t('horus.disclaimer')}</p>
            </div>
          </div>

          {/* Horus AI Insight */}
          {aiInsight && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/15 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary mb-1">{t('horus.horusInsight')}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{aiInsight}</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
