import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, MessageSquare, ChevronRight, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HARD_TRUTH_MESSAGES = [
  'Pare agora. O próximo erro tende a vir da tentativa de recuperar, não da falta de análise.',
  'Você já está na zona onde muitos traders destroem o dia inteiro tentando consertar duas perdas.',
  'Sua melhor decisão agora não é buscar uma entrada melhor. É preservar sua mente e sua banca.',
  'Voltar amanhã com clareza vale mais do que insistir hoje com pressão.',
  'Dois losses seguidos já são suficientes para mudar seu estado mental. Respeite isso.',
];

const POSITION_PHRASES = [
  'A maioria quebra depois da segunda perda, não na primeira.',
  'Seu comportamento após o loss vale mais do que sua análise antes da entrada.',
  'Disciplina não é só entrar bem. É saber parar na hora certa.',
  'Preservar o dia é mais inteligente do que tentar salvá-lo no impulso.',
];

interface ProtectionModeOverlayProps {
  consecutiveLosses: number;
  lockoutMinutes?: number;
  onDismiss: () => void;
  onOpenDialog: () => void;
}

export default function ProtectionModeOverlay({
  consecutiveLosses,
  lockoutMinutes = 15,
  onDismiss,
  onOpenDialog,
}: ProtectionModeOverlayProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(lockoutMinutes * 60);
  const [msgIdx] = useState(() => Math.floor(Math.random() * HARD_TRUTH_MESSAGES.length));
  const [phraseIdx] = useState(() => Math.floor(Math.random() * POSITION_PHRASES.length));
  const [accepted, setAccepted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAcceptStop = async () => {
    if (!user) return;
    await supabase.from('protection_mode_events').insert({
      user_id: user.id,
      consecutive_losses: consecutiveLosses,
      status: 'accepted_stop',
      unlocked_at: new Date().toISOString(),
    });
    setAccepted(true);
    onDismiss();
  };

  const handleOpenDialog = async () => {
    if (!user) return;
    await supabase.from('protection_mode_events').insert({
      user_id: user.id,
      consecutive_losses: consecutiveLosses,
      status: 'opened_dialog',
    });
    onOpenDialog();
  };

  const handleForceUnlock = async () => {
    if (!user || timeLeft > 0) return;
    await supabase.from('protection_mode_events').insert({
      user_id: user.id,
      consecutive_losses: consecutiveLosses,
      status: 'force_continued',
      unlocked_at: new Date().toISOString(),
    });
    onDismiss();
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0808 50%, #0d0d0d 100%)',
          border: '1px solid rgba(220,38,38,0.3)',
          boxShadow: '0 0 80px rgba(220,38,38,0.15), 0 0 160px rgba(0,0,0,0.9)',
        }}
      >
        {/* Red top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center border-b border-red-900/30">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-16 h-16 mx-auto rounded-2xl border-2 border-red-500/40 flex items-center justify-center mb-4"
            style={{ background: 'rgba(220,38,38,0.1)' }}
          >
            <Shield className="w-8 h-8 text-red-400" />
          </motion.div>
          <h1 className="text-2xl font-display font-black text-red-400 tracking-tight mb-1">
            MODO PROTEÇÃO ATIVADO
          </h1>
          <p className="text-sm text-red-300/70">
            {consecutiveLosses} perdas seguidas detectadas · Risco de impulsividade aumentado
          </p>
        </div>

        {/* Main content */}
        <div className="px-6 py-5 space-y-5">
          {/* Main message */}
          <div className="p-4 rounded-xl border border-red-900/40 bg-red-950/20 text-center">
            <p className="text-sm text-red-200/90 leading-relaxed">
              A partir daqui, o problema deixa de ser <strong>estratégia</strong> e passa a ser <strong>comportamento</strong>.
            </p>
            <p className="text-sm text-red-200/70 mt-2 leading-relaxed">
              Seu próximo erro pode não ser técnico. Pode ser emocional.
            </p>
          </div>

          {/* Hard truth */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-md gradient-gold flex items-center justify-center">
                <Eye className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Horus IA · Modo Verdade Dura</span>
            </div>
            <p className="text-sm text-foreground/90 italic leading-relaxed">
              "{HARD_TRUTH_MESSAGES[msgIdx]}"
            </p>
          </div>

          {/* Lockout timer */}
          {timeLeft > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-secondary/30">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-muted-foreground">Pausa recomendada ativa:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.span
                  key={timeLeft}
                  initial={{ opacity: 0.6, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="font-mono text-base font-bold text-amber-400"
                >
                  {formatTime(timeLeft)}
                </motion.span>
              </div>
            </div>
          )}

          {/* Positioning phrase */}
          <p className="text-[11px] text-muted-foreground text-center italic">
            "{POSITION_PHRASES[phraseIdx]}"
          </p>

          {/* Actions */}
          <div className="space-y-2.5">
            <Button
              onClick={handleOpenDialog}
              className="w-full h-12 font-display font-bold text-sm gap-2"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))' }}
            >
              <MessageSquare className="w-4 h-4" />
              Conversar com a Horus IA agora
            </Button>

            <Button
              onClick={handleAcceptStop}
              variant="outline"
              className="w-full h-10 border-red-500/30 text-red-300 hover:bg-red-950/30 hover:text-red-200 text-sm"
            >
              🛑 Encerrar o dia — proteger a banca
            </Button>

            {timeLeft <= 0 ? (
              <button
                onClick={handleForceUnlock}
                className="w-full text-[11px] text-muted-foreground/50 hover:text-muted-foreground py-2 transition-colors text-center"
              >
                Continuar mesmo assim (registrado no histórico)
              </button>
            ) : (
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Para continuar operando, aguarde o fim da pausa recomendada.
              </p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="px-6 pb-5 pt-0">
          <div className="flex items-center gap-2 justify-center">
            <AlertTriangle className="w-3 h-3 text-red-400/60" />
            <p className="text-[10px] text-muted-foreground/50 text-center">
              Este evento foi registrado no seu histórico comportamental.
            </p>
          </div>
        </div>

        {/* Red bottom bar */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
      </motion.div>
    </div>
  );
}
