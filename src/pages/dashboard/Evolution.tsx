import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

const Evolution = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('trades').select('*').eq('user_id', user.id).order('trade_date', { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        const grouped: Record<string, { date: string; profit: number; wins: number; losses: number }> = {};
        let cumulative = 0;
        data.forEach((t) => {
          const date = t.trade_date;
          if (!grouped[date]) grouped[date] = { date, profit: 0, wins: 0, losses: 0 };
          grouped[date].profit += Number(t.profit);
          if (t.result === 'win') grouped[date].wins++;
          else grouped[date].losses++;
        });
        const result = Object.values(grouped).map(d => {
          cumulative += d.profit;
          return { ...d, cumulative: Number(cumulative.toFixed(2)), profit: Number(d.profit.toFixed(2)) };
        });
        setChartData(result);
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Evolução
        </h1>
        <p className="text-muted-foreground">Acompanhe seu progresso ao longo do tempo</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-sm font-bold text-foreground mb-4">Lucro Acumulado</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
              <XAxis dataKey="date" stroke="hsl(0, 0%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(0, 0%, 7%)', border: '1px solid hsl(0, 0%, 16%)', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(45, 100%, 50%)' }}
              />
              <Line type="monotone" dataKey="cumulative" stroke="hsl(45, 100%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(45, 100%, 50%)' }} name="Lucro Acum." />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-sm font-bold text-foreground mb-4">Lucro Diário</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
              <XAxis dataKey="date" stroke="hsl(0, 0%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(0, 0%, 7%)', border: '1px solid hsl(0, 0%, 16%)', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(45, 100%, 50%)' }}
              />
              <Bar dataKey="profit" fill="hsl(45, 100%, 50%)" radius={[4, 4, 0, 0]} name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Evolution;
