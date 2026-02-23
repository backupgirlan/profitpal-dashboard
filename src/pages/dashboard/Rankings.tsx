import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type RankingMode = 'all' | 'conservador' | 'intermediario' | 'agressivo';

const Rankings = () => {
  const [rankings, setRankings] = useState<any[]>([]);
  const [mode, setMode] = useState<RankingMode>('all');

  useEffect(() => {
    let query = supabase.from('profit_rankings').select('*').order('total_profit', { ascending: false }).limit(20);
    if (mode !== 'all') {
      query = query.eq('management_mode', mode);
    }
    query.then(({ data }) => { if (data) setRankings(data); });
  }, [mode]);

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
        <p className="text-muted-foreground">Os melhores traders por módulo de gerenciamento</p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as RankingMode)}>
        <TabsList className="grid grid-cols-4 w-full bg-secondary">
          <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
          <TabsTrigger value="conservador" className="text-xs">Conservador</TabsTrigger>
          <TabsTrigger value="intermediario" className="text-xs">Intermediário</TabsTrigger>
          <TabsTrigger value="agressivo" className="text-xs">Agressivo</TabsTrigger>
        </TabsList>

        <TabsContent value={mode}>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left p-3 text-muted-foreground">#</th>
                  <th className="text-left p-3 text-muted-foreground">Trader</th>
                  <th className="text-center p-3 text-muted-foreground">Módulo</th>
                  <th className="text-center p-3 text-muted-foreground">Wins</th>
                  <th className="text-center p-3 text-muted-foreground">Losses</th>
                  <th className="text-center p-3 text-muted-foreground">Taxa</th>
                  <th className="text-right p-3 text-muted-foreground">Lucro</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r, i) => {
                  const rate = r.total_trades > 0 ? ((r.wins / r.total_trades) * 100).toFixed(0) : '0';
                  const modeLabel = r.management_mode === 'conservador' ? '🛡️' : r.management_mode === 'intermediario' ? '⚖️' : r.management_mode === 'agressivo' ? '🔥' : '—';
                  return (
                    <tr key={`${r.user_id}-${r.management_mode}-${i}`} className={`border-b border-border/50 ${i < 3 ? 'bg-primary/5' : ''}`}>
                      <td className="p-3 text-lg">{getMedal(i)}</td>
                      <td className="p-3 font-medium text-foreground">{r.display_name || 'Trader'}</td>
                      <td className="p-3 text-center text-lg" title={r.management_mode || 'N/A'}>{modeLabel}</td>
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
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum dado ainda</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rankings;
