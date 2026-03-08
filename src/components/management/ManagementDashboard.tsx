import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useManagement2x, ManagementModel } from '@/hooks/useManagement2x';
import { useAuth } from '@/hooks/useAuth';
import { useStreak } from '@/hooks/useStreak';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FieldHelp from '@/components/FieldHelp';
import {
  Play, RotateCcw, LogOut, ArrowLeftRight, CheckCircle, XCircle,
  Target, Shield, Zap, Info, TrendingUp, Clock, Maximize2, Minimize2
} from 'lucide-react';

interface Props {
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function ManagementDashboard({ fullscreen, onToggleFullscreen }: Props) {
  const mgmt = useManagement2x();
  const { state } = mgmt;
  const { user } = useAuth();
  const { registerActivity } = useStreak();
  const { toast } = useToast();

  const [profileBalance, setProfileBalance] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [infoModel, setInfoModel] = useState<ManagementModel>('2x0');

  // Trade form
  const [pair, setPair] = useState('');
  const [payoutInput, setPayoutInput] = useState('85');
  const [amountInput, setAmountInput] = useState('');
  const [observation, setObservation] = useState('');
  const [savedPairs, setSavedPairs] = useState<string[]>([]);
  const [showPairSuggestions, setShowPairSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFollowedPlan, setShowFollowedPlan] = useState(false);
  const [lastTradeId, setLastTradeId] = useState<string | null>(null);
  // Setup form
  const [setupPercentual, setSetupPercentual] = useState('5');

  // Load balance
  useEffect(() => {
    if (!user) return;
    const fetchBalance = async () => {
      const { data } = await supabase.from('profiles').select('balance').eq('user_id', user.id).single();
      if (data) setProfileBalance(Number(data.balance) || 0);
    };
    fetchBalance();
    const handler = () => fetchBalance();
    window.addEventListener('balance-updated', handler);
    return () => window.removeEventListener('balance-updated', handler);
  }, [user]);

  // Load saved pairs
  useEffect(() => {
    if (!user) return;
    supabase.from('trades').select('pair_name').eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setSavedPairs([...new Set(data.map(d => d.pair_name))].sort());
      });
  }, [user]);

  // Sync banca with profile when management starts
  useEffect(() => {
    if (state.ativo && profileBalance > 0 && Math.abs(state.banca - profileBalance) > 0.01) {
      mgmt.updateBanca(profileBalance);
    }
  }, [profileBalance]);

  // Set amount to recommended entry when it changes
  useEffect(() => {
    if (state.ativo && state.cicloStatus === 'active' && !amountInput) {
      setAmountInput(String(mgmt.getEntradaAtual()));
    }
  }, [state.entradaRecomendada, state.ativo]);

  const filteredPairs = pair.length > 0
    ? savedPairs.filter(p => p.toLowerCase().startsWith(pair.toLowerCase()))
    : savedPairs;

  const handleIniciar = (model: ManagementModel) => {
    if (profileBalance <= 0) {
      toast({ title: 'Banca insuficiente', description: 'Faça um depósito primeiro.', variant: 'destructive' });
      return;
    }
    const pct = Number(setupPercentual) || 5;
    mgmt.iniciar({ model, banca: profileBalance, percentual: pct });
    const entrada = +(profileBalance * (pct / 100)).toFixed(2);
    setAmountInput(String(entrada));
    toast({ title: `Gerenciamento ${model.toUpperCase()} ativado!`, description: `Entrada recomendada: R$ ${entrada.toFixed(2)}` });
  };

  const handleRegistrar = async (result: 'win' | 'loss') => {
    if (!pair.trim() || !amountInput || !user) return;
    const amt = Number(amountInput);
    if (amt <= 0) {
      toast({ title: 'Valor inválido', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    const payout = Number(payoutInput);
    const profit = result === 'win' ? +(amt * (payout / 100)).toFixed(2) : -amt;

    // Register in engine
    mgmt.registrarOperacao({
      pair: pair.trim().toUpperCase(),
      payout,
      amount: amt,
      result,
      observation: observation.trim(),
    });

    // Save to DB
    const today = new Date().toISOString().split('T')[0];
    const { data: insertedTrade } = await supabase.from('trades').insert({
      user_id: user.id,
      pair_name: pair.trim().toUpperCase(),
      payout,
      result,
      amount: amt,
      profit,
      management_mode: state.model,
      entry_type: 'normal',
      trade_date: today,
      observation: observation.trim() || null,
    }).select('id').single();

    if (insertedTrade) setLastTradeId(insertedTrade.id);

    // Update profile balance
    const { data: profileData } = await supabase.from('profiles').select('balance, total_profit').eq('user_id', user.id).single();
    if (profileData) {
      const newBalance = +(Number(profileData.balance) + profit).toFixed(2);
      const newTotalProfit = +(Number(profileData.total_profit) + profit).toFixed(2);
      await supabase.from('profiles').update({
        balance: newBalance,
        total_profit: newTotalProfit,
        active_management_mode: state.model,
      }).eq('user_id', user.id);
      setProfileBalance(newBalance);
      window.dispatchEvent(new CustomEvent('balance-updated', { detail: { balance: newBalance, totalProfit: newTotalProfit } }));
    }

    await registerActivity();

    if (!savedPairs.includes(pair.trim().toUpperCase())) {
      setSavedPairs(prev => [...prev, pair.trim().toUpperCase()].sort());
    }

    toast({
      title: result === 'win' ? '✅ Win registrado!' : '❌ Loss registrado!',
      description: `${pair.trim().toUpperCase()} — ${payout}% | R$ ${profit.toFixed(2)}`,
    });

    setPair('');
    setObservation('');
    setAmountInput(String(mgmt.getEntradaAtual()));
    setSubmitting(false);
    setShowFollowedPlan(true);
  };

  const handleFollowedPlan = async (followed: boolean) => {
    if (lastTradeId) {
      await supabase.from('trades').update({ followed_plan: followed }).eq('id', lastTradeId);
    }
    if (!followed && user) {
      await supabase.from('profiles').update({
        consecutive_losses: 0,
      }).eq('user_id', user.id);
    }
    setShowFollowedPlan(false);
    setLastTradeId(null);
  };

  const handleNovoCiclo = () => {
    mgmt.novoCiclo();
    setPair('');
    setObservation('');
    setAmountInput('');
    toast({ title: 'Novo ciclo iniciado!' });
  };

  const handleSair = async () => {
    mgmt.sair();
    if (user) {
      await supabase.from('profiles').update({ active_management_mode: null }).eq('user_id', user.id);
    }
    toast({ title: 'Gerenciamento desativado' });
  };

  // ============ RENDER ============

  // Not active: show model selection
  if (!state.ativo) {
    return (
      <div className={`space-y-6 ${fullscreen ? 'p-6' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-primary text-glow">Gerenciamento de Banca</h2>
            <p className="text-xs text-muted-foreground">Escolha um modelo e opere com disciplina.</p>
          </div>
          {onToggleFullscreen && (
            <Button variant="outline" size="sm" onClick={onToggleFullscreen} className="border-border gap-1">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Banca display */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sua banca atual</p>
                <p className="text-2xl font-display font-bold text-foreground">R$ {profileBalance.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-xs">Percentual por operação (%)</Label>
                <Input
                  type="number"
                  value={setupPercentual}
                  onChange={e => setSetupPercentual(e.target.value)}
                  className="bg-secondary w-24"
                  min={1}
                  max={20}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Entrada recomendada: <span className="text-primary font-bold">R$ {(profileBalance * (Number(setupPercentual) || 5) / 100).toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2x0 */}
          <Card className="border-border hover:border-primary/50 transition-all group">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">Gerenciamento 2x0</h3>
                  <p className="text-xs text-muted-foreground">Conservador — Alta assertividade</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                  <span>Meta: <strong className="text-foreground">2 Wins</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-destructive" />
                  <span>Tolerância: <strong className="text-foreground">0 Loss</strong></span>
                </div>
                <p className="text-muted-foreground italic">Se houver 1 loss, o ciclo termina.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleIniciar('2x0')} className="flex-1 gradient-gold text-primary-foreground font-display gap-2">
                  <Play className="w-4 h-4" /> Iniciar 2x0
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setInfoModel('2x0'); setShowInfo(true); }}>
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2x1 */}
          <Card className="border-border hover:border-primary/50 transition-all group">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">Gerenciamento 2x1</h3>
                  <p className="text-xs text-muted-foreground">Equilibrado — Flexibilidade controlada</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                  <span>Meta: <strong className="text-foreground">2 Wins</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-destructive" />
                  <span>Tolerância: <strong className="text-foreground">1 Loss</strong></span>
                </div>
                <p className="text-muted-foreground italic">Este gerenciamento permite até 1 loss durante o ciclo.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleIniciar('2x1')} className="flex-1 gradient-gold text-primary-foreground font-display gap-2">
                  <Play className="w-4 h-4" /> Iniciar 2x1
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setInfoModel('2x1'); setShowInfo(true); }}>
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cycle History */}
        {state.historicoCiclos.length > 0 && (
          <Card className="border-border">
            <CardContent className="p-4">
              <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Histórico de Ciclos
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {state.historicoCiclos.map((c, i) => (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-lg text-xs ${c.status === 'won' ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={c.status === 'won' ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive'}>
                        {c.model.toUpperCase()}
                      </Badge>
                      <span className="text-foreground font-medium">{c.wins}W / {c.losses}L</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={c.lucroTotal >= 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>
                        R$ {c.lucroTotal.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">{new Date(c.timestamp).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Dialog */}
        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-primary">
                {infoModel === '2x0' ? 'Como usar o Gerenciamento 2x0' : 'Como usar o Gerenciamento 2x1'}
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              {infoModel === '2x0' ? (
                <p>Este modelo foi criado para quem busca mais controle e disciplina nas operações. No gerenciamento 2x0, o objetivo é conquistar 2 operações vencedoras sem aceitar loss dentro do ciclo. Se ocorrer 1 loss antes da meta, o ciclo é encerrado. Informe sua banca, confira o valor recomendado por operação e registre cada entrada com atenção. Esse modelo é ideal para quem prefere uma abordagem mais conservadora e focada em assertividade.</p>
              ) : (
                <p>Este modelo foi desenvolvido para quem deseja mais flexibilidade sem perder o controle da banca. No gerenciamento 2x1, o objetivo é alcançar 2 wins, aceitando no máximo 1 loss durante o ciclo. Caso aconteça um segundo loss, o ciclo será encerrado. Informe sua banca, utilize o valor recomendado por operação e registre cada entrada corretamente. Esse modelo é indicado para quem busca equilíbrio entre segurança e tolerância operacional.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ============ ACTIVE MANAGEMENT ============
  const maxLosses = state.model === '2x0' ? 0 : 1;
  const winProgress = (state.cicloWins / 2) * 100;
  const lossProgress = maxLosses > 0 ? (state.cicloLosses / (maxLosses + 1)) * 100 : state.cicloLosses > 0 ? 100 : 0;
  const isEnded = state.cicloStatus !== 'active';

  const statusMessage = state.cicloStatus === 'won'
    ? '🎯 Ciclo concluído com sucesso!'
    : state.cicloStatus === 'lost'
    ? '🚫 Ciclo encerrado por loss'
    : '⏳ Ciclo em andamento';

  const statusColor = state.cicloStatus === 'won'
    ? 'text-success'
    : state.cicloStatus === 'lost'
    ? 'text-destructive'
    : 'text-primary';

  return (
    <div className={`space-y-4 ${fullscreen ? 'p-6' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-primary text-glow">Gerenciamento de Banca</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="gradient-gold text-primary-foreground font-display text-xs">
              Ativo: {state.model?.toUpperCase()}
            </Badge>
            <span className={`text-xs font-bold ${statusColor}`}>{statusMessage}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {onToggleFullscreen && (
            <Button variant="outline" size="sm" onClick={onToggleFullscreen} className="border-border gap-1">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Banca</p>
            <p className="text-lg font-display font-bold text-foreground">R$ {state.banca.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrada</p>
            <p className="text-lg font-display font-bold text-primary">R$ {mgmt.getEntradaAtual().toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Placar</p>
            <p className="text-lg font-display font-bold">
              <span className="text-success">{state.cicloWins}</span>
              <span className="text-muted-foreground"> x </span>
              <span className="text-destructive">{state.cicloLosses}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lucro Ciclo</p>
            <p className={`text-lg font-display font-bold ${state.cicloLucro >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {state.cicloLucro.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Progresso do Ciclo
          </h3>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-success font-medium">Wins: {state.cicloWins}/2</span>
              <span className="text-success font-bold">{winProgress.toFixed(0)}%</span>
            </div>
            <Progress value={winProgress} className="h-3 [&>div]:bg-success" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-destructive font-medium">Losses: {state.cicloLosses}/{maxLosses} permitido</span>
              <span className="text-destructive font-bold">{lossProgress.toFixed(0)}%</span>
            </div>
            <Progress value={lossProgress} className="h-3 [&>div]:bg-destructive" />
          </div>
          <p className="text-xs text-muted-foreground italic">
            {state.model === '2x0'
              ? 'Se houver 1 loss, o ciclo termina.'
              : 'Este gerenciamento permite até 1 loss durante o ciclo.'}
          </p>
        </CardContent>
      </Card>

      {/* Register Trade */}
      {!isEnded && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2">
              Registrar Operação
              <FieldHelp text="Registre cada operação do ciclo. O valor recomendado é calculado automaticamente mas pode ser alterado." />
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Label className="text-xs">Par</Label>
                <Input
                  value={pair}
                  onChange={e => { setPair(e.target.value.toUpperCase()); setShowPairSuggestions(true); }}
                  onFocus={() => setShowPairSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPairSuggestions(false), 200)}
                  placeholder="EUR/USD"
                  className="bg-secondary uppercase"
                  autoComplete="off"
                />
                {showPairSuggestions && filteredPairs.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-32 overflow-y-auto">
                    {filteredPairs.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
                        onMouseDown={() => { setPair(p); setShowPairSuggestions(false); }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">Payout (%)</Label>
                <Input type="number" value={payoutInput} onChange={e => setPayoutInput(e.target.value)} className="bg-secondary" />
              </div>
              <div>
                <Label className="text-xs">Valor da operação (R$)</Label>
                <Input type="number" value={amountInput} onChange={e => setAmountInput(e.target.value)} className="bg-secondary" />
                <p className="text-[10px] text-muted-foreground mt-0.5">Recomendado: R$ {state.entradaRecomendada.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-xs">Observação (opcional)</Label>
                <Input value={observation} onChange={e => setObservation(e.target.value)} placeholder="ex: tendência alta" className="bg-secondary" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleRegistrar('win')}
                disabled={!pair.trim() || !amountInput || submitting}
                className="flex-1 font-display gap-2 bg-success/20 text-success hover:bg-success/30 border border-success/30"
              >
                <CheckCircle className="w-4 h-4" /> WIN
              </Button>
              <Button
                onClick={() => handleRegistrar('loss')}
                disabled={!pair.trim() || !amountInput || submitting}
                className="flex-1 font-display gap-2 bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30"
              >
                <XCircle className="w-4 h-4" /> LOSS
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cycle Trades */}
      {state.cicloTrades.length > 0 && (
        <Card className="border-border">
          <CardContent className="p-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">Operações do Ciclo</h3>
            <div className="space-y-2">
              {state.cicloTrades.map((t) => (
                <div key={t.id} className={`flex items-center justify-between p-2 rounded-lg text-xs ${t.result === 'win' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <div className="flex items-center gap-2">
                    {t.result === 'win' ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                    <span className="font-medium text-foreground">{t.pair}</span>
                    <span className="text-muted-foreground">{t.payout}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">R$ {t.amount.toFixed(2)}</span>
                    <span className={t.profit >= 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>
                      {t.profit >= 0 ? '+' : ''}R$ {t.profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {isEnded && (
          <Button onClick={handleNovoCiclo} className="flex-1 gradient-gold text-primary-foreground font-display gap-2">
            <RotateCcw className="w-4 h-4" /> Novo Ciclo
          </Button>
        )}
        <Button variant="outline" onClick={() => { setInfoModel(state.model === '2x0' ? '2x1' : '2x0'); mgmt.trocar(); }} className="gap-2">
          <ArrowLeftRight className="w-4 h-4" /> Trocar
        </Button>
        <Button variant="destructive" onClick={handleSair} className="gap-2">
          <LogOut className="w-4 h-4" /> Sair
        </Button>
      </div>

      {/* Info Dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">
              {infoModel === '2x0' ? 'Como usar o Gerenciamento 2x0' : 'Como usar o Gerenciamento 2x1'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {infoModel === '2x0' ? (
              <p>Este modelo foi criado para quem busca mais controle e disciplina nas operações. No gerenciamento 2x0, o objetivo é conquistar 2 operações vencedoras sem aceitar loss dentro do ciclo. Se ocorrer 1 loss antes da meta, o ciclo é encerrado. Informe sua banca, confira o valor recomendado por operação e registre cada entrada com atenção. Esse modelo é ideal para quem prefere uma abordagem mais conservadora e focada em assertividade.</p>
            ) : (
              <p>Este modelo foi desenvolvido para quem deseja mais flexibilidade sem perder o controle da banca. No gerenciamento 2x1, o objetivo é alcançar 2 wins, aceitando no máximo 1 loss durante o ciclo. Caso aconteça um segundo loss, o ciclo será encerrado. Informe sua banca, utilize o valor recomendado por operação e registre cada entrada corretamente. Esse modelo é indicado para quem busca equilíbrio entre segurança e tolerância operacional.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Followed Plan Dialog */}
      <Dialog open={showFollowedPlan} onOpenChange={setShowFollowedPlan}>
        <DialogContent className="bg-card border-primary/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-primary text-center">
              Você seguiu seu plano nessa operação?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground text-center">Isso cria consciência de disciplina e alimenta seu Score de Disciplina.</p>
          <div className="flex gap-3">
            <Button onClick={() => handleFollowedPlan(true)} className="flex-1 bg-success/20 text-success hover:bg-success/30 border border-success/30 font-display gap-2">
              <CheckCircle className="w-4 h-4" /> Sim
            </Button>
            <Button onClick={() => handleFollowedPlan(false)} className="flex-1 bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30 font-display gap-2">
              <XCircle className="w-4 h-4" /> Não
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
