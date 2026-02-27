import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useManagementEngine, ManagementMode } from '@/hooks/useManagementEngine';
import { useSorosEngine } from '@/hooks/useSorosEngine';
import { useEntradaFixaEngine } from '@/hooks/useEntradaFixaEngine';
import SorosGameUI from './SorosGameUI';
import TradeConfirmDialog from '@/components/TradeConfirmDialog';
import SorosTrophyDialog from '@/components/SorosTrophyDialog';
import { getRankForCycles } from '@/lib/sorosRanks';
import { Shield, BarChart3, Zap, CheckCircle, XCircle, Play, RotateCcw, Maximize2, Minimize2, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useStreak } from '@/hooks/useStreak';
import { useToast } from '@/hooks/use-toast';

type AllModes = ManagementMode | 'soros4x' | 'entrada_fixa';

interface Props {
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const MODE_INFO: Record<AllModes, { label: string; icon: any; desc: string; color: string; riskRange: string; stopLoss: string; stopWin: string }> = {
  entrada_fixa: { label: 'Entrada Fixa', icon: DollarSign, desc: 'Valor fixo por operação', color: 'text-emerald-400', riskRange: 'Fixo', stopLoss: '2 losses seguidos', stopWin: '—' },
  soros4x: { label: 'Soros x4', icon: TrendingUp, desc: 'Risco fixo por tentativa', color: 'text-primary', riskRange: 'Banca/Tentativas', stopLoss: '—', stopWin: '—' },
  conservador: { label: 'Conservador', icon: Shield, desc: 'Proteção total + Anti Dia Ruim', color: 'text-blue-400', riskRange: '0.5% - 1%', stopLoss: '2%', stopWin: '1% - 2%' },
  intermediario: { label: 'Intermediário', icon: BarChart3, desc: 'Crescimento controlado', color: 'win-text', riskRange: '2%', stopLoss: '5%', stopWin: '3% - 5%' },
  agressivo: { label: 'Agressivo', icon: Zap, desc: 'Alto risco / alto retorno', color: 'text-destructive', riskRange: '3% - 5%', stopLoss: '10%', stopWin: '5% - 15%' },
};

export default function ManagementDashboard({ fullscreen, onToggleFullscreen }: Props) {
  const engine = useManagementEngine();
  const sorosEngine = useSorosEngine();
  const entradaFixaEngine = useEntradaFixaEngine();
  const { user } = useAuth();
  const { registerActivity } = useStreak();
  const { toast } = useToast();
  const s = engine.state;
  const [tab, setTab] = useState<AllModes>('entrada_fixa');

  // Trade confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingResult, setPendingResult] = useState<'win' | 'loss'>('win');
  const [confirmTarget, setConfirmTarget] = useState<'engine' | 'soros' | 'entrada_fixa'>('engine');

  // Trophy dialog state
  const [trophyOpen, setTrophyOpen] = useState(false);
  const [trophyLucro, setTrophyLucro] = useState(0);
  const [trophyGanhas, setTrophyGanhas] = useState(0);
  const [lastTrophyCount, setLastTrophyCount] = useState(0);

  // Soros daily limit warning
  const [showDailyWarning, setShowDailyWarning] = useState(false);
  const [dailyWarningAcked, setDailyWarningAcked] = useState(false);

  // Track completed Soros cycles for trophy
  useEffect(() => {
    const ganhas = sorosEngine.state.tentativasGanhas;
    if (ganhas > 0 && ganhas !== lastTrophyCount) {
      setLastTrophyCount(ganhas);
      setTrophyLucro(sorosEngine.state.lucroSessao);
      setTrophyGanhas(ganhas);
      setTrophyOpen(true);

      // Show daily limit warning after first completed cycle
      if (ganhas >= 1 && !dailyWarningAcked) {
        setTimeout(() => setShowDailyWarning(true), 1500);
      }
    }
  }, [sorosEngine.state.tentativasGanhas]);

  // Profile balance from DB
  const [profileBalance, setProfileBalance] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchBalance = async () => {
      const { data } = await supabase.from('profiles').select('balance').eq('user_id', user.id).single();
      if (data) setProfileBalance(Number(data.balance) || 0);
    };
    fetchBalance();
    // Refresh instantly when balance is updated after DB write
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.balance !== undefined) {
        setProfileBalance(Number(detail.balance));
      } else {
        fetchBalance();
      }
    };
    window.addEventListener('balance-updated', handler);
    return () => window.removeEventListener('balance-updated', handler);
  }, [user]);

  // Form state for 3 modules — banca comes from profile
  const banca = String(profileBalance);
  const [riscoPct, setRiscoPct] = useState('1');
  const [stopLossPct, setStopLossPct] = useState('2');
  const [stopWinPct, setStopWinPct] = useState('2');
  const [maxTrades, setMaxTrades] = useState('3');
  const [payoutInput, setPayoutInput] = useState('80');
  const [sorosAtivo, setSorosAtivo] = useState(false);
  const [sorosMax, setSorosMax] = useState('4');
  const [martingaleAtivo, setMartingaleAtivo] = useState(false);
  // Form state for Entrada Fixa
  const [efEntrada, setEfEntrada] = useState('50');
  const [efMaxEntradas, setEfMaxEntradas] = useState('2');
  const [efPayout, setEfPayout] = useState('80');

  // Form state for Soros x4 — banca comes from profile
  const sorosBanca = String(profileBalance);
  const [sorosTentativas, setSorosTentativas] = useState('10');
  const [sorosErrors, setSorosErrors] = useState<string[]>([]);

  const isManagementActive = s.ativo;
  const isSorosActive = sorosEngine.state.ativo;
  const isEntradaFixaActive = entradaFixaEngine.state.ativo;
  const isAnyActive = isManagementActive || isSorosActive || isEntradaFixaActive;

  const handleTabChange = (mode: AllModes) => {
    if (isAnyActive) return;
    setTab(mode);
    if (mode === 'conservador') { setRiscoPct('1'); setStopLossPct('2'); setStopWinPct('2'); setMaxTrades('3'); }
    if (mode === 'intermediario') { setRiscoPct('2'); setStopLossPct('5'); setStopWinPct('3'); setMaxTrades('5'); }
    if (mode === 'agressivo') { setRiscoPct('3'); setStopLossPct('10'); setStopWinPct('5'); setMaxTrades('10'); }
  };

  const handleIniciar = () => {
    if (Number(banca) <= 0) return;
    engine.iniciar({
      mode: tab as ManagementMode,
      banca: Number(banca),
      riscoPct: Number(riscoPct),
      stopLossPct: Number(stopLossPct),
      stopWinPct: Number(stopWinPct),
      maxTrades: Number(maxTrades),
      payout: Number(payoutInput),
      sorosAtivo: tab === 'agressivo' ? sorosAtivo : false,
      sorosMaxLevel: Number(sorosMax),
      martingaleAtivo: tab === 'agressivo' ? martingaleAtivo : false,
    });
  };

  const handleSorosIniciar = () => {
    const errs: string[] = [];
    if (Number(sorosBanca) <= 0) errs.push('Banca inválida.');
    if (Number(sorosTentativas) < 10) errs.push('Mínimo 10 tentativas.');
    setSorosErrors(errs);
    if (errs.length > 0) return;
    sorosEngine.iniciar({
      mode: 'soros4x',
      banca: Number(sorosBanca),
      tentativas: Number(sorosTentativas),
      payout: 0.80, // default, will be overridden per trade
    });
  };

  const handleResetar = () => {
    engine.resetar();
    sorosEngine.resetar();
    entradaFixaEngine.resetar();
  };

  const entradaAtual = engine.getEntradaAtual();
  const activeMode: AllModes = isEntradaFixaActive ? 'entrada_fixa' : isSorosActive ? 'soros4x' : isManagementActive ? s.mode : tab;
  const info = MODE_INFO[activeMode];

  const handleEntradaFixaIniciar = () => {
    if (Number(banca) <= 0 || Number(efEntrada) <= 0) return;
    entradaFixaEngine.iniciar({
      banca: Number(banca),
      entradaFixa: Number(efEntrada),
      maxEntradas: Number(efMaxEntradas),
      payout: Number(efPayout),
    });
  };

  const handleTradeRequest = (resultado: 'win' | 'loss', target: 'engine' | 'soros' | 'entrada_fixa') => {
    setPendingResult(resultado);
    setConfirmTarget(target);
    setConfirmOpen(true);
  };

  const handleTradeConfirm = useCallback(async (pairName: string, payout: number) => {
    const payoutDecimal = payout / 100;
    let entryAmount = 0;
    let profit = 0;
    let sorosLevel = 0;

    if (confirmTarget === 'engine') {
      entryAmount = engine.getEntradaAtual();
      profit = pendingResult === 'win' ? +(entryAmount * payoutDecimal).toFixed(2) : -entryAmount;
      engine.registrarResultado(pendingResult);
    } else if (confirmTarget === 'entrada_fixa') {
      entryAmount = entradaFixaEngine.state.entradaFixa;
      profit = pendingResult === 'win' ? +(entryAmount * payoutDecimal).toFixed(2) : -entryAmount;
      entradaFixaEngine.registrarResultado(pendingResult, payoutDecimal);
    } else {
      // Capture Soros entry and level BEFORE registering result
      const ss = sorosEngine.state;
      sorosLevel = ss.nivelAtual;
      if (ss.mode === 'conservador') {
        const mult = [0.60, 0.70, 0.80, 0.90];
        entryAmount = +(ss.saldoCiclo * mult[ss.nivelAtual - 1]).toFixed(2);
      } else {
        entryAmount = +ss.saldoCiclo.toFixed(2);
      }
      if (pendingResult === 'win') {
        profit = +(entryAmount * payoutDecimal).toFixed(2);
      } else {
        profit = -ss.riscoOperacional;
      }
      sorosEngine.registrarResultado(pendingResult, payoutDecimal);
    }
    setConfirmOpen(false);

    // Persist trade directly to DB (no event needed)
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    await supabase.from('trades').insert({
      user_id: user.id,
      pair_name: pairName,
      payout: payout,
      result: pendingResult,
      amount: entryAmount,
      profit,
      management_mode: activeMode,
      entry_type: 'normal',
      soros_level: sorosLevel || 0,
      trade_date: today,
    });

    // Update profile balance and total_profit
    const { data: profileData } = await supabase.from('profiles').select('balance, total_profit').eq('user_id', user.id).single();
    if (profileData) {
      const newBalance = +(Number(profileData.balance) + profit).toFixed(2);
      const newTotalProfit = +(Number(profileData.total_profit) + profit).toFixed(2);
      await supabase.from('profiles').update({
        balance: newBalance,
        total_profit: newTotalProfit,
        active_management_mode: activeMode,
      }).eq('user_id', user.id);

      // Update local balance immediately
      setProfileBalance(newBalance);

      // Notify other components (DashboardHome) to refresh
      window.dispatchEvent(new CustomEvent('balance-updated', {
        detail: { balance: newBalance, totalProfit: newTotalProfit }
      }));
    }

    // Register streak activity
    await registerActivity();

    toast({
      title: pendingResult === 'win' ? '✅ Win registrado!' : '❌ Loss registrado!',
      description: `${pairName} — ${payout}% | Lucro: R$ ${profit.toFixed(2)}`,
    });
  }, [user, pendingResult, confirmTarget, engine, sorosEngine, activeMode, registerActivity, toast]);

  // Progress calculations
  const stopLossVal = s.bancaInicial * (s.stopLossPct / 100);
  const stopWinVal = s.bancaInicial * (s.stopWinPct / 100);
  const lossProgress = stopLossVal > 0 && s.lucroSessao < 0 ? Math.min((Math.abs(s.lucroSessao) / stopLossVal) * 100, 100) : 0;
  const winProgress = stopWinVal > 0 && s.lucroSessao > 0 ? Math.min((s.lucroSessao / stopWinVal) * 100, 100) : 0;
  const tradeProgress = s.maxTrades > 0 ? (s.tradesDoDia / s.maxTrades) * 100 : 0;

  const riskLevel = activeMode === 'entrada_fixa' ? 'low' : activeMode === 'conservador' ? 'low' : activeMode === 'intermediario' ? 'medium' : activeMode === 'agressivo' ? 'high' : 'medium';
  const riskColor = riskLevel === 'low' ? 'bg-blue-500' : riskLevel === 'medium' ? 'bg-primary' : 'bg-destructive';
  const riskLabel = riskLevel === 'low' ? 'Risco Baixo' : riskLevel === 'medium' ? 'Risco Controlado' : 'Risco Elevado';

  const allModes: AllModes[] = ['entrada_fixa', 'soros4x', 'conservador', 'intermediario', 'agressivo'];

  return (
    <div className={`space-y-4 ${fullscreen ? 'p-6' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-primary text-glow">Módulos de Gerenciamento</h2>
          <p className="text-xs text-muted-foreground">Trading envolve risco. Gerenciamento não garante lucro.</p>
        </div>
        <div className="flex gap-2">
          {onToggleFullscreen && (
            <Button variant="outline" size="sm" onClick={onToggleFullscreen} className="border-border gap-1">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {fullscreen ? 'Sair' : 'Tela Cheia'}
            </Button>
          )}
          {isAnyActive && (
            <Button variant="destructive" size="sm" onClick={handleResetar} className="gap-1">
              <RotateCcw className="w-3 h-3" /> Resetar
            </Button>
          )}
        </div>
      </div>

      {/* Risk Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${riskColor} animate-pulse`} />
        <span className={`text-xs font-display font-bold ${info.color}`}>{riskLabel}</span>
        <span className="text-xs text-muted-foreground">— {info.desc}</span>
      </div>

      {/* Mode Tabs */}
      <Tabs value={activeMode} onValueChange={(v) => handleTabChange(v as AllModes)}>
        <TabsList className="grid grid-cols-5 w-full bg-secondary">
          {allModes.map(mode => {
            const m = MODE_INFO[mode];
            const disabled = isAnyActive && activeMode !== mode;
            const shortName = mode === 'entrada_fixa' ? 'Fixo' : mode === 'soros4x' ? 'Soros' : mode === 'conservador' ? 'Cons.' : mode === 'intermediario' ? 'Inter.' : 'Agr.';
            return (
              <TabsTrigger key={mode} value={mode} disabled={disabled}
                className={`text-[9px] sm:text-xs gap-0.5 sm:gap-1 data-[state=active]:bg-primary/20 ${disabled ? 'opacity-30' : ''}`}>
                <m.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
                <span className="sm:hidden">{shortName}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ENTRADA FIXA Tab */}
        <TabsContent value="entrada_fixa">
          {isEntradaFixaActive ? (
            <EntradaFixaActiveDashboard
              engine={entradaFixaEngine}
              onTradeRequest={(r: 'win' | 'loss') => handleTradeRequest(r, 'entrada_fixa')}
            />
          ) : !isAnyActive ? (
            <div className="space-y-4 pt-2">
              <div className="text-sm text-emerald-400 font-display font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Entrada Fixa — Valor Fixo por Operação
              </div>
              <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg space-y-1">
                <p>💰 <strong>Gerenciamento com entrada fixa por operação</strong></p>
                <p>• Você define o valor fixo de cada entrada</p>
                <p>• Tomou 2 LOSS seguidos? Dia encerrado automaticamente</p>
                <p>• Máximo de entradas por dia configurável</p>
                <p>• Não se apegue ao gráfico — disciplina é tudo!</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Banca (R$)</Label>
                  <Input type="number" value={banca} readOnly className="bg-secondary opacity-70 cursor-not-allowed" />
                </div>
                <div>
                  <Label className="text-xs">Entrada Fixa (R$)</Label>
                  <Input type="number" value={efEntrada} onChange={e => setEfEntrada(e.target.value)} className="bg-secondary" min={1} />
                </div>
                <div>
                  <Label className="text-xs">Máx. Entradas/Dia</Label>
                  <Input type="number" value={efMaxEntradas} onChange={e => setEfMaxEntradas(e.target.value)} className="bg-secondary" min={1} />
                </div>
                <div>
                  <Label className="text-xs">Payout (%)</Label>
                  <Input type="number" value={efPayout} onChange={e => setEfPayout(e.target.value)} className="bg-secondary" min={1} />
                </div>
              </div>
              <Button onClick={handleEntradaFixaIniciar} className="w-full gradient-gold text-primary-foreground font-display gap-2">
                <Play className="w-4 h-4" /> Iniciar Gerenciamento
              </Button>
            </div>
          ) : null}
        </TabsContent>

        {/* SOROS x4 Tab */}
        <TabsContent value="soros4x">
          {isSorosActive ? (
            <SorosGameUI engine={sorosEngine} modeInfo={{ label: 'Soros x4', desc: 'Risco fixo por tentativa', color: 'text-primary' }} onTradeRequest={(r: 'win' | 'loss') => handleTradeRequest(r, 'soros')} />
          ) : !isAnyActive ? (
            <div className="space-y-4 pt-2">
              <div className="text-sm text-primary font-display font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Soros x4 — Risco Fixo por Tentativa
              </div>
              <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg space-y-1">
                <p>📊 <strong>Cada tentativa é um ciclo Soros com 4 níveis (N1→N4)</strong></p>
                <p>• Risco máximo por tentativa = Banca ÷ Tentativas</p>
                <p>• Para zerar a banca, você teria que perder TODAS as tentativas</p>
                <p>• O Soros acontece apenas dentro do saldo do ciclo (risco travado)</p>
                <p>• Exemplo: Banca R$1000, 10 tentativas → Risco R$100/tentativa</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Banca (R$)</Label>
                  <Input type="number" value={sorosBanca} readOnly className="bg-secondary opacity-70 cursor-not-allowed" />
                </div>
                <div>
                  <Label className="text-xs">Tentativas (mín. 10)</Label>
                  <Input type="number" value={sorosTentativas} onChange={e => setSorosTentativas(e.target.value)} min={10} className="bg-secondary" />
                </div>
              </div>
              {sorosErrors.length > 0 && (
                <div className="text-xs text-destructive space-y-1">
                  {sorosErrors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
                </div>
              )}
              <Button onClick={handleSorosIniciar} className="w-full gradient-gold text-primary-foreground font-display gap-2">
                <Play className="w-4 h-4" /> Iniciar Gerenciamento
              </Button>
            </div>
          ) : null}
        </TabsContent>

        {/* Other 3 tabs */}
        {(['conservador', 'intermediario', 'agressivo'] as ManagementMode[]).map(mode => (
          <TabsContent key={mode} value={mode}>
            {isManagementActive && s.mode === mode ? (
              <ActiveDashboard engine={engine} info={MODE_INFO[mode]} entradaAtual={entradaAtual}
                lossProgress={lossProgress} winProgress={winProgress} tradeProgress={tradeProgress}
                onTradeRequest={(r: 'win' | 'loss') => handleTradeRequest(r, 'engine')} />
            ) : !isAnyActive ? (
              <SetupForm
                mode={mode} info={MODE_INFO[mode]}
                banca={banca}
                riscoPct={riscoPct} setRiscoPct={setRiscoPct}
                stopLossPct={stopLossPct} setStopLossPct={setStopLossPct}
                stopWinPct={stopWinPct} setStopWinPct={setStopWinPct}
                maxTrades={maxTrades} setMaxTrades={setMaxTrades}
                payoutInput={payoutInput} setPayoutInput={setPayoutInput}
                sorosAtivo={sorosAtivo} setSorosAtivo={setSorosAtivo}
                sorosMax={sorosMax} setSorosMax={setSorosMax}
                martingaleAtivo={martingaleAtivo} setMartingaleAtivo={setMartingaleAtivo}
                onIniciar={handleIniciar}
              />
            ) : null}
          </TabsContent>
        ))}
      </Tabs>

      {/* Trade Confirm Dialog */}
      <TradeConfirmDialog
        open={confirmOpen}
        resultado={pendingResult}
        onConfirm={handleTradeConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Soros Trophy Dialog */}
      <SorosTrophyDialog
        open={trophyOpen}
        onOpenChange={setTrophyOpen}
        lucro={trophyLucro}
        tentativasGanhas={trophyGanhas}
      />

      {/* Soros Daily Limit Warning */}
      <Dialog open={showDailyWarning} onOpenChange={setShowDailyWarning}>
        <DialogContent className="bg-card border-primary/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary font-display">
              <AlertTriangle className="w-5 h-5" /> Recomendação Diária
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Proteja seus ganhos</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">
                🏆 Você já completou <strong className="text-primary">{sorosEngine.state.tentativasGanhas} ciclo(s)</strong> de Soros hoje!
              </p>
              <p className="text-sm text-foreground leading-relaxed mt-2">
                Lucro acumulado: <strong className={sorosEngine.state.lucroSessao >= 0 ? 'win-text' : 'loss-text'}>
                  R$ {sorosEngine.state.lucroSessao.toFixed(2)}
                </strong>
              </p>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
              <p className="text-xs text-foreground leading-relaxed">
                ⚠️ <strong>É recomendado fazer no máximo 1 ciclo de Soros por dia.</strong> Continuar operando pode colocar em risco o lucro já conquistado. Disciplina é a chave para a consistência!
              </p>
            </div>
            <Button
              onClick={() => { setShowDailyWarning(false); setDailyWarningAcked(true); }}
              className="w-full gradient-gold text-primary-foreground font-display"
            >
              Entendi, vou avaliar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Active Dashboard for conservador/intermediario/agressivo
function ActiveDashboard({ engine, info, entradaAtual, lossProgress, winProgress, tradeProgress, onTradeRequest }: any) {
  const s = engine.state;

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Banca Inicial" value={`R$ ${s.bancaInicial.toFixed(2)}`} />
        <StatCard label="Banca Atual" value={`R$ ${s.bancaAtual.toFixed(2)}`} highlight />
        <StatCard label="Entrada Atual" value={`R$ ${entradaAtual.toFixed(2)}`} />
        <StatCard label="Risco/Trade" value={`${s.riscoPct}%`} />
        <StatCard label="Wins" value={String(s.winsDoDia)} win />
        <StatCard label="Losses" value={String(s.lossesDoDia)} loss />
        <StatCard label="Trades" value={`${s.tradesDoDia}/${s.maxTrades}`} />
        <StatCard label="Lucro Sessão" value={`R$ ${s.lucroSessao.toFixed(2)}`} highlight={s.lucroSessao >= 0} loss={s.lucroSessao < 0} />
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Stop Loss ({s.stopLossPct}%)</span>
            <span>{lossProgress.toFixed(0)}%</span>
          </div>
          <Progress value={lossProgress} className="h-2 [&>div]:bg-destructive" />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Stop Win ({s.stopWinPct}%)</span>
            <span>{winProgress.toFixed(0)}%</span>
          </div>
          <Progress value={winProgress} className="h-2 [&>div]:bg-success" />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Trades do Dia</span>
            <span>{s.tradesDoDia}/{s.maxTrades}</span>
          </div>
          <Progress value={tradeProgress} className="h-2" />
        </div>
      </div>

      {/* Soros indicator */}
      {s.sorosAtivo && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-xs">
          <span className="font-display font-bold text-primary">Soros: </span>
          {s.sorosLevel > 0 ? (
            <span className="text-foreground">Nível {s.sorosLevel}/{s.sorosMaxLevel} — Saldo ciclo: R$ {s.sorosSaldoCiclo.toFixed(2)}</span>
          ) : (
            <span className="text-muted-foreground">Aguardando win para iniciar ciclo</span>
          )}
        </div>
      )}

      {/* Anti dia ruim indicator */}
      {s.antiDiaRuimAtivo && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-2 text-xs text-accent font-display font-bold">
          ⚠️ Anti Dia Ruim Ativo — Stake reduzido, 1 operação adicional
        </div>
      )}

      {/* Alerts */}
      {s.alertas.length > 0 && (
        <div className="space-y-1">
          {s.alertas.map((a: string, i: number) => (
            <div key={i} className="text-xs p-2 rounded bg-accent/10 border border-accent/30 text-accent">
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Message */}
      {s.mensagem && (
        <div className={`text-xs p-3 rounded-lg border ${
          s.mensagem.includes('✅') || s.mensagem.includes('🎯') ? 'bg-success/10 border-success/30 win-text' :
          s.mensagem.includes('❌') || s.mensagem.includes('🚫') ? 'bg-destructive/10 border-destructive/30 text-destructive' :
          'bg-primary/10 border-primary/30 text-primary'
        }`}>
          {s.mensagem}
        </div>
      )}

      {/* Action Buttons */}
      {!s.encerrado && !s.bloqueado && (
        <div className="flex gap-3">
          <Button onClick={() => onTradeRequest?.('win') || engine.registrarResultado('win')} className="flex-1 bg-success/20 text-success hover:bg-success/30 gap-2 border border-success/30">
            <CheckCircle className="w-4 h-4" /> WIN
          </Button>
          <Button onClick={() => onTradeRequest?.('loss') || engine.registrarResultado('loss')} className="flex-1 bg-destructive/20 text-destructive hover:bg-destructive/30 gap-2 border border-destructive/30">
            <XCircle className="w-4 h-4" /> LOSS
          </Button>
        </div>
      )}

      {(s.encerrado || s.bloqueado) && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground font-display">Sessão encerrada</p>
          <Button onClick={engine.resetar} variant="outline" size="sm" className="mt-2 gap-1">
            <RotateCcw className="w-3 h-3" /> Novo Ciclo
          </Button>
        </div>
      )}

      {/* History */}
      {s.historico.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-secondary/50 p-2">
            <h4 className="text-[10px] font-display text-muted-foreground font-bold">Histórico</h4>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {s.historico.map((h: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 text-[10px] border-b border-border/30 gap-1">
                <span className="text-foreground font-medium">T{h.tentativa}</span>
                <span className="text-muted-foreground">R$ {h.entrada.toFixed(2)}</span>
                <span className={h.resultado === 'win' ? 'win-text font-bold' : 'loss-text font-bold'}>{h.resultado.toUpperCase()}</span>
                <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${
                  h.entryType === 'soros' ? 'bg-primary/20 text-primary' :
                  h.entryType === 'martingale' ? 'bg-destructive/20 text-destructive' :
                  h.entryType === 'anti_dia_ruim' ? 'bg-accent/20 text-accent' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {h.entryType === 'soros' ? `Soros N${h.sorosLevel}` : h.entryType === 'anti_dia_ruim' ? 'Anti Ruim' : h.entryType}
                </span>
                <span className={`font-bold ${h.lucro >= 0 ? 'win-text' : 'loss-text'}`}>
                  {h.lucro >= 0 ? '+' : ''}R$ {h.lucro.toFixed(2)}
                </span>
                <span className="text-muted-foreground">B: R$ {h.bancaAtual.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SetupForm({ mode, info, banca, riscoPct, setRiscoPct, stopLossPct, setStopLossPct, stopWinPct, setStopWinPct, maxTrades, setMaxTrades, payoutInput, setPayoutInput, sorosAtivo, setSorosAtivo, sorosMax, setSorosMax, martingaleAtivo, setMartingaleAtivo, onIniciar }: any) {
  return (
    <div className="space-y-4 pt-2">
      <div className={`text-sm ${info.color} font-display font-bold flex items-center gap-2`}>
        <info.icon className="w-4 h-4" /> {info.label}
      </div>

      {mode === 'conservador' && (
        <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg space-y-1">
          <p>🛡️ <strong>Proteção total da banca + Anti Dia Ruim</strong></p>
          <p>• Risco: {info.riskRange} da banca</p>
          <p>• Stop Loss: {info.stopLoss} | Stop Win: {info.stopWin}</p>
          <p>• Após 2 perdas consecutivas → modo Anti Dia Ruim (stake ÷ 2, 1 op. extra)</p>
          <p>• Se perder novamente → dia encerrado automaticamente</p>
        </div>
      )}
      {mode === 'intermediario' && (
        <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg space-y-1">
          <p>⚖️ <strong>Crescimento controlado</strong></p>
          <p>• Entrada fixa: máximo {info.riskRange} da banca</p>
          <p>• Stop Loss: {info.stopLoss} | Stop Win: {info.stopWin}</p>
          <p>• Limite de trades por dia configurável</p>
          <p>• Aviso de risco moderado e drawdown</p>
        </div>
      )}
      {mode === 'agressivo' && (
        <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg space-y-1">
          <p>🔥 <strong>Alto risco / alto retorno</strong></p>
          <p>• Stake: {info.riskRange} da banca</p>
          <p>• Stop Loss: {info.stopLoss} | Stop Win: {info.stopWin}</p>
          <p>• Martingale e Soros opcionais</p>
          <p>• Indicador visual de risco elevado</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Banca (R$)</Label>
          <Input type="number" value={banca} readOnly className="bg-secondary opacity-70 cursor-not-allowed" />
        </div>
        <div>
          <Label className="text-xs">Risco por Trade (%)</Label>
          <Input type="number" value={riscoPct} onChange={e => setRiscoPct(e.target.value)} className="bg-secondary"
            min={mode === 'conservador' ? 0.5 : mode === 'intermediario' ? 1 : 3}
            max={mode === 'conservador' ? 1 : mode === 'intermediario' ? 2 : 5}
            step={0.5} />
        </div>
        <div>
          <Label className="text-xs">Stop Loss Diário (%)</Label>
          <Input type="number" value={stopLossPct} onChange={e => setStopLossPct(e.target.value)} className="bg-secondary" />
        </div>
        <div>
          <Label className="text-xs">Stop Win Diário (%)</Label>
          <Input type="number" value={stopWinPct} onChange={e => setStopWinPct(e.target.value)} className="bg-secondary" />
        </div>
        <div>
          <Label className="text-xs">Máx. Trades/Dia</Label>
          <Input type="number" value={maxTrades} onChange={e => setMaxTrades(e.target.value)} className="bg-secondary" />
        </div>
        <div>
          <Label className="text-xs">Payout (%)</Label>
          <Input type="number" value={payoutInput} onChange={e => setPayoutInput(e.target.value)} className="bg-secondary" />
        </div>
      </div>

      {mode === 'agressivo' && (
        <div className="space-y-3 border border-destructive/20 rounded-lg p-3 bg-destructive/5">
          <p className="text-[10px] text-destructive font-display font-bold">⚡ Opções Avançadas</p>
          <div className="flex items-center gap-3">
            <Switch checked={sorosAtivo} onCheckedChange={setSorosAtivo} />
            <Label className="text-xs">Ativar Soros</Label>
            {sorosAtivo && (
              <Input type="number" value={sorosMax} onChange={e => setSorosMax(e.target.value)} className="bg-secondary w-20" min={2} max={6} placeholder="Níveis" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={martingaleAtivo} onCheckedChange={setMartingaleAtivo} />
            <Label className="text-xs">Ativar Martingale</Label>
          </div>
        </div>
      )}

      <Button onClick={onIniciar} className="w-full gradient-gold text-primary-foreground font-display gap-2">
        <Play className="w-4 h-4" /> Iniciar Gerenciamento
      </Button>
    </div>
  );
}

function StatCard({ label, value, highlight, win, loss }: { label: string; value: string; highlight?: boolean; win?: boolean; loss?: boolean }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs font-display font-bold ${win ? 'win-text' : loss ? 'loss-text' : highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}

// Active Dashboard for Entrada Fixa module
function EntradaFixaActiveDashboard({ engine, onTradeRequest }: { engine: ReturnType<typeof import('@/hooks/useEntradaFixaEngine').useEntradaFixaEngine>; onTradeRequest: (r: 'win' | 'loss') => void }) {
  const s = engine.state;
  const tradeProgress = s.maxEntradas > 0 ? (s.entradasRealizadas / s.maxEntradas) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Banca Inicial" value={`R$ ${s.bancaInicial.toFixed(2)}`} />
        <StatCard label="Banca Atual" value={`R$ ${s.bancaAtual.toFixed(2)}`} highlight />
        <StatCard label="Entrada Fixa" value={`R$ ${s.entradaFixa.toFixed(2)}`} />
        <StatCard label="Entradas" value={`${s.entradasRealizadas}/${s.maxEntradas}`} />
        <StatCard label="Wins" value={String(s.winsTotal)} win />
        <StatCard label="Losses" value={String(s.lossesTotal)} loss />
        <StatCard label="Perdas Seguidas" value={String(s.perdaSequencial)} loss={s.perdaSequencial > 0} />
        <StatCard label="Lucro Sessão" value={`R$ ${s.lucroSessao.toFixed(2)}`} highlight={s.lucroSessao >= 0} loss={s.lucroSessao < 0} />
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Entradas do Dia</span>
          <span>{s.entradasRealizadas}/{s.maxEntradas}</span>
        </div>
        <Progress value={tradeProgress} className="h-2" />
      </div>

      {s.perdaSequencial >= 1 && !s.encerrado && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-2 text-xs text-accent font-display font-bold">
          ⚠️ {s.perdaSequencial} loss seguido — mais 1 e o dia encerra automaticamente!
        </div>
      )}

      {s.mensagem && (
        <div className={`text-xs p-3 rounded-lg border ${
          s.mensagem.includes('✅') ? 'bg-success/10 border-success/30 win-text' :
          s.mensagem.includes('❌') || s.mensagem.includes('🚫') || s.mensagem.includes('⏹️') ? 'bg-destructive/10 border-destructive/30 text-destructive' :
          'bg-primary/10 border-primary/30 text-primary'
        }`}>
          {s.mensagem}
        </div>
      )}

      {!s.encerrado && (
        <div className="flex gap-3">
          <Button onClick={() => onTradeRequest('win')} className="flex-1 bg-success/20 text-success hover:bg-success/30 gap-2 border border-success/30">
            <CheckCircle className="w-4 h-4" /> WIN
          </Button>
          <Button onClick={() => onTradeRequest('loss')} className="flex-1 bg-destructive/20 text-destructive hover:bg-destructive/30 gap-2 border border-destructive/30">
            <XCircle className="w-4 h-4" /> LOSS
          </Button>
        </div>
      )}

      {s.encerrado && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground font-display">Sessão encerrada</p>
          <Button onClick={engine.resetar} variant="outline" size="sm" className="mt-2 gap-1">
            <RotateCcw className="w-3 h-3" /> Novo Ciclo
          </Button>
        </div>
      )}

      {s.historico.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-secondary/50 p-2">
            <h4 className="text-[10px] font-display text-muted-foreground font-bold">Histórico de Entradas</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">#</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Entrada</th>
                  <th className="px-2 py-1.5 text-center text-muted-foreground font-medium">Resultado</th>
                  <th className="px-2 py-1.5 text-right text-muted-foreground font-medium">Lucro</th>
                  <th className="px-2 py-1.5 text-right text-muted-foreground font-medium">Prejuízo</th>
                  <th className="px-2 py-1.5 text-right text-muted-foreground font-medium">Banca</th>
                </tr>
              </thead>
              <tbody>
                {[...s.historico].reverse().map((h, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-2 py-1.5 text-foreground font-medium">{h.numero}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">R$ {h.entrada.toFixed(2)}</td>
                    <td className={`px-2 py-1.5 text-center font-bold ${h.resultado === 'win' ? 'win-text' : 'loss-text'}`}>
                      {h.resultado.toUpperCase()}
                    </td>
                    <td className="px-2 py-1.5 text-right win-text">{h.lucro > 0 ? `R$ ${h.lucro.toFixed(2)}` : ''}</td>
                    <td className="px-2 py-1.5 text-right loss-text">{h.prejuizo > 0 ? `R$ ${h.prejuizo.toFixed(2)}` : ''}</td>
                    <td className="px-2 py-1.5 text-right text-foreground font-medium">R$ {h.bancaAtual.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-secondary/50 p-2 flex justify-between text-[10px]">
            <span className="text-muted-foreground">Resultado Final:</span>
            <span className={`font-bold ${s.lucroSessao >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {s.lucroSessao.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
