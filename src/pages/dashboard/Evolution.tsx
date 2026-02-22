import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
        <h3 className="font-display text-sm font-bold text-foreground mb-4">Evolução — Candles</h3>
        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
                <XAxis dataKey="date" stroke="hsl(0, 0%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(0, 0%, 7%)', border: '1px solid hsl(0, 0%, 16%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(45, 100%, 50%)' }}
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toFixed(2)}`,
                    name === 'profit' ? 'Lucro do Dia' : 'Acumulado'
                  ]}
                />
                <Bar dataKey="profit" radius={[2, 2, 0, 0]} name="Lucro do Dia">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.profit >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'}
                      stroke={entry.profit >= 0 ? 'hsl(142, 76%, 46%)' : 'hsl(0, 84%, 70%)'}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="cumulative" stroke="hsl(45, 100%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(45, 100%, 50%)' }} name="Acumulado" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Registre operações para ver sua evolução
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} /> Win (Verde)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} /> Loss (Vermelho)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(45, 100%, 50%)' }} /> Acumulado
          </span>
        </div>
      </div>
    </div>
  );
};

export default Evolution;
