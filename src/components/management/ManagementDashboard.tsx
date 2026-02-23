import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useManagementEngine, ManagementMode } from '@/hooks/useManagementEngine';
import { Shield, BarChart3, Zap, CheckCircle, XCircle, AlertTriangle, Play, RotateCcw, Maximize2, Minimize2, TrendingUp, Activity } from 'lucide-react';

interface Props {
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const MODE_INFO: Record<ManagementMode, { label: string; icon: any; desc: string; color: string; riskRange: string; stopLoss: string; stopWin: string }> = {
  conservador: { label: 'Conservador Hard', icon: Shield, desc: 'Proteção total + Anti Dia Ruim', color: 'text-blue-400', riskRange: '0.5% - 1%', stopLoss: '2%', stopWin: '1% - 2%' },
  intermediario: { label: 'Intermediário', icon: BarChart3, desc: 'Crescimento controlado', color: 'win-text', riskRange: '2%', stopLoss: '5%', stopWin: '3% - 5%' },
  agressivo: { label: 'Agressivo', icon: Zap, desc: 'Alto risco / alto retorno', color: 'text-destructive', riskRange: '3% - 5%', stopLoss: '10%', stopWin: '5% - 15%' },
};

export default function ManagementDashboard({ fullscreen, onToggleFullscreen }: Props) {
  const engine = useManagementEngine();
  const s = engine.state;
  const [tab, setTab] = useState<ManagementMode>('conservador');

  // Form state
  const [banca, setBanca] = useState('1000');
  const [riscoPct, setRiscoPct] = useState('1');
  const [stopLossPct, setStopLossPct] = useState('2');
  const [stopWinPct, setStopWinPct] = useState('2');
  const [maxTrades, setMaxTrades] = useState('3');
  const [payoutInput, setPayoutInput] = useState('80');
  const [sorosAtivo, setSorosAtivo] = useState(false);
  const [sorosMax, setSorosMax] = useState('4');
  const [martingaleAtivo, setMartingaleAtivo] = useState(false);

  const handleTabChange = (mode: ManagementMode) => {
    if (s.ativo) return;
    setTab(mode);
    // Set defaults per mode
    if (mode === 'conservador') { setRiscoPct('1'); setStopLossPct('2'); setStopWinPct('2'); setMaxTrades('3'); }
    if (mode === 'intermediario') { setRiscoPct('2'); setStopLossPct('5'); setStopWinPct('3'); setMaxTrades('5'); }
    if (mode === 'agressivo') { setRiscoPct('3'); setStopLossPct('10'); setStopWinPct('5'); setMaxTrades('10'); }
  };

  const handleIniciar = () => {
    if (Number(banca) <= 0) return;
    engine.iniciar({
      mode: tab,
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

  const entradaAtual = engine.getEntradaAtual();
  const isActive = s.ativo;
  const activeMode = isActive ? s.mode : tab;
  const info = MODE_INFO[activeMode];

  // Progress calculations
  const stopLossVal = s.bancaInicial * (s.stopLossPct / 100);
  const stopWinVal = s.bancaInicial * (s.stopWinPct / 100);
  const lossProgress = stopLossVal > 0 && s.lucroSessao < 0 ? Math.min((Math.abs(s.lucroSessao) / stopLossVal) * 100, 100) : 0;
  const winProgress = stopWinVal > 0 && s.lucroSessao > 0 ? Math.min((s.lucroSessao / stopWinVal) * 100, 100) : 0;
  const tradeProgress = s.maxTrades > 0 ? (s.tradesDoDia / s.maxTrades) * 100 : 0;

  // Risk indicator
  const riskLevel = activeMode === 'conservador' ? 'low' : activeMode === 'intermediario' ? 'medium' : 'high';
  const riskColor = riskLevel === 'low' ? 'bg-blue-500' : riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-destructive';
  const riskLabel = riskLevel === 'low' ? 'Risco Baixo' : riskLevel === 'medium' ? 'Risco Moderado' : 'Risco Elevado';

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
          {isActive && (
            <Button variant="destructive" size="sm" onClick={engine.resetar} className="gap-1">
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
      <Tabs value={activeMode} onValueChange={(v) => handleTabChange(v as ManagementMode)}>
        <TabsList className="grid grid-cols-3 w-full bg-secondary">
          {(Object.keys(MODE_INFO) as ManagementMode[]).map(mode => {
            const m = MODE_INFO[mode];
            return (
              <TabsTrigger key={mode} value={mode} disabled={isActive && s.mode !== mode}
                className={`text-xs gap-1.5 data-[state=active]:bg-primary/20 ${isActive && s.mode !== mode ? 'opacity-30' : ''}`}>
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(MODE_INFO) as ManagementMode[]).map(mode => (
          <TabsContent key={mode} value={mode}>
            {isActive && s.mode === mode ? (
              <ActiveDashboard engine={engine} info={MODE_INFO[mode]} entradaAtual={entradaAtual}
                lossProgress={lossProgress} winProgress={winProgress} tradeProgress={tradeProgress} />
            ) : !isActive ? (
              <SetupForm
                mode={mode} info={MODE_INFO[mode]}
                banca={banca} setBanca={setBanca}
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
    </div>
  );
}

// Active Dashboard with all stats and controls
function ActiveDashboard({ engine, info, entradaAtual, lossProgress, winProgress, tradeProgress }: any) {
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
          <Progress value={winProgress} className="h-2 [&>div]:bg-green-500" />
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
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-xs text-yellow-400 font-display font-bold">
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
          s.mensagem.includes('✅') || s.mensagem.includes('🎯') ? 'bg-green-500/10 border-green-500/30 win-text' :
          s.mensagem.includes('❌') || s.mensagem.includes('🚫') ? 'bg-destructive/10 border-destructive/30 text-destructive' :
          'bg-primary/10 border-primary/30 text-primary'
        }`}>
          {s.mensagem}
        </div>
      )}

      {/* Action Buttons */}
      {!s.encerrado && !s.bloqueado && (
        <div className="flex gap-3">
          <Button onClick={() => engine.registrarResultado('win')} className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 gap-2 border border-green-600/30">
            <CheckCircle className="w-4 h-4" /> WIN
          </Button>
          <Button onClick={() => engine.registrarResultado('loss')} className="flex-1 bg-destructive/20 text-destructive hover:bg-destructive/30 gap-2 border border-destructive/30">
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
                  h.entryType === 'anti_dia_ruim' ? 'bg-yellow-500/20 text-yellow-400' :
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

function SetupForm({ mode, info, banca, setBanca, riscoPct, setRiscoPct, stopLossPct, setStopLossPct, stopWinPct, setStopWinPct, maxTrades, setMaxTrades, payoutInput, setPayoutInput, sorosAtivo, setSorosAtivo, sorosMax, setSorosMax, martingaleAtivo, setMartingaleAtivo, onIniciar }: any) {
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
          <Input type="number" value={banca} onChange={e => setBanca(e.target.value)} className="bg-secondary" />
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
