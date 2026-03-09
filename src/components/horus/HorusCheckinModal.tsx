import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Shield, AlertTriangle, CheckCircle, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUESTIONS = [
  {
    id: 'emotional_state',
    label: 'Como você está chegando hoje?',
    subtitle: 'Sua Horus IA precisa saber seu estado emocional real.',
    options: [
      { value: 'calmo', label: '😌 Calmo', risk: 0 },
      { value: 'focado', label: '🎯 Focado', risk: 0 },
      { value: 'cansado', label: '😴 Cansado', risk: 1 },
      { value: 'ansioso', label: '😰 Ansioso', risk: 2 },
      { value: 'irritado', label: '😤 Irritado', risk: 3 },
      { value: 'frustrado', label: '😞 Frustrado', risk: 3 },
    ],
  },
  {
    id: 'motivation',
    label: 'Por que você está aqui hoje?',
    subtitle: 'Sua motivação define seu risco comportamental.',
    options: [
      { value: 'seguindo_plano', label: '📋 Estou seguindo meu plano', risk: 0 },
      { value: 'oportunidade', label: '🔍 Buscando oportunidade normal', risk: 0 },
      { value: 'recuperar_perda', label: '🔄 Tentando recuperar perda', risk: 3 },
      { value: 'pressao_financeira', label: '💸 Estou pressionado financeiramente', risk: 4 },
    ],
  },
  {
    id: 'sleep',
    label: 'Dormiu bem?',
    subtitle: 'Sono é performance. Sem sono, sem foco.',
    options: [
      { value: 'sim', label: '✅ Sim, dormi bem', risk: 0 },
      { value: 'mais_ou_menos', label: '😑 Mais ou menos', risk: 1 },
      { value: 'nao', label: '❌ Não, mal dormi', risk: 2 },
    ],
  },
  {
    id: 'stress',
    label: 'Houve estresse antes de abrir a plataforma?',
    subtitle: 'Problemas externos contaminam decisões internas.',
    options: [
      { value: 'nao', label: '✅ Não, estou tranquilo', risk: 0 },
      { value: 'sim_leve', label: '⚠️ Sim, leve', risk: 1 },
      { value: 'sim_forte', label: '🔴 Sim, forte', risk: 3 },
    ],
  },
  {
    id: 'loss_acceptance',
    label: 'Seu emocional está pronto para aceitar loss sem sair do plano?',
    subtitle: 'Trader que sabe perder, sabe ganhar.',
    options: [
      { value: 'sim', label: '✅ Sim, totalmente pronto', risk: 0 },
      { value: 'nao_tenho_certeza', label: '🤔 Não tenho certeza', risk: 2 },
      { value: 'nao', label: '❌ Não, ainda não', risk: 3 },
    ],
  },
];

const PERSUASION_PHRASES = [
  'Hoje seu maior risco não é o mercado. É o seu estado mental.',
  'Operar assim não é coragem. É exposição desnecessária.',
  'Se você abrir operação nesse estado, a chance de quebrar seu plano sobe muito.',
  'O mercado continua amanhã. Sua banca precisa sobreviver hoje.',
  'Seu histórico mostra que esse tipo de estado costuma terminar em erro.',
];

function getRiskLevel(score: number): { level: string; color: string; icon: any; title: string; message: string } {
  if (score <= 1) return {
    level: 'healthy',
    color: 'text-emerald-400',
    icon: CheckCircle,
    title: 'Momento saudável para operar',
    message: 'Seu estado atual parece adequado para operar. Mantenha disciplina e respeite seu plano.',
  };
  if (score <= 4) return {
    level: 'caution',
    color: 'text-amber-400',
    icon: AlertTriangle,
    title: 'Momento de atenção',
    message: 'Seu estado exige mais cautela hoje. Se decidir operar, faça isso com risco reduzido e total respeito ao gerenciamento.',
  };
  return {
    level: 'high_risk',
    color: 'text-red-400',
    icon: Shield,
    title: 'Momento inadequado para operar',
    message: 'Hoje não parece ser um bom momento para operar. Seu estado atual aumenta fortemente o risco de impulsividade e quebra de plano.',
  };
}

interface HorusCheckinModalProps {
  onComplete: (riskLevel: string) => void;
  onSkip?: () => void;
}

export default function HorusCheckinModal({ onComplete, onSkip }: HorusCheckinModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0); // 0..4 = questions, 5 = result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [totalRisk, setTotalRisk] = useState(0);
  const [saving, setSaving] = useState(false);
  const [persuasionIdx] = useState(() => Math.floor(Math.random() * PERSUASION_PHRASES.length));

  const currentQ = QUESTIONS[step];
  const isResultStep = step === QUESTIONS.length;
  const riskData = getRiskLevel(totalRisk);
  const RiskIcon = riskData.icon;
  const isHighRisk = riskData.level === 'high_risk';

  const handleAnswer = (value: string, risk: number) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    const newTotal = totalRisk + risk;
    setTotalRisk(newTotal);

    setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        setStep(prev => prev + 1);
      } else {
        setStep(QUESTIONS.length); // show result
      }
    }, 300);
  };

  const handlePause = async () => {
    await saveCheckin('paused');
    onComplete('paused');
  };

  const handleContinue = async () => {
    await saveCheckin('ignored_warning');
    onComplete(riskData.level);
  };

  const handleHealthyContinue = async () => {
    await saveCheckin(riskData.level);
    onComplete(riskData.level);
  };

  const saveCheckin = async (decision: string) => {
    if (!user || saving) return;
    setSaving(true);
    const riskLevel = getRiskLevel(totalRisk).level;
    const emotionalState = answers.emotional_state || 'neutro';
    const recoveringLoss = answers.motivation === 'recuperar_perda' || answers.motivation === 'pressao_financeira';
    const sleptWell = answers.sleep === 'sim';
    const hadArgument = answers.stress === 'sim_forte';

    await supabase.from('emotional_checkins').insert({
      user_id: user.id,
      emotional_state: emotionalState,
      had_argument: hadArgument,
      recovering_loss: recoveringLoss,
      slept_well: sleptWell,
      is_risky: riskLevel !== 'healthy',
      proceeded: decision !== 'paused',
      risk_level: riskLevel,
      answers: { ...answers, decision, total_risk_score: totalRisk },
    });
    setSaving(false);
  };

  const progress = isResultStep ? 100 : ((step) / QUESTIONS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-lg bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-2xl"
        style={{ boxShadow: '0 0 60px rgba(212,175,55,0.12), 0 0 120px rgba(0,0,0,0.8)' }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-border/40"
          style={{ background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary)/0.08) 100%)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center box-glow-strong shrink-0">
              <Eye className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Check-in da Horus IA</h2>
              <p className="text-xs text-muted-foreground">Análise comportamental inteligente · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            {onSkip && (
              <button onClick={onSkip} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{isResultStep ? 'Análise concluída' : `Pergunta ${step + 1} de ${QUESTIONS.length}`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.7))' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!isResultStep ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{currentQ.label}</h3>
                  <p className="text-xs text-muted-foreground italic">{currentQ.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {currentQ.options.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(opt.value, opt.risk)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/40 hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 text-sm text-left text-foreground group"
                    >
                      <span>{opt.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                {/* Risk Badge */}
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                  riskData.level === 'healthy' ? 'border-emerald-500/30 bg-emerald-500/5' :
                  riskData.level === 'caution' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-red-500/30 bg-red-500/5'
                }`}>
                  <RiskIcon className={`w-6 h-6 shrink-0 mt-0.5 ${riskData.color}`} />
                  <div>
                    <p className={`text-sm font-bold ${riskData.color}`}>{riskData.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{riskData.message}</p>
                  </div>
                </div>

                {/* Persuasion (high risk only) */}
                {isHighRisk && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl border border-primary/20 bg-primary/5"
                  >
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Horus IA diz:</p>
                    <p className="text-sm text-foreground font-medium italic leading-relaxed">
                      "{PERSUASION_PHRASES[persuasionIdx]}"
                    </p>
                  </motion.div>
                )}

                {/* Positioning phrase */}
                <p className="text-[11px] text-muted-foreground text-center italic">
                  A Horus IA não observa só suas operações. Ela observa seu padrão.
                </p>

                {/* Action buttons */}
                {isHighRisk ? (
                  <div className="space-y-2.5">
                    <Button
                      onClick={handlePause}
                      disabled={saving}
                      className="w-full h-11 gradient-gold text-primary-foreground font-display font-bold text-sm"
                    >
                      🛑 Vou pausar por hoje — banca protegida
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleContinue}
                      disabled={saving}
                      className="w-full h-10 border-border/50 text-muted-foreground hover:text-foreground text-sm"
                    >
                      Quero continuar mesmo assim
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Sua escolha será registrada no seu histórico comportamental.
                    </p>
                  </div>
                ) : riskData.level === 'caution' ? (
                  <div className="space-y-2.5">
                    <Button
                      onClick={handleHealthyContinue}
                      disabled={saving}
                      className="w-full h-11 gradient-gold text-primary-foreground font-display font-bold text-sm"
                    >
                      ⚠️ Continuar com cautela
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePause}
                      disabled={saving}
                      className="w-full h-10 border-border/50 text-muted-foreground text-sm"
                    >
                      Prefiro pausar hoje
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleHealthyContinue}
                    disabled={saving}
                    className="w-full h-11 gradient-gold text-primary-foreground font-display font-bold text-sm"
                  >
                    ✅ Iniciar sessão — estou pronto
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
