import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_PAIRS } from '@/lib/defaultPairs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Wallet, TrendingUp, CheckCircle, XCircle, Shield, ChevronRight, PiggyBank,
  Pencil, X, Target, ClipboardList, Activity, Calendar, Quote,
  ArrowUpRight, ArrowDownRight, BarChart3, Zap, AlertTriangle, TrendingDown,
  Trash2, RotateCcw
} from 'lucide-react';
import { getRankForProfit, getNextRankForProfit, TRADER_RANKS, TraderRank } from '@/lib/traderRanks';
import PatentPreviewDialog from '@/components/PatentPreviewDialog';
import RankAchievementModal from '@/components/RankAchievementModal';
import { useManagement2x } from '@/hooks/useManagement2x';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line, ReferenceArea } from 'recharts';
import BehaviorRadar from '@/components/horus/BehaviorRadar';
import EmotionalRiskMap from '@/components/horus/EmotionalRiskMap';
import BankSimulator from '@/components/horus/BankSimulator';

const MOTIVATIONAL_QUOTES = [
  "A maioria quebra após o segundo loss. A Horus IA observa isso.",
  "O mercado mostra o preço. A Horus IA mostra seu comportamento.",
  "Disciplina não é entrar bem. É saber parar.",
  "A Horus IA observa padrões que você não percebe.",
  "Preservar o dia é mais inteligente do que tentar salvá-lo no impulso.",
  "Consistência supera intensidade.",
  "O mercado sempre estará aqui amanhã.",
];

const CHART_COLORS = {
  gold: 'hsl(48, 96%, 53%)',
  green: 'hsl(142, 71%, 45%)',
  red: 'hsl(0, 84%, 60%)',
  muted: 'hsl(218, 11%, 65%)',
  cardBg: 'hsl(222, 47%, 11%)',
  border: 'hsl(217, 33%, 17%)',
};

const DashboardHome = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEn = i18n.language === 'en';
  const mgmt = useManagement2x();

  const [balance, setBalance] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [displayName, setDisplayName] = useState('Trader');
  const [daysTrading, setDaysTrading] = useState(0);
  const [evolutionData, setEvolutionData] = useState<{ day: string; balance: number }[]>([]);
  const [candleData, setCandleData] = useState<{ day: string; open: number; close: number; high: number; low: number }[]>([]);
  const [consistencyData, setConsistencyData] = useState<{ day: string; profit: number }[]>([]);

  const [pair, setPair] = useState('');
  const [payout, setPayout] = useState('80');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedPairs, setSavedPairs] = useState<string[]>([]);
  const [showPairSuggestions, setShowPairSuggestions] = useState(false);
  const [editingPairIndex, setEditingPairIndex] = useState<number | null>(null);
  const [editingPairValue, setEditingPairValue] = useState('');

  const [showDepositInput, setShowDepositInput] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [editBalanceMode, setEditBalanceMode] = useState(false);
  const [editBalanceValue, setEditBalanceValue] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [patentDialogOpen, setPatentDialogOpen] = useState(false);
  const [selectedPatentRank, setSelectedPatentRank] = useState(TRADER_RANKS[0]);

  const [achievementOpen, setAchievementOpen] = useState(false);
  const [achievedRank, setAchievedRank] = useState<TraderRank | null>(null);
  const lastRankRef = useRef<string>('');
  const hasInitialized = useRef(false);

  const [emotionalState, setEmotionalState] = useState<string | null>(null);
  const [showEmotionalModal, setShowEmotionalModal] = useState(false);
  const [emotionalDismissed, setEmotionalDismissed] = useState(false);

  const [todayProfit, setTodayProfit] = useState(0);
  const [weekProfit, setWeekProfit] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [lossStreak, setLossStreak] = useState(0);
  const [maxDrawdown, setMaxDrawdown] = useState(0);
  const [positiveDays, setPositiveDays] = useState(0);
  const [negativeDays, setNegativeDays] = useState(0);
  const [disciplineRate, setDisciplineRate] = useState(100);


  const quoteIndex = useMemo(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length), []);

  useEffect(() => {
    const todayKey = `emotional_checkin_${new Date().toISOString().split('T')[0]}`;
    const alreadyDone = localStorage.getItem(todayKey);
    if (!alreadyDone) {
      const timer = setTimeout(() => setShowEmotionalModal(true), 800);
      return () => clearTimeout(timer);
    } else {
      setEmotionalState(alreadyDone);
      setEmotionalDismissed(true);
    }
  }, []);

  const handleEmotionalSelect = (key: string) => {
    setEmotionalState(key);
    const todayKey = `emotional_checkin_${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(todayKey, key);
  };

  const handleEmotionalConfirm = () => {
    setEmotionalDismissed(true);
    setShowEmotionalModal(false);
    if (user && emotionalState) {
      const safe = emotionalOptions.find(o => o.key === emotionalState)?.safe ?? true;
      supabase.from('emotional_checkins').insert({
        user_id: user.id, emotional_state: emotionalState, is_risky: !safe, proceeded: true,
      });
    }
  };

  const loadData = useCallback(async (checkRankUp = false) => {
    if (!user) return;
    const [profileRes, tradesRes] = await Promise.all([
      supabase.from('profiles').select('balance, total_profit, display_name, created_at, discipline_score, is_vip, is_super_vip, consecutive_losses').eq('user_id', user.id).single(),
      supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    ]);
    if (profileRes.data) {
      const newProfit = Number(profileRes.data.total_profit) || 0;
      setBalance(Number(profileRes.data.balance) || 0);
      setTotalProfit(newProfit);
      setDisplayName(profileRes.data.display_name || 'Trader');
      setDisciplineRate(Number(profileRes.data.discipline_score) || 100);
      if (profileRes.data.created_at) {
        const created = new Date(profileRes.data.created_at);
        setDaysTrading(Math.max(1, Math.floor((Date.now() - created.getTime()) / 86400000)));
      }
      if (checkRankUp && hasInitialized.current) {
        const newRank = getRankForProfit(newProfit);
        if (lastRankRef.current && newRank.name !== lastRankRef.current) {
          const oldRankObj = TRADER_RANKS.find(r => r.name === lastRankRef.current);
          if (!oldRankObj || newRank.minProfit > oldRankObj.minProfit) {
            setAchievedRank(newRank);
            setAchievementOpen(true);
            toast.success(`🏆 Parabéns! Você conquistou a patente ${newRank.emoji} ${newRank.name}!`, { duration: 6000 });
          }
        }
        lastRankRef.current = newRank.name;
      }
    }
    if (tradesRes.data) {
      let w = 0, l = 0, todayP = 0, weekP = 0, monthP = 0;
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      let currentWinStreak = 0, currentLossStreak = 0;
      let cumBalance = 0, peak = 0, mdd = 0;
      const evoMap: Record<string, number> = {};
      const dailyProfitMap: Record<string, number> = {};
      // For candles: each candle = R$30 movement, one per trade
      const candleList: { day: string; open: number; close: number; high: number; low: number; result: string }[] = [];
      let candleLevel = 0; // starts at 0, moves in R$30 steps

      tradesRes.data.forEach(trade => {
        const profit = Number(trade.profit);
        if (trade.result === 'win') w++; else l++;
        const tradeDate = trade.trade_date || today;
        if (tradeDate >= today) todayP += profit;
        if (tradeDate >= weekAgo) weekP += profit;
        if (tradeDate >= monthAgo) monthP += profit;
        cumBalance += profit;
        if (cumBalance > peak) peak = cumBalance;
        const dd = peak - cumBalance;
        if (dd > mdd) mdd = dd;
        evoMap[tradeDate] = cumBalance;
        dailyProfitMap[tradeDate] = (dailyProfitMap[tradeDate] || 0) + profit;

        // Each candle = R$30. Profit of R$60 = 2 green candles, R$90 = 3, etc.
        const CANDLE_VALUE = 30;
        const numCandles = Math.max(1, Math.round(Math.abs(profit) / CANDLE_VALUE));
        const direction = profit >= 0 ? 1 : -1;
        const color = profit >= 0 ? 'win' : 'loss';
        for (let ci = 0; ci < numCandles; ci++) {
          const openVal = candleLevel;
          const closeVal = candleLevel + direction * CANDLE_VALUE;
          const wickExtend = Math.random() * 10 + 3;
          candleList.push({
            day: (tradeDate || '').slice(5),
            open: openVal,
            close: closeVal,
            high: Math.max(openVal, closeVal) + wickExtend,
            low: Math.min(openVal, closeVal) - wickExtend,
            result: color,
          });
          candleLevel = closeVal;
        }
      });
      for (let i = tradesRes.data.length - 1; i >= 0; i--) {
        if (tradesRes.data[i].result === 'win') { if (currentLossStreak > 0) break; currentWinStreak++; }
        else { if (currentWinStreak > 0) break; currentLossStreak++; }
      }
      let posDays = 0, negDays = 0;
      Object.values(dailyProfitMap).forEach(p => { if (p > 0) posDays++; else if (p < 0) negDays++; });
      setWins(w); setLosses(l);
      setTodayProfit(todayP); setWeekProfit(weekP); setMonthProfit(monthP);
      setWinStreak(currentWinStreak); setLossStreak(currentLossStreak);
      setMaxDrawdown(mdd); setPositiveDays(posDays); setNegativeDays(negDays);
      const evoEntries = Object.entries(evoMap).sort((a, b) => a[0].localeCompare(b[0]));
      setEvolutionData(evoEntries.map(([day, balance]) => ({ day: day.slice(5), balance })));
      const consistencyEntries = Object.entries(dailyProfitMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
      setConsistencyData(consistencyEntries.map(([day, profit]) => ({ day: day.slice(5), profit: +profit.toFixed(2) })));

      // Use last 30 candles max
      setCandleData(candleList.slice(-30));
    }

  }, [user]);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      loadData(false).then(() => {
        hasInitialized.current = true;
        supabase.from('profiles').select('total_profit').eq('user_id', user.id).single().then(({ data }) => {
          if (data) lastRankRef.current = getRankForProfit(Number(data.total_profit) || 0).name;
        });
      });
    }
  }, [user, loadData]);

  useEffect(() => { if (hasInitialized.current) loadData(false); }, [loadData]);

  useEffect(() => {
    if (!user) return;
    supabase.from('trades').select('pair_name').eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const userPairs = [...new Set(data.map(d => d.pair_name))];
          setSavedPairs([...new Set([...DEFAULT_PAIRS, ...userPairs])].sort());
        }
      });
  }, [user]);

  const filteredPairs = pair.length > 0 ? savedPairs.filter(p => p.toLowerCase().includes(pair.toLowerCase())) : [];

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

  const handleDeposit = async () => {
    const val = Number(depositAmount);
    if (!val || val <= 0 || !user) return;
    setDepositing(true);
    const newBalance = +(balance + val).toFixed(2);
    await Promise.all([
      supabase.from('deposits').insert({ user_id: user.id, amount: val }),
      supabase.from('profiles').update({ balance: newBalance }).eq('user_id', user.id),
    ]);
    setBalance(newBalance); setDepositAmount(''); setShowDepositInput(false);
    toast.success(`💰 Depósito de R$ ${val.toFixed(2)} realizado!`);
    window.dispatchEvent(new Event('balance-updated'));
    setDepositing(false);
  };

  const handleEditBalance = async () => {
    const val = Number(editBalanceValue);
    if (isNaN(val) || val < 0 || !user) return;
    const newBalance = +val.toFixed(2);
    await supabase.from('profiles').update({ balance: newBalance }).eq('user_id', user.id);
    setBalance(newBalance); setEditBalanceMode(false); setEditBalanceValue(''); setShowDepositInput(false);
    toast.success('✅ Banca atualizada!');
    window.dispatchEvent(new Event('balance-updated'));
  };

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
      toast.success('🔄 Conta resetada com sucesso!');
      setShowResetConfirm(false); setShowDepositInput(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) { toast.error(err.message); }
    finally { setResetLoading(false); }
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
    if (tradeRes.error || profileRes.error) { toast.error(t('common.error')); }
    else {
      setBalance(newBalance); setTotalProfit(newTotalProfit);
      if (result === 'win') setWins(w => w + 1); else setLosses(l => l + 1);
      toast.success(result === 'win' ? `✅ WIN +R$ ${(amtNum * payNum).toFixed(2)}` : `❌ LOSS -R$ ${amtNum.toFixed(2)}`);
      if (!savedPairs.includes(pair.trim().toUpperCase())) setSavedPairs(prev => [...prev, pair.trim().toUpperCase()].sort());
      setPair(''); setAmount('');
      window.dispatchEvent(new Event('balance-updated'));
      loadData(true);
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

  const consistencyLevel = disciplineRate >= 90 ? 'Trader Consistente' : disciplineRate >= 70 ? 'Consistência Alta' : disciplineRate >= 50 ? 'Consistência Média' : 'Consistência Baixa';
  const consistencyColor = disciplineRate >= 90 ? 'text-success' : disciplineRate >= 70 ? 'text-primary' : disciplineRate >= 50 ? 'text-primary' : 'text-destructive';

  const pieData = [
    { name: 'WIN', value: wins, color: CHART_COLORS.green },
    { name: 'LOSS', value: losses, color: CHART_COLORS.red },
  ];

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2)}`;

  const emotionalEmoji = emotionalState ? emotionalOptions.find(o => o.key === emotionalState)?.label.split(' ')[0] || '😊' : '😊';
  const isEmotionalRisky = emotionalState ? !emotionalOptions.find(o => o.key === emotionalState)?.safe : false;

  const riskLevel = isEmotionalRisky ? 'Médio' : 'Baixo';
  const riskColor = riskLevel === 'Médio' ? 'text-primary' : 'text-success';
  const stateLabel = isEmotionalRisky ? 'Atenção' : 'Estável';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ═══════ Emotional Check-in Modal ═══════ */}
      <Dialog open={showEmotionalModal} onOpenChange={(open) => { if (!open && emotionalState) handleEmotionalConfirm(); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-foreground text-center">Como foi seu dia hoje?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground text-center mb-4">Antes de operar, precisamos entender como você está se sentindo. Isso nos ajuda a proteger sua banca.</p>
          <div className="grid grid-cols-2 gap-3">
            {emotionalOptions.map(opt => (
              <button key={opt.key} onClick={() => handleEmotionalSelect(opt.key)}
                className={`px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 border flex flex-col items-center gap-2 ${
                  emotionalState === opt.key
                    ? opt.safe ? 'border-success/50 bg-success/10 text-success scale-105' : 'border-destructive/50 bg-destructive/10 text-destructive scale-105'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary hover:scale-[1.02]'
                }`}>
                <span className="text-2xl">{opt.label.split(' ')[0]}</span>
                <span>{opt.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
          {emotionalState && !emotionalOptions.find(o => o.key === emotionalState)?.safe && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-4 rounded-xl bg-destructive/10 border border-destructive/25 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-destructive">ATENÇÃO</p>
                <p className="text-xs text-muted-foreground mt-1">Operar com emocional alterado aumenta drasticamente o risco. Considere pausar e voltar mais tarde.</p>
              </div>
            </motion.div>
          )}
          <Button onClick={handleEmotionalConfirm} disabled={!emotionalState} className="w-full mt-2 gradient-gold text-primary-foreground font-semibold h-11">
            Continuar para o Dashboard
          </Button>
        </DialogContent>
      </Dialog>

      {/* Motivational Quote */}
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-primary/5 border border-primary/10">
        <Quote className="w-4 h-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground italic">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</p>
      </motion.div>

      {/* Management Summary */}
      {mgmtActive && (
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
          <CardContent className="p-5">
            <h3 className="font-display text-xs font-bold text-primary mb-3 flex items-center gap-2 uppercase tracking-wider">
              <ClipboardList className="w-4 h-4" /> Gerenciamento em Andamento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Modelo</p><p className="font-bold text-foreground">{mgmtState.model?.toUpperCase()}</p></div>
              <div><p className="text-muted-foreground text-xs">Banca</p><p className="font-bold text-foreground">R$ {mgmtState.banca.toFixed(2)}</p></div>
              <div><p className="text-muted-foreground text-xs">Entrada</p><p className="font-bold text-primary">R$ {mgmtState.entradaRecomendada.toFixed(2)}</p></div>
              <div><p className="text-muted-foreground text-xs">Placar</p><p className="font-bold"><span className="win-text">{mgmtState.cicloWins}W</span> / <span className="loss-text">{mgmtState.cicloLosses}L</span></p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════ BANCA ATUAL ═══════ */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className="border-primary/20 bg-card box-glow-strong relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Banca Atual</span>
              <div className="flex items-center gap-3">
                <span className={`text-lg ${isEmotionalRisky ? 'animate-pulse-loss' : ''}`} title={emotionalState || 'Humor'}>{emotionalEmoji}</span>
                <Wallet className="w-5 h-5 text-primary" />
                <button onClick={() => setShowDepositInput(!showDepositInput)} className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors" title="Depositar na banca">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mt-2">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-2 mt-3">
              {totalProfit >= 0 ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />}
              <span className={`text-sm font-semibold ${totalProfit >= 0 ? 'win-text' : 'loss-text'}`}>{totalProfit >= 0 ? '+' : ''}R$ {totalProfit.toFixed(2)} total</span>
            </div>
            <AnimatePresence>
              {showDepositInput && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {editBalanceMode ? (
                      <div className="flex gap-3">
                        <Input type="number" value={editBalanceValue} onChange={e => setEditBalanceValue(e.target.value)} placeholder="Novo valor da banca" className="bg-secondary/50 h-11 text-base flex-1" autoFocus />
                        <Button disabled={!editBalanceValue && editBalanceValue !== '0'} className="gradient-gold text-primary-foreground shrink-0 h-11 px-6 font-semibold" onClick={handleEditBalance}>Salvar</Button>
                        <Button variant="ghost" className="h-11 px-3" onClick={() => { setEditBalanceMode(false); setEditBalanceValue(''); }}><X className="w-4 h-4" /></Button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="Valor do depósito" className="bg-secondary/50 h-11 text-base flex-1" autoFocus />
                        <Button disabled={!depositAmount || depositing} className="gradient-gold text-primary-foreground shrink-0 h-11 px-6 font-semibold" onClick={handleDeposit}>
                          <PiggyBank className="w-4 h-4 mr-2" /> Depositar
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {!editBalanceMode && (
                        <Button variant="outline" className="flex-1 h-9 text-xs gap-2 border-primary/20 hover:bg-primary/10 text-primary" onClick={() => { setEditBalanceMode(true); setEditBalanceValue(String(balance)); }}>
                          <Pencil className="w-3.5 h-3.5" /> Editar Banca
                        </Button>
                      )}
                      {!showResetConfirm ? (
                        <Button variant="outline" className="flex-1 h-9 text-xs gap-2 border-destructive/20 hover:bg-destructive/10 text-destructive" onClick={() => setShowResetConfirm(true)}>
                          <RotateCcw className="w-3.5 h-3.5" /> Resetar Dados
                        </Button>
                      ) : (
                        <div className="flex-1 flex gap-2">
                          <Button variant="destructive" className="flex-1 h-9 text-xs gap-2" onClick={handleResetAccount} disabled={resetLoading}>
                            <Trash2 className="w-3.5 h-3.5" /> {resetLoading ? 'Resetando...' : 'Confirmar Reset'}
                          </Button>
                          <Button variant="ghost" className="h-9 px-3 text-xs" onClick={() => setShowResetConfirm(false)}>Cancelar</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════ Stat Cards Grid ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Lucro do Dia', value: formatCurrency(todayProfit), positive: todayProfit >= 0 },
          { icon: Calendar, label: 'Lucro da Semana', value: formatCurrency(weekProfit), positive: weekProfit >= 0 },
          { icon: BarChart3, label: 'Lucro do Mês', value: formatCurrency(monthProfit), positive: monthProfit >= 0 },
          { icon: TrendingDown, label: 'Máx. Drawdown', value: formatCurrency(maxDrawdown), positive: false, alwaysRed: true },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border bg-card hover:border-primary/15 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${(s as any).alwaysRed ? 'bg-destructive/10 text-destructive' : s.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${(s as any).alwaysRed ? 'loss-text' : s.positive ? 'win-text' : 'loss-text'}`}>{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ═══════ Win Rate + Streaks + Meta ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card"><CardContent className="p-5 text-center"><p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Win Rate</p><p className="text-3xl font-bold text-primary">{winRate}%</p><p className="text-xs text-muted-foreground mt-1">{totalTrades} operações</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-5 text-center"><div className="flex items-center justify-center gap-1.5 mb-2"><ArrowUpRight className="w-3.5 h-3.5 text-success" /><p className="text-xs text-muted-foreground uppercase tracking-wider">Sequência Wins</p></div><p className="text-3xl font-bold win-text">{winStreak}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-5 text-center"><div className="flex items-center justify-center gap-1.5 mb-2"><ArrowDownRight className="w-3.5 h-3.5 text-destructive" /><p className="text-xs text-muted-foreground uppercase tracking-wider">Sequência Losses</p></div><p className="text-3xl font-bold loss-text">{lossStreak}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-5 text-center"><p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Meta Diária</p><p className="text-3xl font-bold text-primary">{todayProfit >= 0 ? '✓' : '—'}</p><p className="text-xs text-muted-foreground mt-1">{todayProfit >= 0 ? 'No alvo' : 'Abaixo'}</p></CardContent></Card>
      </div>

      {/* ═══════ REGISTRAR OPERAÇÃO ═══════ */}
      <Card className="border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <h3 className="font-display text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Registrar Operação
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="relative">
              <Label className="text-xs text-muted-foreground">{t('home.pair')}</Label>
              <Input value={pair} onChange={e => { setPair(e.target.value.toUpperCase()); setShowPairSuggestions(true); }}
                onFocus={() => setShowPairSuggestions(true)}
                onBlur={(e) => { const container = e.currentTarget.closest('.relative'); setTimeout(() => { if (container && !container.contains(document.activeElement)) setShowPairSuggestions(false); }, 200); }}
                placeholder="EUR/USD" className="bg-secondary/50 uppercase h-11" autoComplete="off" />
              {showPairSuggestions && filteredPairs.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                  {filteredPairs.map((p, idx) => (
                    <div key={p} className="flex items-center hover:bg-secondary transition-colors">
                      {editingPairIndex === idx ? (
                        <div className="flex items-center gap-1 w-full px-2 py-1" onClick={e => e.stopPropagation()}>
                          <Input autoFocus value={editingPairValue} onChange={e => setEditingPairValue(e.target.value.toUpperCase())}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditPair(p, editingPairValue); if (e.key === 'Escape') setEditingPairIndex(null); }}
                            className="h-7 text-xs bg-secondary uppercase" onBlur={e => e.stopPropagation()} />
                          <button type="button" onMouseDown={e => { e.preventDefault(); handleEditPair(p, editingPairValue); }} className="text-primary"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button type="button" onMouseDown={e => { e.preventDefault(); setEditingPairIndex(null); }} className="text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <>
                          <button type="button" className="flex-1 text-left px-3 py-2 text-sm text-foreground" onMouseDown={() => { setPair(p); setShowPairSuggestions(false); }}>{p}</button>
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
              <Label className="text-xs text-muted-foreground">Payout (%)</Label>
              <Input type="number" value={payout} onChange={e => setPayout(e.target.value)} placeholder="80" className="bg-secondary/50 h-11" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t('home.entryValue')}</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10.00" className="bg-secondary/50 h-11" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => handleTrade('win')} disabled={!pair.trim() || !amount || submitting}
              className="flex-1 font-bold gap-2 h-12 text-base bg-success/15 text-success hover:bg-success/25 border border-success/20 transition-all duration-200 hover:scale-[1.02]">
              <CheckCircle className="w-5 h-5" /> WIN
            </Button>
            <Button onClick={() => handleTrade('loss')} disabled={!pair.trim() || !amount || submitting}
              className="flex-1 font-bold gap-2 h-12 text-base bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20 transition-all duration-200 hover:scale-[1.02]">
              <XCircle className="w-5 h-5" /> LOSS
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* ═══════ Charts Row ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-primary" /> Evolução da Banca
              </h3>
              <span className="text-[10px] text-muted-foreground">Cada candle = R$30 • 1 operação</span>
            </div>
            <div className="h-64 overflow-x-auto">
              {candleData.length > 0 ? (
                (() => {
                  const allVals = candleData.flatMap(d => [d.open, d.close]);
                  const minVal = Math.floor(Math.min(...allVals) / 30) * 30 - 30;
                  const maxVal = Math.ceil(Math.max(...allVals) / 30) * 30 + 60;
                  const range = maxVal - minVal || 60;
                  const paddingLeft = 50;
                  const paddingTop = 10;
                  const paddingBottom = 20;
                  const candleWidth = 16;
                  const candleGap = 6;
                  const chartWidth = Math.max(candleData.length * (candleWidth + candleGap) + paddingLeft + 20, 300);
                  const chartHeight = 240;
                  const plotHeight = chartHeight - paddingTop - paddingBottom;
                  const priceToY = (price: number) => paddingTop + plotHeight - ((price - minVal) / range) * plotHeight;

                  // Grid lines every R$30
                  const gridLines: number[] = [];
                  for (let v = minVal; v <= maxVal; v += 30) gridLines.push(v);

                  return (
                    <svg width={chartWidth} height={chartHeight} className="min-w-full">
                      {/* Grid lines */}
                      {gridLines.map((val, i) => (
                        <g key={i}>
                          <line x1={paddingLeft} y1={priceToY(val)} x2={chartWidth - 5} y2={priceToY(val)} stroke="hsl(var(--border))" strokeOpacity={0.3} strokeDasharray="4 4" />
                          <text x={4} y={priceToY(val) + 3} fill="hsl(var(--muted-foreground))" fontSize={9} fontFamily="monospace">R${val}</text>
                        </g>
                      ))}
                      {/* Zero line */}
                      {minVal <= 0 && maxVal >= 0 && (
                        <line x1={paddingLeft} y1={priceToY(0)} x2={chartWidth - 5} y2={priceToY(0)} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} strokeWidth={1} />
                      )}
                      {/* Candles */}
                      {candleData.map((c, i) => {
                        const x = paddingLeft + i * (candleWidth + candleGap);
                        const bullish = c.close >= c.open;
                        const yOpen = priceToY(c.open);
                        const yClose = priceToY(c.close);
                        const bodyTop = Math.min(yOpen, yClose);
                        const bodyHeight = Math.max(Math.abs(yOpen - yClose), 3);
                        const cx = x + candleWidth / 2;
                        const wickTop = priceToY(c.high);
                        const wickBottom = priceToY(c.low);
                        const fillColor = bullish ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)';
                        const wickColor = bullish ? 'hsl(142, 71%, 55%)' : 'hsl(0, 84%, 70%)';

                        return (
                          <g key={i}>
                            {/* Upper wick */}
                            <line x1={cx} y1={wickTop} x2={cx} y2={bodyTop} stroke={wickColor} strokeWidth={1.5} />
                            {/* Lower wick */}
                            <line x1={cx} y1={bodyTop + bodyHeight} x2={cx} y2={wickBottom} stroke={wickColor} strokeWidth={1.5} />
                            {/* Body */}
                            <rect x={x} y={bodyTop} width={candleWidth} height={bodyHeight} fill={fillColor} rx={1.5} />
                            {/* Subtle highlight */}
                            <rect x={x + 1} y={bodyTop + 1} width={candleWidth - 2} height={Math.max(bodyHeight - 2, 1)} fill={bullish ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.15)'} rx={1} />
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">{t('home.noTrades')}</div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} /> WIN (+R$30)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} /> LOSS (-R$30)</span>
              <span className="font-mono">Nível: R${candleData.length > 0 ? candleData[candleData.length - 1].close : 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5 sm:p-6">
            <h3 className="font-display text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Distribuição</h3>
            <div className="h-48">
              {totalTrades > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>{pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: CHART_COLORS.cardBg, border: `1px solid ${CHART_COLORS.border}`, borderRadius: '10px', fontSize: '13px' }} /></PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> WIN: {wins}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> LOSS: {losses}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════ Consistency Chart ═══════ */}
      <Card className="border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider"><Target className="w-4 h-4 text-primary" /> Consistência</h3>
            <span className={`text-xs font-bold ${consistencyColor}`}>{consistencyLevel}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div className="text-center"><p className="text-2xl font-bold win-text">{positiveDays}</p><p className="text-xs text-muted-foreground">Dias Positivos</p></div>
            <div className="text-center"><p className="text-2xl font-bold loss-text">{negativeDays}</p><p className="text-xs text-muted-foreground">Dias Negativos</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-primary">{disciplineRate}%</p><p className="text-xs text-muted-foreground">Disciplina</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-foreground">{daysTrading}</p><p className="text-xs text-muted-foreground">Dias Operando</p></div>
          </div>
          <Progress value={disciplineRate} className="h-2 mb-4" />
          <div className="h-44">
            {consistencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consistencyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: CHART_COLORS.cardBg, border: `1px solid ${CHART_COLORS.border}`, borderRadius: '10px', fontSize: '12px' }} />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>{consistencyData.map((entry, idx) => <Cell key={idx} fill={entry.profit >= 0 ? CHART_COLORS.green : CHART_COLORS.red} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados suficientes</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══════ Patent System ═══════ */}
      <Card className="border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <h3 className="font-display text-sm font-bold text-foreground mb-5 flex items-center gap-2 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-primary" /> {t('home.patent')}
          </h3>
          <div className="flex items-center gap-5 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: rank.color + '12', border: `2px solid ${rank.color}40` }}>{rank.emoji}</div>
            <div className="flex-1">
              <p className="font-bold text-lg text-foreground" style={{ color: rank.color }}>{isEn ? rank.nameEn : rank.name}</p>
              {nextRank && (
                <>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">Próxima: {isEn ? nextRank.nameEn : nextRank.name} {nextRank.emoji}<ChevronRight className="w-3 h-3" /> R$ {nextRank.minProfit.toLocaleString()}</p>
                  <Progress value={rankProgress} className="h-1.5 mt-2" />
                </>
              )}
              {!nextRank && <p className="text-xs text-primary font-bold mt-1">{t('home.maxRank')}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {TRADER_RANKS.filter(r => r.minProfit > 0).map((r) => {
              const unlocked = totalProfit >= r.minProfit;
              return (
                <button key={r.minProfit} onClick={() => { if (unlocked) { setSelectedPatentRank(r); setPatentDialogOpen(true); } }} disabled={!unlocked}
                  className={`group relative rounded-xl border p-3 text-center transition-all duration-200 ${unlocked ? 'border-primary/25 bg-primary/5 hover:bg-primary/10 cursor-pointer hover:scale-105 hover:shadow-lg' : 'border-border/30 bg-secondary/20 opacity-30 cursor-not-allowed'}`}>
                  <div className="text-2xl mb-1">{r.emoji}</div>
                  <p className="font-display text-[10px] font-bold leading-tight" style={unlocked ? { color: r.color } : { color: CHART_COLORS.muted }}>{isEn ? r.nameEn : r.name}</p>
                  <p className="text-[10px] text-muted-foreground">R$ {r.minProfit.toLocaleString()}</p>
                  {unlocked && <span className="text-[9px] win-text font-bold mt-1 block">✓ Story</span>}
                  {!unlocked && <span className="text-[9px] text-muted-foreground mt-1 block">🔒</span>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══════ Advanced Horus IA Modules ═══════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <p className="text-xs font-display font-bold text-primary uppercase tracking-widest">Módulos Avançados Horus IA</p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BehaviorRadar />
          <EmotionalRiskMap />
        </div>
        <BankSimulator />
      </div>

      <PatentPreviewDialog open={patentDialogOpen} onOpenChange={setPatentDialogOpen} rank={selectedPatentRank} totalProfit={totalProfit} displayName={displayName} daysTrading={daysTrading} isEn={isEn} />
      {achievedRank && (
        <RankAchievementModal open={achievementOpen} onClose={() => setAchievementOpen(false)} rank={achievedRank} totalProfit={totalProfit} displayName={displayName} daysTrading={daysTrading} totalTrades={wins + losses} />
      )}
    </div>
  );
};

export default DashboardHome;
