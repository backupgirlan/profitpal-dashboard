import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react';

interface Props {
  engine: any;
  modeInfo: { label: string; desc: string; color: string };
}

function calcEntradaNivel(mode: string, nivel: number, saldoCiclo: number): number {
  if (mode === 'conservador') {
    const mult = [0.60, 0.70, 0.80, 0.90];
    return +(saldoCiclo * mult[nivel - 1]).toFixed(2);
  }
  return +saldoCiclo.toFixed(2);
}

export default function SorosGameUI({ engine, modeInfo }: Props) {
  const s = engine.state;
  const niveis = [1, 2, 3, 4];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <StatCard label="Banca Inicial" value={`R$ ${s.bancaInicial.toFixed(2)}`} />
        <StatCard label="Banca Atual" value={`R$ ${s.bancaAtual.toFixed(2)}`} highlight />
        <StatCard label="Tentativa" value={`${s.tentativaAtual} de ${s.tentativasTotal}`} />
        <StatCard label="Risco/Tentativa" value={`R$ ${s.riscoOperacional.toFixed(2)}`} />
        <StatCard label="Ganhas" value={String(s.tentativasGanhas)} win />
        <StatCard label="Perdidas" value={String(s.tentativasPerdidas)} loss />
        <StatCard label="Saldo Ciclo" value={`R$ ${s.saldoCiclo.toFixed(2)}`} />
        <StatCard label="Lucro Sessão" value={`R$ ${s.lucroSessao.toFixed(2)}`} highlight={s.lucroSessao >= 0} loss={s.lucroSessao < 0} />
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Você precisa perder {s.tentativasTotal} tentativas para zerar a banca neste módulo.
      </p>

      {/* Message */}
      {s.mensagem && (
        <div className={`text-xs p-3 rounded-lg border ${
          s.mensagem.includes('✅') ? 'bg-success/10 border-success/30 win-text' :
          s.mensagem.includes('❌') || s.mensagem.includes('🚫') ? 'bg-destructive/10 border-destructive/30 text-destructive' :
          'bg-primary/10 border-primary/30 text-primary'
        }`}>
          {s.mensagem}
        </div>
      )}

      {/* Pause overlay */}
      {s.pausado && (
        <div className="text-center space-y-3">
          <p className="text-sm text-accent font-display">⏸️ Gerenciamento Pausado</p>
          <Button onClick={engine.retomar} className="gradient-gold text-primary-foreground gap-2">
            <Play className="w-4 h-4" /> Retomar
          </Button>
        </div>
      )}

      {/* Level Cards */}
      {!s.encerrado && !s.pausado && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {niveis.map(n => {
            const isAtual = n === s.nivelAtual;
            const isCompleto = n < s.nivelAtual;
            const isPendente = n > s.nivelAtual;
            const entrada = isAtual ? calcEntradaNivel(s.mode, n, s.saldoCiclo) : 0;

            return (
              <div key={n} className={`rounded-lg border p-3 text-center space-y-2 transition-all ${
                isAtual ? 'border-primary/50 bg-primary/5 box-glow' :
                isCompleto ? 'border-success/30 bg-success/5' :
                'border-border bg-secondary/30 opacity-50'
              }`}>
                <p className="text-xs font-display font-bold text-foreground">N{n}</p>
                {isAtual && (
                  <>
                    <p className="text-sm font-bold text-primary">R$ {entrada.toFixed(2)}</p>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => engine.registrarResultado('win')} className="flex-1 bg-success/20 text-success hover:bg-success/30 text-xs h-7 gap-1">
                        <CheckCircle className="w-3 h-3" /> WIN
                      </Button>
                      <Button size="sm" onClick={() => engine.registrarResultado('loss')} className="flex-1 bg-destructive/20 text-destructive hover:bg-destructive/30 text-xs h-7 gap-1">
                        <XCircle className="w-3 h-3" /> LOSS
                      </Button>
                    </div>
                  </>
                )}
                {isCompleto && (
                  <span className="text-xs win-text flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> WIN</span>
                )}
                {isPendente && (
                  <span className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      {s.historico.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-secondary/50 p-2">
            <h4 className="text-[10px] font-display text-muted-foreground font-bold">Histórico</h4>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {s.historico.map((h: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 text-[10px] border-b border-border/30">
                <span className="text-foreground">T{h.tentativa} N{h.nivel}</span>
                <span className="text-muted-foreground">R$ {h.entrada.toFixed(2)}</span>
                <span className={h.resultado === 'win' ? 'win-text' : 'loss-text'}>{h.resultado.toUpperCase()}</span>
                <span className="text-muted-foreground">Banca: R$ {h.bancaAtual.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
