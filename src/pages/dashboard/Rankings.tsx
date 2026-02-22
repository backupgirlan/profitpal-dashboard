import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingUp, Award } from 'lucide-react';

const Rankings = () => {
  const [rankings, setRankings] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('profit_rankings').select('*').order('total_profit', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setRankings(data); });
  }, []);

  const getMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}º`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <Trophy className="w-6 h-6" /> Rankings
        </h1>
        <p className="text-muted-foreground">Os melhores traders da plataforma</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left p-3 text-muted-foreground">#</th>
              <th className="text-left p-3 text-muted-foreground">Trader</th>
              <th className="text-center p-3 text-muted-foreground">Wins</th>
              <th className="text-center p-3 text-muted-foreground">Losses</th>
              <th className="text-center p-3 text-muted-foreground">Taxa</th>
              <th className="text-right p-3 text-muted-foreground">Lucro</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((r, i) => {
              const rate = r.total_trades > 0 ? ((r.wins / r.total_trades) * 100).toFixed(0) : '0';
              return (
                <tr key={r.user_id} className={`border-b border-border/50 ${i < 3 ? 'bg-primary/5' : ''}`}>
                  <td className="p-3 text-lg">{getMedal(i)}</td>
                  <td className="p-3 font-medium text-foreground">{r.display_name || 'Trader'}</td>
                  <td className="p-3 text-center win-text font-bold">{r.wins}</td>
                  <td className="p-3 text-center loss-text font-bold">{r.losses}</td>
                  <td className="p-3 text-center text-primary">{rate}%</td>
                  <td className={`p-3 text-right font-bold font-display ${Number(r.total_profit) >= 0 ? 'win-text' : 'loss-text'}`}>
                    R$ {Number(r.total_profit).toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {rankings.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum dado ainda</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rankings;
