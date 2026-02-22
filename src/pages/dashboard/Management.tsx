import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Trade {
  id: string;
  pair_name: string;
  payout: number;
  result: string;
  amount: number;
  profit: number;
  soros_level: number;
  trade_date: string;
}

const Management = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pairName, setPairName] = useState('');
  const [payout, setPayout] = useState(80);
  const [result, setResult] = useState<string>('win');
  const [amount, setAmount] = useState(2);

  const today = new Date().toISOString().split('T')[0];

  const fetchTrades = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('trade_date', today)
      .order('created_at', { ascending: false });
    if (data) setTrades(data as Trade[]);
  };

  useEffect(() => { fetchTrades(); }, [user]);

  const addTrade = async () => {
    if (!user || !pairName) return;
    const todayCount = trades.length;
    // No trade limit - user can add unlimited trades
    const profit = result === 'win' ? amount * (payout / 100) : -amount;

    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      pair_name: pairName,
      payout,
      result,
      amount,
      profit,
      soros_level: 0,
      trade_date: today,
    });

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      // Update balance with profit
      const { data: profileData } = await supabase.from('profiles').select('balance').eq('user_id', user.id).single();
      if (profileData) {
        const newBalance = Number(profileData.balance) + profit;
        await supabase.from('profiles').update({ balance: newBalance }).eq('user_id', user.id);
      }
      setPairName('');
      fetchTrades();
      toast({ title: 'Operação registrada!' });
    }
  };

  const deleteTrade = async (id: string) => {
    await supabase.from('trades').delete().eq('id', id);
    fetchTrades();
  };

  const wins = trades.filter(t => t.result === 'win').length;
  const losses = trades.filter(t => t.result === 'loss').length;
  const totalProfit = trades.reduce((sum, t) => sum + Number(t.profit), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow">Gerenciamento</h1>
        <p className="text-muted-foreground">Registre suas operações do dia</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Wins</p>
          <p className="text-2xl font-display font-bold win-text">{wins}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Losses</p>
          <p className="text-2xl font-display font-bold loss-text">{losses}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Lucro</p>
          <p className={`text-2xl font-display font-bold ${totalProfit >= 0 ? 'win-text' : 'loss-text'}`}>
            R$ {totalProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add trade */}
      {(
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-display text-sm font-bold text-foreground mb-3">Nova Operação</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Input placeholder="Par (ex: EUR/USD)" value={pairName} onChange={(e) => setPairName(e.target.value)} className="bg-secondary" />
            <Input type="number" placeholder="Payout %" value={payout} onChange={(e) => setPayout(Number(e.target.value))} className="bg-secondary" />
            <Input type="number" placeholder="Valor R$" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="bg-secondary" />
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="win">✅ Win</SelectItem>
                <SelectItem value="loss">❌ Loss</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTrade} className="gradient-gold text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </div>
      )}

      {/* Trades table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left p-3 text-muted-foreground font-medium">Par</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Payout</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Valor</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Resultado</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Lucro</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-border/50 hover:bg-secondary/50">
                <td className="p-3 font-medium text-foreground">{trade.pair_name}</td>
                <td className="p-3 text-muted-foreground">{trade.payout}%</td>
                <td className="p-3 text-muted-foreground">R$ {Number(trade.amount).toFixed(2)}</td>
                <td className="p-3">
                  {trade.result === 'win' ? (
                    <span className="inline-flex items-center gap-1 win-text"><CheckCircle className="w-3 h-3" /> Win</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 loss-text"><XCircle className="w-3 h-3" /> Loss</span>
                  )}
                </td>
                <td className={`p-3 font-bold ${Number(trade.profit) >= 0 ? 'win-text' : 'loss-text'}`}>
                  R$ {Number(trade.profit).toFixed(2)}
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => deleteTrade(trade.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhuma operação hoje</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Management;
