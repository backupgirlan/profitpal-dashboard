import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EmotionalCheckin {
  emotional_state: string;
  had_argument: boolean;
  recovering_loss: boolean;
  slept_well: boolean;
}

export interface DiaryEntry {
  id: string;
  entry_date: string;
  emotional_state: string;
  mistakes: string;
  lessons: string;
  followed_plan: boolean;
  created_at: string;
}

export interface DisciplineStats {
  totalTrades: number;
  followedPlanCount: number;
  emotionalTrades: number;
  consecutiveLosses: number;
  disciplineScore: number;
  stopDaily: number;
  stopWeekly: number;
  forcedPauseUntil: string | null;
  dailyLoss: number;
  weeklyLoss: number;
}

const MARKET_QUOTES = [
  "O objetivo não é ganhar hoje. É ainda estar no jogo amanhã.",
  "O mercado pune pressa.",
  "Recuperar perdas imediatamente é o erro que quebra contas.",
  "Disciplina é a ponte entre metas e conquistas.",
  "Trader profissional não opera por emoção, opera por estratégia.",
  "Proteger a banca é mais importante que lucrar.",
  "O melhor trade é aquele que você não faz quando está emocional.",
  "Consistência vence talento quando talento não tem disciplina.",
  "Seu maior adversário no mercado é você mesmo.",
  "Paciência é a virtude mais lucrativa no trading.",
  "Não é sobre quantas operações você faz, mas sobre a qualidade delas.",
  "A cada loss, respire. A cada win, mantenha a humildade.",
];

export function useMentalProtection() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DisciplineStats>({
    totalTrades: 0, followedPlanCount: 0, emotionalTrades: 0,
    consecutiveLosses: 0, disciplineScore: 100,
    stopDaily: 0, stopWeekly: 0, forcedPauseUntil: null,
    dailyLoss: 0, weeklyLoss: 0,
  });
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getRandomQuote = () => MARKET_QUOTES[Math.floor(Math.random() * MARKET_QUOTES.length)];

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Parallel fetches
    const [profileRes, tradesRes, todayTradesRes, weekTradesRes, checkinRes, diaryRes] = await Promise.all([
      supabase.from('profiles').select('stop_daily, stop_weekly, discipline_score, forced_pause_until, consecutive_losses').eq('user_id', user.id).single(),
      supabase.from('trades').select('result, followed_plan, amount, profit, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(500),
      supabase.from('trades').select('profit').eq('user_id', user.id).eq('trade_date', today),
      supabase.from('trades').select('profit').eq('user_id', user.id).gte('trade_date', weekStartStr),
      supabase.from('emotional_checkins').select('*').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`).order('created_at', { ascending: false }).limit(1),
      supabase.from('trader_diary').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(30),
    ]);

    const profile = profileRes.data;
    const trades = tradesRes.data || [];
    const todayTrades = todayTradesRes.data || [];
    const weekTrades = weekTradesRes.data || [];

    const totalTrades = trades.length;
    const followedPlanCount = trades.filter(t => t.followed_plan).length;
    const emotionalTrades = trades.filter(t => !t.followed_plan).length;

    // Count consecutive losses from recent trades
    let consecutiveLosses = 0;
    for (const t of trades) {
      if (t.result === 'loss') consecutiveLosses++;
      else break;
    }

    const dailyLoss = todayTrades.reduce((sum, t) => sum + Math.min(0, Number(t.profit) || 0), 0);
    const weeklyLoss = weekTrades.reduce((sum, t) => sum + Math.min(0, Number(t.profit) || 0), 0);

    // Calculate discipline score
    let score = 100;
    if (totalTrades > 0) {
      const planRate = (followedPlanCount / totalTrades) * 100;
      score = Math.round(planRate);
    }

    setStats({
      totalTrades,
      followedPlanCount,
      emotionalTrades,
      consecutiveLosses,
      disciplineScore: score,
      stopDaily: Number(profile?.stop_daily) || 0,
      stopWeekly: Number(profile?.stop_weekly) || 0,
      forcedPauseUntil: profile?.forced_pause_until || null,
      dailyLoss: Math.abs(dailyLoss),
      weeklyLoss: Math.abs(weeklyLoss),
    });

    setTodayCheckin(checkinRes.data?.[0] || null);
    setDiaryEntries((diaryRes.data as DiaryEntry[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const submitCheckin = async (checkin: EmotionalCheckin): Promise<boolean> => {
    if (!user) return false;
    const isRisky = ['irritado', 'ansioso', 'frustrado'].includes(checkin.emotional_state) ||
      checkin.recovering_loss || checkin.had_argument;

    await supabase.from('emotional_checkins').insert({
      user_id: user.id,
      emotional_state: checkin.emotional_state,
      had_argument: checkin.had_argument,
      recovering_loss: checkin.recovering_loss,
      slept_well: checkin.slept_well,
      is_risky: isRisky,
      proceeded: false,
    });

    setTodayCheckin({ ...checkin, is_risky: isRisky });
    return isRisky;
  };

  const saveDiaryEntry = async (entry: { emotional_state: string; mistakes: string; lessons: string }) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    // Check if entry exists for today
    const existing = diaryEntries.find(e => e.entry_date === today);
    if (existing) {
      await supabase.from('trader_diary').update({
        emotional_state: entry.emotional_state,
        mistakes: entry.mistakes,
        lessons: entry.lessons,
      }).eq('id', existing.id);
    } else {
      await supabase.from('trader_diary').insert({
        user_id: user.id,
        entry_date: today,
        ...entry,
      });
    }
    await loadData();
  };

  const updateStops = async (daily: number, weekly: number) => {
    if (!user) return;
    await supabase.from('profiles').update({
      stop_daily: daily,
      stop_weekly: weekly,
    }).eq('user_id', user.id);
    setStats(prev => ({ ...prev, stopDaily: daily, stopWeekly: weekly }));
  };

  const activateForcedPause = async (minutes: number) => {
    if (!user) return;
    const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await supabase.from('profiles').update({ forced_pause_until: until }).eq('user_id', user.id);
    setStats(prev => ({ ...prev, forcedPauseUntil: until }));
  };

  const isStopReached = (): { reached: boolean; type: string } => {
    if (stats.stopDaily > 0 && stats.dailyLoss >= stats.stopDaily) {
      return { reached: true, type: 'diário' };
    }
    if (stats.stopWeekly > 0 && stats.weeklyLoss >= stats.stopWeekly) {
      return { reached: true, type: 'semanal' };
    }
    return { reached: false, type: '' };
  };

  const isPaused = (): boolean => {
    if (!stats.forcedPauseUntil) return false;
    return new Date(stats.forcedPauseUntil) > new Date();
  };

  const getPauseTimeRemaining = (): string => {
    if (!stats.forcedPauseUntil) return '';
    const remaining = new Date(stats.forcedPauseUntil).getTime() - Date.now();
    if (remaining <= 0) return '';
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return `${hours}h ${minutes}min`;
  };

  const detectImpulse = (currentAmount: number, lastAmount: number, tradesInLastHour: number): string[] => {
    const alerts: string[] = [];
    if (lastAmount > 0 && currentAmount > lastAmount * 1.3 && stats.consecutiveLosses > 0) {
      alerts.push('Aumento de valor após perda detectado');
    }
    if (tradesInLastHour >= 5) {
      alerts.push('Muitas operações em curto período');
    }
    const hour = new Date().getHours();
    if (hour < 7 || hour > 22) {
      alerts.push('Operação fora do horário habitual');
    }
    return alerts;
  };

  const getDisciplinePatents = () => {
    const daysSinceFirstTrade = stats.totalTrades > 0 ? Math.ceil(
      (Date.now() - new Date(diaryEntries[diaryEntries.length - 1]?.created_at || Date.now()).getTime()) / 86400000
    ) : 0;

    return [
      { id: 'disciplined', emoji: '🥉', name: 'Trader Disciplinado', desc: 'Respeitou o gerenciamento por 7 dias', unlocked: daysSinceFirstTrade >= 7 && stats.disciplineScore >= 80 },
      { id: 'consistent', emoji: '🥈', name: 'Mestre da Consistência', desc: '30 dias sem quebrar o stop', unlocked: daysSinceFirstTrade >= 30 && stats.disciplineScore >= 90 },
      { id: 'guardian', emoji: '🥇', name: 'Guardião da Banca', desc: 'Nenhuma operação emocional em 60 dias', unlocked: daysSinceFirstTrade >= 60 && stats.emotionalTrades === 0 },
    ];
  };

  return {
    stats, loading, todayCheckin, diaryEntries,
    submitCheckin, saveDiaryEntry, updateStops, activateForcedPause,
    isStopReached, isPaused, getPauseTimeRemaining, detectImpulse,
    getDisciplinePatents, getRandomQuote, loadData,
  };
}
