import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StreakData {
  streak_atual: number;
  maior_streak: number;
  ultimo_dia_ativo: string | null;
  streak_freeze_disponivel: number;
  total_freezes: number;
}

const MILESTONES = [
  { days: 5, label: '1 tentativa bônus', icon: '🎁' },
  { days: 10, label: '+3% boost temporário', icon: '⚡' },
  { days: 20, label: 'Modo Turbo 7 dias', icon: '🚀' },
  { days: 30, label: 'Badge Elite', icon: '🏅' },
  { days: 60, label: 'Estatísticas Avançadas', icon: '📊' },
];

export function getNextMilestone(streak: number) {
  for (const m of MILESTONES) {
    if (streak < m.days) return m;
  }
  return null;
}

export function getMilestoneProgress(streak: number) {
  const next = getNextMilestone(streak);
  if (!next) return 100;
  const prev = MILESTONES.findIndex(m => m.days === next.days);
  const prevDays = prev > 0 ? MILESTONES[prev - 1].days : 0;
  return ((streak - prevDays) / (next.days - prevDays)) * 100;
}

export function getUnlockedMilestones(streak: number) {
  return MILESTONES.filter(m => streak >= m.days);
}

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [atRisk, setAtRisk] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState<number | null>(null);

  const loadStreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setStreak(data as StreakData);
      await checkAndUpdateStreak(data as StreakData);
    } else {
      // Create initial streak record and count first login
      const initial: StreakData = {
        streak_atual: 1,
        maior_streak: 1,
        ultimo_dia_ativo: new Date().toISOString().split('T')[0],
        streak_freeze_disponivel: 0,
        total_freezes: 0,
      };
      await supabase.from('streaks').insert({ user_id: user.id, ...initial });
      setStreak(initial);
    }
    setLoading(false);
  }, [user]);

  const checkAndUpdateStreak = async (data: StreakData) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const lastActive = data.ultimo_dia_ativo;

    if (lastActive === today) return; // Already active today

    if (lastActive) {
      const last = new Date(lastActive);
      const now = new Date(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - auto increment streak on login
        const newStreak = data.streak_atual + 1;
        const newMaior = Math.max(newStreak, data.maior_streak);
        const newFreezes = newStreak > 0 && newStreak % 14 === 0
          ? data.streak_freeze_disponivel + 1
          : data.streak_freeze_disponivel;
        const totalFreezes = newFreezes > data.streak_freeze_disponivel
          ? data.total_freezes + 1
          : data.total_freezes;
        const updated = {
          streak_atual: newStreak,
          maior_streak: newMaior,
          ultimo_dia_ativo: today,
          streak_freeze_disponivel: newFreezes,
          total_freezes: totalFreezes,
        };
        await supabase.from('streaks').update(updated).eq('user_id', user.id);
        setStreak(prev => prev ? { ...prev, ...updated } as StreakData : prev);
        // Check milestones
        if ([5, 10, 15, 30].includes(newStreak)) {
          setMilestoneReached(newStreak);
        }
      } else if (diffDays === 2) {
        // Missed yesterday
        if (data.streak_freeze_disponivel > 0) {
          const newStreak = data.streak_atual + 1;
          const newMaior = Math.max(newStreak, data.maior_streak);
          const updated = {
            streak_freeze_disponivel: data.streak_freeze_disponivel - 1,
            streak_atual: newStreak,
            maior_streak: newMaior,
            ultimo_dia_ativo: today,
          };
          await supabase.from('streaks').update(updated).eq('user_id', user.id);
          setStreak(prev => prev ? { ...prev, ...updated } as StreakData : prev);
          if ([5, 10, 15, 30].includes(newStreak)) {
            setMilestoneReached(newStreak);
          }
        } else {
          // Reset streak, start from 1 (today's login)
          const updated = { streak_atual: 1, ultimo_dia_ativo: today };
          await supabase.from('streaks').update(updated).eq('user_id', user.id);
          setStreak(prev => prev ? { ...prev, ...updated } as StreakData : prev);
        }
      } else if (diffDays > 2) {
        // Multiple days missed - reset, start from 1
        const updated = { streak_atual: 1, ultimo_dia_ativo: today };
        await supabase.from('streaks').update(updated).eq('user_id', user.id);
        setStreak(prev => prev ? { ...prev, ...updated } as StreakData : prev);
      }
    } else {
      // No previous activity - first login
      const updated = { streak_atual: 1, ultimo_dia_ativo: today, maior_streak: Math.max(1, data.maior_streak) };
      await supabase.from('streaks').update(updated).eq('user_id', user.id);
      setStreak(prev => prev ? { ...prev, ...updated } as StreakData : prev);
    }
  };

  const registerActivity = useCallback(async () => {
    if (!user || !streak) return;
    const today = new Date().toISOString().split('T')[0];
    if (streak.ultimo_dia_ativo === today) return; // Already registered today

    const newStreak = streak.streak_atual + 1;
    const newMaior = Math.max(newStreak, streak.maior_streak);
    // Check freeze earned (every 14 days)
    const newFreezes = newStreak > 0 && newStreak % 14 === 0
      ? streak.streak_freeze_disponivel + 1
      : streak.streak_freeze_disponivel;
    const totalFreezes = newFreezes > streak.streak_freeze_disponivel
      ? streak.total_freezes + 1
      : streak.total_freezes;

    const updated: Partial<StreakData> = {
      streak_atual: newStreak,
      maior_streak: newMaior,
      ultimo_dia_ativo: today,
      streak_freeze_disponivel: newFreezes,
      total_freezes: totalFreezes,
    };

    await supabase.from('streaks').update(updated).eq('user_id', user.id);
    setStreak(prev => prev ? { ...prev, ...updated } as StreakData : prev);
  }, [user, streak]);

  // Check risk notification (after 20:00)
  useEffect(() => {
    if (!streak) return;
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    if (hour >= 20 && streak.ultimo_dia_ativo !== today && streak.streak_atual > 0) {
      setAtRisk(true);
    }
  }, [streak]);

  useEffect(() => { loadStreak(); }, [loadStreak]);

  return { streak, loading, atRisk, milestoneReached, setMilestoneReached, registerActivity, refresh: loadStreak };
}
