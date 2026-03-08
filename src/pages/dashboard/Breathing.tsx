import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

type Phase = 'inhale' | 'hold' | 'exhale';
const PHASES: { phase: Phase; duration: number; label: string; color: string }[] = [
  { phase: 'inhale', duration: 4, label: 'Inspirar', color: 'hsl(var(--accent))' },
  { phase: 'hold', duration: 4, label: 'Segurar', color: 'hsl(var(--primary))' },
  { phase: 'exhale', duration: 6, label: 'Expirar', color: 'hsl(var(--success))' },
];
const CYCLE_DURATION = 14; // 4+4+6
const TOTAL_DURATION = 120; // 2 minutes

export default function BreathingPage() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = PHASES[phaseIndex];
  const progress = phaseElapsed / currentPhase.duration;
  const totalProgress = Math.min(elapsed / TOTAL_DURATION, 1);
  const finished = elapsed >= TOTAL_DURATION;

  const tick = useCallback(() => {
    setElapsed(prev => {
      const next = prev + 0.05;
      if (next >= TOTAL_DURATION) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
        return TOTAL_DURATION;
      }
      return next;
    });
    setPhaseElapsed(prev => {
      const next = prev + 0.05;
      if (next >= PHASES[phaseIndex].duration) {
        setPhaseIndex(pi => (pi + 1) % PHASES.length);
        return 0;
      }
      return next;
    });
  }, [phaseIndex]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 50);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  const handleStart = () => { setRunning(true); };
  const handlePause = () => { setRunning(false); };
  const handleReset = () => {
    setRunning(false); setElapsed(0); setPhaseIndex(0); setPhaseElapsed(0);
  };

  // Circle animation scale
  const scale = currentPhase.phase === 'inhale'
    ? 0.6 + 0.4 * progress
    : currentPhase.phase === 'exhale'
    ? 1 - 0.4 * progress
    : 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-3">
          <Wind className="w-6 h-6 text-accent" />
          Respiração do Trader
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reduza a ansiedade e aumente o foco antes de operar. Método 4-4-6.
        </p>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-8 flex flex-col items-center">
          {/* Breathing circle */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            {/* Outer ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="120" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="128" cy="128" r="120" fill="none"
                stroke={currentPhase.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - totalProgress)}
                className="transition-all duration-100"
              />
            </svg>

            {/* Breathing bubble */}
            <motion.div
              animate={{ scale }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="w-40 h-40 rounded-full flex flex-col items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${currentPhase.color}20, ${currentPhase.color}05)`,
                border: `2px solid ${currentPhase.color}40`,
                boxShadow: `0 0 40px ${currentPhase.color}15`,
              }}
            >
              <p className="font-display text-lg font-bold" style={{ color: currentPhase.color }}>
                {finished ? '✓' : currentPhase.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {finished ? 'Concluído' : `${Math.ceil(currentPhase.duration - phaseElapsed)}s`}
              </p>
            </motion.div>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <p className="font-display text-3xl font-bold text-foreground">
              {Math.floor((TOTAL_DURATION - elapsed) / 60)}:{String(Math.floor((TOTAL_DURATION - elapsed) % 60)).padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">tempo restante</p>
          </div>

          {/* Phase indicators */}
          <div className="flex gap-6 mb-6">
            {PHASES.map((p, i) => (
              <div key={p.phase} className={`text-center transition-opacity ${i === phaseIndex && running ? 'opacity-100' : 'opacity-40'}`}>
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: p.color }} />
                <p className="text-xs font-medium" style={{ color: p.color }}>{p.label}</p>
                <p className="text-[10px] text-muted-foreground">{p.duration}s</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!running && !finished && (
              <Button onClick={handleStart} className="gradient-gold text-primary-foreground font-display gap-2 px-8">
                <Play className="w-4 h-4" /> {elapsed > 0 ? 'Continuar' : 'Iniciar'}
              </Button>
            )}
            {running && (
              <Button onClick={handlePause} variant="outline" className="font-display gap-2 px-8">
                <Pause className="w-4 h-4" /> Pausar
              </Button>
            )}
            {(elapsed > 0) && (
              <Button onClick={handleReset} variant="ghost" className="font-display gap-2 text-muted-foreground">
                <RotateCcw className="w-4 h-4" /> Reiniciar
              </Button>
            )}
          </div>

          {finished && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
              <p className="text-sm text-success font-medium">🧘 Sessão concluída!</p>
              <p className="text-xs text-muted-foreground mt-1">Você está mais preparado para operar com disciplina.</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-6">
          <h3 className="font-display text-xs font-bold text-foreground uppercase tracking-wider mb-3">Como funciona</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>A técnica de respiração 4-4-6 é usada por atletas e profissionais de alta performance para reduzir o cortisol e ativar o sistema nervoso parassimpático.</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-center">
                <p className="font-display font-bold text-accent">4s</p>
                <p className="text-xs">Inspirar</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <p className="font-display font-bold text-primary">4s</p>
                <p className="text-xs">Segurar</p>
              </div>
              <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
                <p className="font-display font-bold text-success">6s</p>
                <p className="text-xs">Expirar</p>
              </div>
            </div>
            <p>Pratique por 2 minutos antes de cada sessão de trading para aumentar o foco e reduzir decisões impulsivas.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
