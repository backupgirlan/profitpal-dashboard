import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Target, BarChart3, UserPlus, MessageCircle, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState({ wins: 0, losses: 0, profit: 0 });

  useEffect(() => {
    if (!user) return;

    // Load profile
    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });

    // Load trades for chart
    supabase.from('trades').select('*').eq('user_id', user.id).order('trade_date', { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        const grouped: Record<string, { date: string; profit: number }> = {};
        let cumulative = 0;
        data.forEach((t) => {
          const date = t.trade_date;
          if (!grouped[date]) grouped[date] = { date, profit: 0 };
          grouped[date].profit += Number(t.profit);
        });
        const result = Object.values(grouped).map(d => {
          cumulative += d.profit;
          return { ...d, cumulative: Number(cumulative.toFixed(2)) };
        });
        setChartData(result);
      });

    // Today stats
    const today = new Date().toISOString().split('T')[0];
    supabase.from('trades').select('*').eq('user_id', user.id).eq('trade_date', today)
      .then(({ data }) => {
        if (!data) return;
        const wins = data.filter(t => t.result === 'win').length;
        const losses = data.filter(t => t.result === 'loss').length;
        const profit = data.reduce((s, t) => s + Number(t.profit), 0);
        setTodayStats({ wins, losses, profit });
      });
  }, [user]);

  const balance = Number(profile?.balance || 0);
  const totalProfit = Number(profile?.total_profit || 0);
  const entryPct = Number(profile?.entry_percentage || 2);
  const entryValue = balance * (entryPct / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow">
          Bem-vindo de volta!
        </h1>
        <p className="text-muted-foreground">Resumo da sua conta de trading</p>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="bg-card border border-border rounded-lg p-4 box-glow"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5" /> Banca
          </div>
          <p className="text-xl font-display font-bold text-primary text-glow">
            R$ {balance.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Lucro Total
          </div>
          <p className={`text-xl font-display font-bold ${totalProfit >= 0 ? 'win-text' : 'loss-text'}`}>
            R$ {totalProfit.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Target className="w-3.5 h-3.5" /> Entrada ({entryPct}%)
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            R$ {entryValue.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <BarChart3 className="w-3.5 h-3.5" /> Hoje
          </div>
          <p className="text-sm text-foreground">
            <span className="win-text font-bold">{todayStats.wins}W</span>
            {' / '}
            <span className="loss-text font-bold">{todayStats.losses}L</span>
            {' · '}
            <span className={`font-bold ${todayStats.profit >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {todayStats.profit.toFixed(2)}
            </span>
          </p>
        </motion.div>
      </div>

      {/* Evolution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Evolução do Lucro
        </h3>
        <div className="h-56">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
                <XAxis dataKey="date" stroke="hsl(0, 0%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(0, 0%, 55%)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(0, 0%, 7%)', border: '1px solid hsl(0, 0%, 16%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(45, 100%, 50%)' }}
                />
                <Line type="monotone" dataKey="cumulative" stroke="hsl(45, 100%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(45, 100%, 50%)', r: 3 }} name="Lucro Acum." />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Registre operações para ver sua evolução
            </div>
          )}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-card to-secondary border border-primary/20 rounded-lg p-6 space-y-4"
      >
        <div className="text-center space-y-2">
          <h3 className="font-display text-lg font-bold text-primary text-glow">
            Junte-se à comunidade!
          </h3>
          <p className="text-muted-foreground text-sm">
            Cadastre-se na nossa corretora parceira e acompanhe nossos conteúdos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="https://broker-qx.pro/sign-up/?lid=1711160" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full gradient-gold text-primary-foreground font-display gap-2 box-glow hover:opacity-90">
              <UserPlus className="w-5 h-5" />
              Cadastro Broker
            </Button>
          </a>
          <a href="https://t.me/girlananalyst" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 font-display gap-2">
              <MessageCircle className="w-5 h-5" />
              Telegram
            </Button>
          </a>
          <a href="https://www.youtube.com/@technicalgirlan" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 font-display gap-2">
              <Youtube className="w-5 h-5" />
              YouTube
            </Button>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
