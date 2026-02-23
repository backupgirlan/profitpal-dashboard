import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useStreak } from '@/hooks/useStreak';
import { useToast } from '@/hooks/use-toast';
import ManagementDashboard from '@/components/management/ManagementDashboard';

interface TradeEvent {
  resultado: 'win' | 'loss';
  pairName: string;
  payout: number;
  mode: string;
}

const Management = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const { user } = useAuth();
  const { registerActivity } = useStreak();
  const { toast } = useToast();

  const handleTradeConfirmed = useCallback(async (e: Event) => {
    const detail = (e as CustomEvent<TradeEvent>).detail;
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const amount = 0; // Amount comes from engine state, tracked locally
    const profit = detail.resultado === 'win'
      ? amount * (detail.payout / 100)
      : -amount;

    // Save trade to database for ranking/history
    await supabase.from('trades').insert({
      user_id: user.id,
      pair_name: detail.pairName,
      payout: detail.payout,
      result: detail.resultado,
      amount: 0,
      profit: 0,
      management_mode: detail.mode,
      entry_type: 'normal',
      soros_level: 0,
      trade_date: today,
    });

    // Update profile management mode
    await supabase.from('profiles').update({
      active_management_mode: detail.mode,
    }).eq('user_id', user.id);

    // Register streak activity
    await registerActivity();

    toast({
      title: detail.resultado === 'win' ? '✅ Win registrado!' : '❌ Loss registrado!',
      description: `${detail.pairName} — ${detail.payout}%`,
    });
  }, [user, registerActivity, toast]);

  useEffect(() => {
    window.addEventListener('trade-confirmed', handleTradeConfirmed);
    return () => window.removeEventListener('trade-confirmed', handleTradeConfirmed);
  }, [handleTradeConfirmed]);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <ManagementDashboard fullscreen onToggleFullscreen={() => setFullscreen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagementDashboard onToggleFullscreen={() => setFullscreen(true)} />
    </div>
  );
};

export default Management;
