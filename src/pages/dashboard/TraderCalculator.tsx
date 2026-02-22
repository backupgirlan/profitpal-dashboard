import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

const TraderCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(100);
  const [payout, setPayout] = useState(80);
  const [stopLoss, setStopLoss] = useState(20);
  const [stopWin, setStopWin] = useState(50);
  const [sorosEnabled, setSorosEnabled] = useState(false);
  const [entryPercentage, setEntryPercentage] = useState(2);
  const [todayTrades, setTodayTrades] = useState(0);

  const maxOps = 3;
  const entryValue = balance * (entryPercentage / 100);
  const sorosLevel1 = entryValue + (entryValue * payout / 100);
  const sorosLevel2 = sorosLevel1 + (sorosLevel1 * payout / 100);

  useEffect(() => {
    if (!user) return;
    // Load profile
    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setBalance(Number(data.balance) || 100);
          setStopLoss(Number(data.stop_loss) || 20);
          setStopWin(Number(data.stop_win) || 50);
          setSorosEnabled(data.soros_enabled || false);
          setEntryPercentage(Number(data.entry_percentage) || 2);
        }
      });
    // Count today trades
    const today = new Date().toISOString().split('T')[0];
    supabase.from('trades').select('id', { count: 'exact' })
      .eq('user_id', user.id).eq('trade_date', today)
      .then(({ count }) => setTodayTrades(count || 0));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      balance, stop_loss: stopLoss, stop_win: stopWin, soros_enabled: sorosEnabled, entry_percentage: entryPercentage
    }).eq('user_id', user.id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else toast({ title: 'Salvo!', description: 'Configurações atualizadas.' });
  };

  const remaining = Math.max(0, maxOps - todayTrades);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow">Calculadora do Trader</h1>
        <p className="text-muted-foreground">Configure sua banca e calcule suas entradas</p>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calculator className="w-4 h-4" /> Operações Hoje
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {todayTrades}/{maxOps}
          </p>
          <p className={`text-xs mt-1 ${remaining === 0 ? 'text-destructive' : 'text-primary'}`}>
            {remaining === 0 ? 'Limite atingido!' : `${remaining} restante(s)`}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <DollarSign className="w-4 h-4" /> Valor de Entrada
          </div>
          <p className="text-2xl font-display font-bold text-primary text-glow">
            R$ {entryValue.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{entryPercentage}% da banca</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <AlertTriangle className="w-4 h-4" /> Stop Loss / Win
          </div>
          <p className="text-sm text-foreground">
            <span className="text-destructive">SL: R$ {stopLoss.toFixed(2)}</span>{' / '}
            <span className="win-text">SW: R$ {stopWin.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">Configurações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Banca (R$)</Label>
            <Input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} className="bg-secondary" />
          </div>
          <div>
            <Label>Entrada (%)</Label>
            <Input type="number" value={entryPercentage} onChange={(e) => setEntryPercentage(Number(e.target.value))} min={0.1} max={100} step={0.5} className="bg-secondary" />
          </div>
          <div>
            <Label>Payout (%)</Label>
            <Input type="number" value={payout} onChange={(e) => setPayout(Number(e.target.value))} className="bg-secondary" />
          </div>
          <div>
            <Label>Stop Loss (R$)</Label>
            <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} className="bg-secondary" />
          </div>
          <div>
            <Label>Stop Win (R$)</Label>
            <Input type="number" value={stopWin} onChange={(e) => setStopWin(Number(e.target.value))} className="bg-secondary" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={sorosEnabled} onCheckedChange={setSorosEnabled} />
          <Label>Ativar Sistema Soros (até nível 2)</Label>
        </div>

        {sorosEnabled && (
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Martingale Soros
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground">Nível 0</p>
                <p className="font-bold text-foreground">R$ {entryValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nível 1</p>
                <p className="font-bold text-primary">R$ {sorosLevel1.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nível 2</p>
                <p className="font-bold text-primary text-glow">R$ {sorosLevel2.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <Button onClick={saveProfile} className="gradient-gold text-primary-foreground font-display">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default TraderCalculator;
