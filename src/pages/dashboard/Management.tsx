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
  amount: number;
  profit: number;
  sorosLevel: number;
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

    // Save trade to database for ranking/history
    await supabase.from('trades').insert({
      user_id: user.id,
      pair_name: detail.pairName,
      payout: detail.payout,
      result: detail.resultado,
      amount: detail.amount,
      profit: detail.profit,
      management_mode: detail.mode,
      entry_type: 'normal',
      soros_level: detail.sorosLevel || 0,
      trade_date: today,
    });

    // Update profile balance and total_profit
    const { data: profile } = await supabase.from('profiles').select('balance, total_profit').eq('user_id', user.id).single();
    if (profile) {
      const newBalance = +(Number(profile.balance) + detail.profit).toFixed(2);
      const newTotalProfit = +(Number(profile.total_profit) + detail.profit).toFixed(2);
      await supabase.from('profiles').update({
        balance: newBalance,
        total_profit: newTotalProfit,
        active_management_mode: detail.mode,
      }).eq('user_id', user.id);

      // Dispatch balance-updated AFTER DB write completes for instant sync
      window.dispatchEvent(new CustomEvent('balance-updated', {
        detail: { balance: newBalance, totalProfit: newTotalProfit }
      }));
    }

    // Register streak activity
    await registerActivity();

    toast({
      title: detail.resultado === 'win' ? '✅ Win registrado!' : '❌ Loss registrado!',
      description: `${detail.pairName} — ${detail.payout}% | Lucro: R$ ${detail.profit.toFixed(2)}`,
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
