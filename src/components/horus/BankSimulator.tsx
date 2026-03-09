import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Calculator, AlertTriangle, Sparkles, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import FieldHelp from '@/components/FieldHelp';

interface Scenario {
  name: string;
  color: string;
  multiplier: number;
  description: string;
}

export default function BankSimulator() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const currency = isEn ? '$' : 'R$';

  const SCENARIOS: Scenario[] = [
    { name: t('horus.conservative'), color: 'hsl(142, 71%, 45%)', multiplier: 0.6, description: t('horus.conservativeDesc') },
    { name: t('horus.moderate'), color: 'hsl(48, 96%, 53%)', multiplier: 1.0, description: t('horus.moderateDesc') },
    { name: t('horus.aggressive'), color: 'hsl(0, 84%, 60%)', multiplier: 1.5, description: t('horus.aggressiveDesc') },
  ];

  const [balance, setBalance] = useState(0);
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
        if (profile) setBalance(Number(profile.balance) || 0);
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

  const projections = useMemo(() => {
    const results: { scenario: string; data: { day: number; value: number }[]; finalValue: number; color: string }[] = [];
    SCENARIOS.forEach(scenario => {
      const data: { day: number; value: number }[] = [];
      let currentBalance = balance;
      for (let day = 0; day <= days; day++) {
        data.push({ day, value: Math.round(currentBalance) });
        const dailyOps = Math.round(opsPerDay * scenario.multiplier);
        for (let op = 0; op < dailyOps; op++) {
          const isWin = Math.random() * 100 < winRate;
          if (isWin) currentBalance += avgProfit * scenario.multiplier;
          else currentBalance -= (avgProfit / (winRate / (100 - winRate))) * scenario.multiplier;
        }
        currentBalance = Math.max(0, currentBalance);
      }
      results.push({ scenario: scenario.name, data, finalValue: Math.round(currentBalance), color: scenario.color });
    });
    return results;
  }, [balance, winRate, avgProfit, opsPerDay, days]);

  const CHART_COLORS = { cardBg: 'hsl(222, 47%, 11%)', border: 'hsl(217, 33%, 17%)', muted: 'hsl(218, 11%, 65%)' };

  if (loading) {
    return (<Card className="border-border bg-card"><CardContent className="p-6 h-64 flex items-center justify-center"><div className="animate-pulse-gold w-10 h-10 rounded-full bg-primary" /></CardContent></Card>);
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center"><Calculator className="w-5 h-5 text-primary-foreground" /></div>
            <div>
              <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">{t('horus.bankSimulator')}</h3>
              <p className="text-[10px] text-muted-foreground">{t('horus.bankSimulatorDesc')}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{days} {t('common.days')}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="text-center p-3 rounded-lg bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase">{t('horus.currentBank')}</p><p className="text-lg font-bold text-primary font-mono">{currency} {balance.toLocaleString()}</p></div>
          <div className="text-center p-3 rounded-lg bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase">Win Rate</p><p className="text-lg font-bold text-foreground font-mono">{winRate}%</p></div>
          <div className="text-center p-3 rounded-lg bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase">{t('horus.avgProfit')}</p><p className="text-lg font-bold text-success font-mono">{currency} {avgProfit}</p></div>
          <div className="text-center p-3 rounded-lg bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase">{t('horus.opsPerDay')}</p><p className="text-lg font-bold text-foreground font-mono">{opsPerDay}</p></div>
        </div>

        <div className="space-y-4 mb-5 p-4 rounded-lg bg-secondary/20 border border-border/50">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center">{t('horus.projectionPeriod')}<FieldHelp text={t('horus.projectionPeriodHelp')} /></span>
              <span className="text-xs font-mono text-primary">{days} {t('common.days')}</span>
            </div>
            <Slider value={[days]} onValueChange={([v]) => setDays(v)} min={7} max={90} step={1} className="w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center">{t('horus.simulatedWinRate')}<FieldHelp text={t('horus.winRateHelp')} /></span>
              <span className="text-xs font-mono text-primary">{winRate}%</span>
            </div>
            <Slider value={[winRate]} onValueChange={([v]) => setWinRate(v)} min={40} max={80} step={1} className="w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center">{t('horus.avgProfit')}<FieldHelp text={t('horus.avgProfitHelp')} /></span>
              <span className="text-xs font-mono text-primary">{currency} {avgProfit}</span>
            </div>
            <Slider value={[avgProfit]} onValueChange={([v]) => setAvgProfit(v)} min={1} max={200} step={1} className="w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center">{t('horus.opsPerDay')}<FieldHelp text={t('horus.opsPerDayHelp')} /></span>
              <span className="text-xs font-mono text-primary">{opsPerDay}</span>
            </div>
            <Slider value={[opsPerDay]} onValueChange={([v]) => setOpsPerDay(v)} min={1} max={30} step={1} className="w-full" />
          </div>
        </div>

        <div className="h-48 mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart>
              <defs>{SCENARIOS.map((s, i) => (<linearGradient key={i} id={`gradient-${s.name}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={s.color} stopOpacity={0.3} /><stop offset="95%" stopColor={s.color} stopOpacity={0} /></linearGradient>))}</defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} type="number" domain={[0, days]} allowDataOverflow />
              <YAxis tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: CHART_COLORS.cardBg, border: `1px solid ${CHART_COLORS.border}`, borderRadius: '10px', fontSize: '11px' }} formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, '']} />
              {projections.map((proj, i) => (<Area key={i} data={proj.data} type="monotone" dataKey="value" stroke={proj.color} fill={`url(#gradient-${proj.scenario})`} strokeWidth={2} />))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {projections.map((proj, i) => {
            const helpKeys = ['conservativeHelp', 'moderateHelp', 'aggressiveHelp'];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center p-3 rounded-lg border" style={{ borderColor: `${proj.color}40`, backgroundColor: `${proj.color}08` }}>
                <p className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center justify-center">{proj.scenario}<FieldHelp text={t(`horus.${helpKeys[i]}`)} /></p>
                <p className="text-lg font-bold font-mono" style={{ color: proj.color }}>{currency} {proj.finalValue.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{balance > 0 ? `${proj.finalValue > balance ? '+' : ''}${Math.round(((proj.finalValue - balance) / balance) * 100)}%` : '—'}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-secondary/30 border border-border/50 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><p className="text-[10px] text-muted-foreground leading-relaxed">{t('horus.disclaimer')}</p></div>
        </div>

        {aiInsight && (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
            <div className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" /><div><p className="text-xs font-bold text-primary mb-1">{t('horus.horusInsight')}</p><p className="text-[11px] text-muted-foreground leading-relaxed">{aiInsight}</p></div></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
