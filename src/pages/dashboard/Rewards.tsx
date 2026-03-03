import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Gift, CheckCircle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Rewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [streak, setStreak] = useState(0);
  const [todayClaimed, setTodayClaimed] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    supabase.from('daily_rewards').select('*').eq('user_id', user.id).eq('reward_date', today)
      .then(({ data }) => { if (data && data.length > 0) setTodayClaimed(true); });
    supabase.from('daily_rewards').select('*').eq('user_id', user.id).order('reward_date', { ascending: false }).limit(7)
      .then(({ data }) => { if (data) setRewards(data); });
    supabase.from('profiles').select('streak_days').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setStreak(data.streak_days || 0); });
  }, [user]);

  const claimReward = async () => {
    if (!user || todayClaimed) return;
    const { error } = await supabase.from('daily_rewards').insert({ user_id: user.id, reward_date: today, reward_type: 'login', claimed: true });
    if (error) { toast({ title: t('common.error'), description: error.message, variant: 'destructive' }); return; }
    setTodayClaimed(true);
    const newStreak = streak + 1;
    setStreak(newStreak);
    await supabase.from('profiles').update({ streak_days: newStreak, last_login_date: today }).eq('user_id', user.id);
    toast({ title: t('rewards.claimed'), description: t('rewards.sequence', { count: newStreak }) });
  };

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <Gift className="w-6 h-6" /> {t('rewards.title')}
        </h1>
        <p className="text-muted-foreground">{t('rewards.subtitle')}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-6 text-center box-glow">
        <div className="text-5xl font-display font-bold text-primary text-glow-strong mb-2">{streak}</div>
        <p className="text-muted-foreground">{t('rewards.consecutiveDays')}</p>
        <Button onClick={claimReward} disabled={todayClaimed} className="mt-6 gradient-gold text-primary-foreground font-display gap-2" size="lg">
          {todayClaimed ? (<><CheckCircle className="w-4 h-4" /> {t('rewards.alreadyClaimed')}</>) : (<><Gift className="w-4 h-4" /> {t('rewards.claimReward')}</>)}
        </Button>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> {t('rewards.last7Days')}
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const claimed = rewards.some(r => r.reward_date === day);
            const isToday = day === today;
            return (
              <div key={day} className={`rounded-lg p-3 text-center text-xs ${claimed ? 'bg-primary/20 border border-primary/30' : isToday ? 'bg-secondary border border-primary/20' : 'bg-secondary border border-border'}`}>
                <p className="text-muted-foreground">{new Date(day + 'T12:00').toLocaleDateString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short' })}</p>
                <p className={`mt-1 ${claimed ? 'text-primary' : 'text-muted-foreground'}`}>{claimed ? '🎁' : '○'}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
