import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, CheckCircle, XCircle, PartyPopper, AlertTriangle } from 'lucide-react';

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

const WIN_MESSAGES = [
  "🎉 Parabéns pela vitória! Continue seguindo o gerenciamento e colhendo os frutos da disciplina!",
  "🏆 Excelente operação! Lembre-se: consistência é a chave. Não se empolgue, siga o plano!",
  "✅ Win registrado! Você está no caminho certo. Mantenha o foco nas próximas entradas.",
];

const LOSS_MESSAGES = [
  "Calma! O que foi perdido NÃO se recupera no mesmo instante. Respire fundo e aguarde um melhor momento para a segunda entrada. Você está passando por um ciclo ruim de mercado — isso é normal. Mantenha a regra das 3 entradas e nunca se vicie no gráfico.",
  "Respire. Perdas fazem parte do processo. Não tente recuperar agora — o mercado vai te dar novas oportunidades. Siga a regra das 3 entradas, tenha paciência e não se desespere. O resultado vem com o tempo, não com a pressa.",
  "Momento de cautela. Não se desespere tentando recuperar. Lembre-se: o prejuízo se recupera no decorrer do tempo, não no mesmo instante. Mantenha a disciplina, respeite as 3 entradas diárias e não fique viciado no gráfico.",
];

const Management = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pairName, setPairName] = useState('');
  const [payout, setPayout] = useState(80);
  const [result, setResult] = useState<string>('win');
  const [amount, setAmount] = useState(2);

  // Popups
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [showLossPopup, setShowLossPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

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
      const { data: profileData } = await supabase.from('profiles').select('balance').eq('user_id', user.id).single();
      if (profileData) {
        const newBalance = Number(profileData.balance) + profit;
        await supabase.from('profiles').update({ balance: newBalance }).eq('user_id', user.id);
      }
      setPairName('');
      fetchTrades();
      toast({ title: 'Operação registrada!' });

      // Show popup
      if (result === 'win') {
        setPopupMessage(WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]);
        setShowWinPopup(true);
      } else {
        setPopupMessage(LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)]);
        setShowLossPopup(true);
      }
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
      {/* Win Popup */}
      <Dialog open={showWinPopup} onOpenChange={setShowWinPopup}>
        <DialogContent className="bg-card border-success/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 win-text font-display">
              <PartyPopper className="w-5 h-5" /> Win! 🎉
            </DialogTitle>
            <DialogDescription className="text-foreground pt-2 text-sm leading-relaxed">
              {popupMessage}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowWinPopup(false)} className="gradient-gold text-primary-foreground font-display">
            Continuar
          </Button>
        </DialogContent>
      </Dialog>

      {/* Loss Popup */}
      <Dialog open={showLossPopup} onOpenChange={setShowLossPopup}>
        <DialogContent className="bg-card border-destructive/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-display">
              <AlertTriangle className="w-5 h-5" /> Loss
            </DialogTitle>
            <DialogDescription className="text-foreground pt-2 text-sm leading-relaxed">
              {popupMessage}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowLossPopup(false)} className="gradient-gold text-primary-foreground font-display">
            Li e entendi
          </Button>
        </DialogContent>
      </Dialog>

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
