import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Wallet, TrendingUp, CheckCircle, XCircle, Shield, ChevronRight, PiggyBank,
  Pencil, X, Target, ClipboardList, Activity, Flame, TrendingDown, Calendar,
  ArrowUpRight, ArrowDownRight, BarChart3, Quote
} from 'lucide-react';
import { getRankForProfit, getNextRankForProfit, TRADER_RANKS } from '@/lib/traderRanks';
import PatentPreviewDialog from '@/components/PatentPreviewDialog';
import FieldHelp from '@/components/FieldHelp';
import { useManagement2x } from '@/hooks/useManagement2x';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const MOTIVATIONAL_QUOTES = [
  "Trader profissional protege o capital.",
  "Disciplina gera consistência.",
  "O mercado pune a impulsividade.",
  "O objetivo não é ganhar hoje. É ainda estar no jogo amanhã.",
  "Recuperar perdas imediatamente é o erro que quebra contas.",
  "Paciência é a arma mais poderosa do trader.",
  "Consistência supera intensidade.",
  "O mercado sempre estará aqui amanhã.",
];

const StatCard = ({ icon: Icon, label, value, subValue, color = 'text-foreground', iconColor = 'text-primary' }: {
  icon: any; label: string; value: string; subValue?: string; color?: string; iconColor?: string;
}) => (
  <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className={`text-xl font-display font-bold ${color}`}>{value}</p>
      {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
    </CardContent>
  </Card>
);

const DashboardHome = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isEn = i18n.language === 'en';
  const mgmt = useManagement2x();

  const [balance, setBalance] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [displayName, setDisplayName] = useState('Trader');
  const [daysTrading, setDaysTrading] = useState(0);
  const [evolutionData, setEvolutionData] = useState<{ day: string; balance: number }[]>([]);

  // Trade form
  const [pair, setPair] = useState('');
  const [payout, setPayout] = useState('80');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedPairs, setSavedPairs] = useState<string[]>([]);
  const [showPairSuggestions, setShowPairSuggestions] = useState(false);
  const [editingPairIndex, setEditingPairIndex] = useState<number | null>(null);
  const [editingPairValue, setEditingPairValue] = useState('');

  // Deposit
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  // Patent dialog
  const [patentDialogOpen, setPatentDialogOpen] = useState(false);
  const [selectedPatentRank, setSelectedPatentRank] = useState(TRADER_RANKS[0]);

  // Emotional status
  const [emotionalState, setEmotionalState] = useState<string | null>(null);

  // Today stats
  const [todayProfit, setTodayProfit] = useState(0);
  const [weekProfit, setWeekProfit] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [lossStreak, setLossStreak] = useState(0);

  const quoteIndex = useMemo(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length), []);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [profileRes, tradesRes] = await Promise.all([
      supabase.from('profiles').select('balance, total_profit, display_name, created_at').eq('user_id', user.id).single(),
      supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    ]);
    if (profileRes.data) {
      setBalance(Number(profileRes.data.balance) || 0);
      setTotalProfit(Number(profileRes.data.total_profit) || 0);
      setDisplayName(profileRes.data.display_name || 'Trader');
      if (profileRes.data.created_at) {
        const created = new Date(profileRes.data.created_at);
        setDaysTrading(Math.max(1, Math.floor((Date.now() - created.getTime()) / 86400000)));
      }
    }
    if (tradesRes.data) {
      let w = 0, l = 0, todayP = 0, weekP = 0, monthP = 0;
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      // Calculate streaks
      let currentWinStreak = 0, currentLossStreak = 0;
      
      // Evolution data
      let cumBalance = 0;
      const evoMap: Record<string, number> = {};
      
      tradesRes.data.forEach(trade => {
        const profit = Number(trade.profit);
        if (trade.result === 'win') { w++; } else { l++; }
        
        const tradeDate = trade.trade_date || today;
        if (tradeDate >= today) todayP += profit;
        if (tradeDate >= weekAgo) weekP += profit;
        if (tradeDate >= monthAgo) monthP += profit;

        cumBalance += profit;
        evoMap[tradeDate] = cumBalance;
      });

      // Calculate current streaks from recent trades
      for (let i = tradesRes.data.length - 1; i >= 0; i--) {
        if (tradesRes.data[i].result === 'win') {
          if (currentLossStreak > 0) break;
          currentWinStreak++;
        } else {
          if (currentWinStreak > 0) break;
          currentLossStreak++;
        }
      }

      setWins(w); setLosses(l);
      setTodayProfit(todayP); setWeekProfit(weekP); setMonthProfit(monthP);
      setWinStreak(currentWinStreak); setLossStreak(currentLossStreak);

      // Build evolution chart data
      const evoEntries = Object.entries(evoMap).sort((a, b) => a[0].localeCompare(b[0]));
      setEvolutionData(evoEntries.map(([day, balance]) => ({
        day: day.slice(5), // MM-DD
        balance
      })));
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!user) return;
    supabase.from('trades').select('pair_name').eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setSavedPairs([...new Set(data.map(d => d.pair_name))].sort());
      });
  }, [user]);

  const filteredPairs = pair.length > 0
    ? savedPairs.filter(p => p.toLowerCase().startsWith(pair.toLowerCase()))
    : [];

  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener('balance-updated', handler);
    return () => window.removeEventListener('balance-updated', handler);
  }, [loadData]);

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';

  const handleEditPair = async (oldName: string, newName: string) => {
    if (!user || !newName.trim() || newName === oldName) { setEditingPairIndex(null); return; }
    await supabase.from('trades').update({ pair_name: newName.trim().toUpperCase() }).eq('user_id', user.id).eq('pair_name', oldName);
    setSavedPairs(prev => prev.map(p => p === oldName ? newName.trim().toUpperCase() : p).sort());
    setEditingPairIndex(null);
    toast.success('Par atualizado!');
  };

  const handleTrade = async (result: 'win' | 'loss') => {
    if (!pair.trim() || !amount || !user) return;
    if (emotionalState === 'ansioso' || emotionalState === 'impulsivo') {
      toast.warning('⚠️ Atenção: Seu estado emocional pode comprometer sua tomada de decisão.');
    }
    const amtNum = Number(amount);
    const payNum = Number(payout) / 100;
    if (amtNum <= 0) { toast.error(t('home.invalidAmount')); return; }
    setSubmitting(true);
    const profit = result === 'win' ? +(amtNum * payNum).toFixed(2) : -amtNum;
    const newBalance = +(balance + profit).toFixed(2);
    const newTotalProfit = +(totalProfit + profit).toFixed(2);

    const [tradeRes, profileRes] = await Promise.all([
      supabase.from('trades').insert({
        user_id: user.id, pair_name: pair.trim().toUpperCase(), payout: Number(payout),
        result, amount: amtNum, profit, management_mode: 'quick',
      }),
      supabase.from('profiles').update({ balance: newBalance, total_profit: newTotalProfit }).eq('user_id', user.id),
    ]);

    if (tradeRes.error || profileRes.error) {
      toast.error(t('common.error'));
    } else {
      setBalance(newBalance); setTotalProfit(newTotalProfit);
      if (result === 'win') setWins(w => w + 1); else setLosses(l => l + 1);
      toast.success(result === 'win' ? `✅ WIN +R$ ${(amtNum * payNum).toFixed(2)}` : `❌ LOSS -R$ ${amtNum.toFixed(2)}`);
      if (!savedPairs.includes(pair.trim().toUpperCase())) setSavedPairs(prev => [...prev, pair.trim().toUpperCase()].sort());
      setPair(''); setAmount('');
      window.dispatchEvent(new Event('balance-updated'));
      loadData();
    }
    setSubmitting(false);
  };

  const rank = getRankForProfit(totalProfit);
  const nextRank = getNextRankForProfit(totalProfit);
  const rankProgress = nextRank ? Math.min(100, (totalProfit / nextRank.minProfit) * 100) : 100;
  const mgmtState = mgmt.state;
  const mgmtActive = mgmtState.ativo;

  const emotionalOptions = [
    { key: 'calmo', label: '😌 Calmo', safe: true },
    { key: 'concentrado', label: '🎯 Concentrado', safe: true },
    { key: 'ansioso', label: '😰 Ansioso', safe: false },
    { key: 'cansado', label: '😴 Cansado', safe: false },
    { key: 'impulsivo', label: '⚡ Impulsivo', safe: false },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10"
      >
        <Quote className="w-4 h-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground italic">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</p>
      </motion.div>

      {/* Management Summary */}
      {mgmtActive && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-display text-xs font-bold text-primary mb-3 flex items-center gap-2 uppercase tracking-wider">
              <ClipboardList className="w-4 h-4" /> Gerenciamento em Andamento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Modelo</p>
                <p className="font-display font-bold text-foreground">{mgmtState.model?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Banca</p>
                <p className="font-display font-bold text-foreground">R$ {mgmtState.banca.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Entrada</p>
                <p className="font-display font-bold text-primary">R$ {mgmtState.entradaRecomendada.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Placar</p>
                <p className="font-display font-bold">
                  <span className="win-text">{mgmtState.cicloWins}W</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="loss-text">{mgmtState.cicloLosses}L</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="Banca Atual" value={`R$ ${balance.toFixed(2)}`} iconColor="text-primary" />
        <StatCard
          icon={TrendingUp}
          label="Lucro do Dia"
          value={`R$ ${todayProfit.toFixed(2)}`}
          color={todayProfit >= 0 ? 'win-text' : 'loss-text'}
          iconColor={todayProfit >= 0 ? 'text-success' : 'text-destructive'}
        />
        <StatCard
          icon={Calendar}
          label="Lucro da Semana"
          value={`R$ ${weekProfit.toFixed(2)}`}
          color={weekProfit >= 0 ? 'win-text' : 'loss-text'}
          iconColor={weekProfit >= 0 ? 'text-success' : 'text-destructive'}
        />
        <StatCard
          icon={BarChart3}
          label="Lucro do Mês"
          value={`R$ ${monthProfit.toFixed(2)}`}
          color={monthProfit >= 0 ? 'win-text' : 'loss-text'}
          iconColor={monthProfit >= 0 ? 'text-success' : 'text-destructive'}
        />
      </div>

      {/* Win Rate + Streaks */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Win Rate</p>
            <p className="text-2xl font-display font-bold text-primary">{winRate}%</p>
            <p className="text-xs text-muted-foreground">{totalTrades} operações</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowUpRight className="w-3 h-3 text-success" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sequência Wins</p>
            </div>
            <p className="text-2xl font-display font-bold win-text">{winStreak}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowDownRight className="w-3 h-3 text-destructive" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sequência Losses</p>
            </div>
            <p className="text-2xl font-display font-bold loss-text">{lossStreak}</p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-display text-xs font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-primary" /> Evolução da Banca
          </h3>
          <div className="h-56">
            {evolutionData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(45, 100%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(45, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 50%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 10%, 50%)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 7%)',
                      border: '1px solid hsl(220, 15%, 16%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(210, 15%, 88%)' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="hsl(45, 100%, 50%)" strokeWidth={2} fill="url(#balanceGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {t('home.noTrades')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emotional Status */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
            Estado Emocional Antes de Operar
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Como você está se sentindo agora?</p>
          <div className="flex flex-wrap gap-2">
            {emotionalOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setEmotionalState(emotionalState === opt.key ? null : opt.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  emotionalState === opt.key
                    ? opt.safe
                      ? 'border-success/50 bg-success/10 text-success'
                      : 'border-destructive/50 bg-destructive/10 text-destructive'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {emotionalState && !emotionalOptions.find(o => o.key === emotionalState)?.safe && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
            >
              <p className="text-sm font-bold text-destructive flex items-center gap-2">
                ⚠️ ATENÇÃO
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Operar com emocional alterado aumenta drasticamente as chances de perda. Considere pausar e voltar ao mercado mais tarde.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-display text-xs font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
              <PiggyBank className="w-4 h-4 text-primary" /> {t('home.deposit')}
            </h3>
            <div className="flex gap-3">
              <Input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder={t('home.depositPlaceholder')} className="bg-secondary/50" />
              <Button disabled={!depositAmount || depositing} className="gradient-gold text-primary-foreground shrink-0" onClick={async () => {
                const val = Number(depositAmount);
                if (!val || val <= 0 || !user) return;
                setDepositing(true);
                const newBalance = +(balance + val).toFixed(2);
                await Promise.all([
                  supabase.from('deposits').insert({ user_id: user.id, amount: val }),
                  supabase.from('profiles').update({ balance: newBalance }).eq('user_id', user.id),
                ]);
                setBalance(newBalance); setDepositAmount('');
                toast.success(`💰 ${t('home.depositSuccess')} R$ ${val.toFixed(2)}`);
                window.dispatchEvent(new Event('balance-updated'));
                setDepositing(false);
              }}>
                {t('home.depositBtn')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Trade */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-display text-xs font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
              {t('home.quickTrade')}
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <Label className="text-xs">{t('home.pair')}</Label>
                <Input
                  value={pair}
                  onChange={e => { setPair(e.target.value.toUpperCase()); setShowPairSuggestions(true); }}
                  onFocus={() => setShowPairSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPairSuggestions(false), 300)}
                  placeholder="EUR/USD"
                  className="bg-secondary/50 uppercase"
                  autoComplete="off"
                />
                {showPairSuggestions && filteredPairs.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredPairs.map((p, idx) => (
                      <div key={p} className="flex items-center hover:bg-secondary transition-colors">
                        {editingPairIndex === idx ? (
                          <div className="flex items-center gap-1 w-full px-2 py-1" onClick={e => e.stopPropagation()}>
                            <Input autoFocus value={editingPairValue} onChange={e => setEditingPairValue(e.target.value.toUpperCase())}
                              onKeyDown={e => { if (e.key === 'Enter') handleEditPair(p, editingPairValue); if (e.key === 'Escape') setEditingPairIndex(null); }}
                              className="h-6 text-xs bg-secondary uppercase" onBlur={e => e.stopPropagation()} />
                            <button type="button" onMouseDown={e => { e.preventDefault(); handleEditPair(p, editingPairValue); }} className="text-primary"><CheckCircle className="w-3.5 h-3.5" /></button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); setEditingPairIndex(null); }} className="text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <>
                            <button type="button" className="flex-1 text-left px-3 py-1.5 text-xs text-foreground" onMouseDown={() => { setPair(p); setShowPairSuggestions(false); }}>{p}</button>
                            <button type="button" className="px-2 text-muted-foreground hover:text-primary" onMouseDown={e => { e.preventDefault(); setEditingPairIndex(idx); setEditingPairValue(p); }}>
                              <Pencil className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">Payout (%)</Label>
                <Input type="number" value={payout} onChange={e => setPayout(e.target.value)} placeholder="80" className="bg-secondary/50" />
              </div>
              <div>
                <Label className="text-xs">{t('home.entryValue')}</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10.00" className="bg-secondary/50" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleTrade('win')} disabled={!pair.trim() || !amount || submitting}
                className="flex-1 font-display gap-2 bg-success/15 text-success hover:bg-success/25 border border-success/20">
                <CheckCircle className="w-4 h-4" /> WIN
              </Button>
              <Button onClick={() => handleTrade('loss')} disabled={!pair.trim() || !amount || submitting}
                className="flex-1 font-display gap-2 bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20">
                <XCircle className="w-4 h-4" /> LOSS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patent System */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-display text-xs font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-primary" /> {t('home.patent')}
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: rank.color + '15', border: `2px solid ${rank.color}` }}>
              {rank.emoji}
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-foreground" style={{ color: rank.color }}>
                {isEn ? rank.nameEn : rank.name}
              </p>
              {nextRank && (
                <>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {t('home.nextRank')}: {isEn ? nextRank.nameEn : nextRank.name} {nextRank.emoji}
                    <ChevronRight className="w-3 h-3" /> R$ {nextRank.minProfit.toLocaleString()}
                  </p>
                  <Progress value={rankProgress} className="h-1.5 mt-2" />
                </>
              )}
              {!nextRank && <p className="text-xs text-primary font-bold">{t('home.maxRank')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
            {TRADER_RANKS.filter(r => r.minProfit > 0).map((r) => {
              const unlocked = totalProfit >= r.minProfit;
              return (
                <button key={r.minProfit} onClick={() => { if (unlocked) { setSelectedPatentRank(r); setPatentDialogOpen(true); } }} disabled={!unlocked}
                  className={`group relative rounded-lg border p-3 text-center transition-all ${unlocked
                    ? 'border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer hover:scale-105'
                    : 'border-border/30 bg-secondary/20 opacity-35 cursor-not-allowed'}`}>
                  <div className="text-2xl mb-1">{r.emoji}</div>
                  <p className="font-display text-[10px] font-bold leading-tight" style={unlocked ? { color: r.color } : { color: 'hsl(var(--muted-foreground))' }}>
                    {isEn ? r.nameEn : r.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">R$ {r.minProfit.toLocaleString()}</p>
                  {unlocked && <span className="text-[9px] win-text font-bold mt-1 block">✓ Story</span>}
                  {!unlocked && <span className="text-[9px] text-muted-foreground mt-1 block">🔒</span>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <PatentPreviewDialog open={patentDialogOpen} onOpenChange={setPatentDialogOpen} rank={selectedPatentRank}
        totalProfit={totalProfit} displayName={displayName} daysTrading={daysTrading} isEn={isEn} />
    </div>
  );
};

export default DashboardHome;
