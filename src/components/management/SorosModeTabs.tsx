import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSorosEngine, ManagementMode } from '@/hooks/useSorosEngine';
import SorosGameUI from './SorosGameUI';
import { TrendingUp, Shield, BarChart3, Zap, Pencil } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODE_INFO: Record<ManagementMode, { label: string; icon: any; desc: string; color: string }> = {
  soros4x: { label: 'Soros x4', icon: TrendingUp, desc: 'Risco fixo por tentativa', color: 'text-primary' },
  conservador: { label: 'Conservador', icon: Shield, desc: 'Trava forte, risco -30%', color: 'text-blue-400' },
  baixo_risco: { label: 'Baixo Risco', icon: BarChart3, desc: 'Equilibrado, uso contínuo', color: 'win-text' },
  agressivo: { label: 'Agressivo', icon: Zap, desc: 'Risco +30%, max performance', color: 'text-destructive' },
  livre: { label: 'Livre', icon: Pencil, desc: 'Defina suas próprias entradas', color: 'text-accent' },
};

export default function SorosModeTabs({ open, onOpenChange }: Props) {
  const engine = useSorosEngine();
  const [tab, setTab] = useState<ManagementMode>('soros4x');

  // Form state
  const [banca, setBanca] = useState('1000');
  const [tentativas, setTentativas] = useState('10');
  const [payoutInput, setPayoutInput] = useState('80');
  const [turbo, setTurbo] = useState(false);
  const [metaDiaria, setMetaDiaria] = useState('');
  const [stopDiario, setStopDiario] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (Number(banca) <= 0) errs.push('Banca inválida.');
    if (Number(tentativas) < 10) errs.push('Mínimo 10 tentativas.');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleIniciar = () => {
    if (!validate()) return;
    engine.iniciar({
      mode: tab,
      banca: Number(banca),
      tentativas: Number(tentativas),
      payout: Number(payoutInput) / 100,
      turbo: tab === 'agressivo' ? turbo : false,
      metaDiaria: Number(metaDiaria) || 0,
      stopDiario: Number(stopDiario) || 0,
    });
  };

  const isActive = engine.state.ativo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-glow">Módulos de Gerenciamento</DialogTitle>
          <DialogDescription>Escolha o modo e configure seus parâmetros</DialogDescription>
        </DialogHeader>

        <Tabs value={isActive ? engine.state.mode : tab} onValueChange={(v) => !isActive && setTab(v as ManagementMode)}>
          <TabsList className="grid grid-cols-5 w-full bg-secondary">
            {(Object.keys(MODE_INFO) as ManagementMode[]).map(mode => {
              const info = MODE_INFO[mode];
              return (
                <TabsTrigger key={mode} value={mode} disabled={isActive && engine.state.mode !== mode} className="text-xs gap-1 data-[state=active]:bg-primary/20">
                  <info.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{info.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(MODE_INFO) as ManagementMode[]).map(mode => (
            <TabsContent key={mode} value={mode}>
              {isActive && engine.state.mode === mode ? (
                <SorosGameUI engine={engine} modeInfo={MODE_INFO[mode]} />
              ) : isActive ? null : (
                <SetupForm
                  mode={mode}
                  info={MODE_INFO[mode]}
                  banca={banca} setBanca={setBanca}
                  tentativas={tentativas} setTentativas={setTentativas}
                  payoutInput={payoutInput} setPayoutInput={setPayoutInput}
                  turbo={turbo} setTurbo={setTurbo}
                  metaDiaria={metaDiaria} setMetaDiaria={setMetaDiaria}
                  stopDiario={stopDiario} setStopDiario={setStopDiario}
                  errors={errors}
                  onIniciar={handleIniciar}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>

        {isActive && (
          <Button variant="destructive" size="sm" onClick={engine.resetar} className="mt-2">
            Resetar Gerenciamento
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SetupForm({ mode, info, banca, setBanca, tentativas, setTentativas, payoutInput, setPayoutInput, turbo, setTurbo, metaDiaria, setMetaDiaria, stopDiario, setStopDiario, errors, onIniciar }: any) {
  return (
    <div className="space-y-4 pt-2">
      <div className={`text-sm ${info.color} font-display font-bold`}>{info.desc}</div>

      {mode === 'soros4x' && (
        <p className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg">
          Cada tentativa é um ciclo Soros x4. Risco fixo por tentativa. Para zerar a banca, você teria que perder TODAS as tentativas.
        </p>
      )}
      {mode === 'conservador' && (
        <p className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg">
          Modo Conservador: risco reduzido (-30%) e pausa automática com 2 perdas seguidas. Entradas escalonadas por nível.
        </p>
      )}
      {mode === 'baixo_risco' && (
        <p className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg">
          Modo Baixo Risco: risco fixo por tentativa e Soros x4 padrão. Sem travas, com alertas leves.
        </p>
      )}
      {mode === 'agressivo' && (
        <p className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg">
          Modo Agressivo: risco +30% por tentativa, crescimento mais rápido, maior variação. Turbo opcional.
        </p>
      )}
      {mode === 'livre' && (
        <p className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg">
          Modo Livre: você define o risco por tentativa. Soros x4 com entradas personalizadas.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Banca (R$)</Label>
          <Input type="number" value={banca} onChange={e => setBanca(e.target.value)} className="bg-secondary" />
        </div>
        <div>
          <Label className="text-xs">Tentativas (mín. 10)</Label>
          <Input type="number" value={tentativas} onChange={e => setTentativas(e.target.value)} min={10} className="bg-secondary" />
        </div>
        <div>
          <Label className="text-xs">Payout (%)</Label>
          <Input type="number" value={payoutInput} onChange={e => setPayoutInput(e.target.value)} className="bg-secondary" />
        </div>
        {(mode === 'conservador' || mode === 'baixo_risco') && (
          <>
            <div>
              <Label className="text-xs">Meta Diária R$ (opc.)</Label>
              <Input type="number" value={metaDiaria} onChange={e => setMetaDiaria(e.target.value)} className="bg-secondary" placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Stop Diário R$ (opc.)</Label>
              <Input type="number" value={stopDiario} onChange={e => setStopDiario(e.target.value)} className="bg-secondary" placeholder="0" />
            </div>
          </>
        )}
        {mode === 'agressivo' && (
          <div className="flex items-center gap-3 col-span-2">
            <Switch checked={turbo} onCheckedChange={setTurbo} />
            <Label className="text-xs">Turbo (+5% reinvestimento por win)</Label>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="text-xs text-destructive space-y-1">
          {errors.map((e: string, i: number) => <p key={i}>⚠️ {e}</p>)}
        </div>
      )}

      {!payoutInput && (
        <p className="text-xs text-accent">⚠️ Recomendado informar payout para cálculo real do Soros.</p>
      )}

      <Button onClick={onIniciar} className="w-full gradient-gold text-primary-foreground font-display">
        Iniciar Gerenciamento
      </Button>
    </div>
  );
}
