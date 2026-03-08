import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import {
  Youtube, Send, LogIn, Brain, Shield, Target, BookOpen, Zap,
  AlertTriangle, TrendingDown, BarChart3, Award, Users, CheckCircle,
  XCircle, ChevronDown, ChevronUp, Calendar, ArrowRight, Heart,
  Flame, Lock, Eye, LineChart, Activity
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";

interface LiveScore { day_of_week: number; wins: number; losses: number; }
interface MonthlyScore { month_start: string; wins: number; losses: number; }

const DAY_LABELS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_LABELS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const FloatingStatsToggle = () => {
  const [withManagement, setWithManagement] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setWithManagement(prev => !prev), 3500);
    return () => clearInterval(interval);
  }, []);

  const stats = withManagement
    ? [
        { value: "2x0", label: "Modelo", color: "text-primary" },
        { value: "5%", label: "Quebram", color: "text-success" },
        { value: "100", label: "Score", color: "text-primary" },
      ]
    : [
        { value: "???", label: "Sem plano", color: "text-destructive" },
        { value: "95%", label: "Quebram", color: "text-destructive" },
        { value: "12", label: "Score", color: "text-destructive" },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="mt-16 max-w-md mx-auto"
    >
      <motion.div
        animate={{ opacity: [0.5, 1] }}
        transition={{ duration: 0.4 }}
        className="mb-3 text-center"
      >
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-display uppercase tracking-widest border transition-all duration-500 ${
          withManagement
            ? 'text-success border-success/30 bg-success/10'
            : 'text-destructive border-destructive/30 bg-destructive/10'
        }`}>
          {withManagement ? (
            <><CheckCircle className="w-3 h-3" /> Com Gerenciamento</>
          ) : (
            <><XCircle className="w-3 h-3" /> Sem Gerenciamento</>
          )}
        </span>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={`${withManagement}-${i}`}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`bg-card/80 backdrop-blur border rounded-xl p-4 text-center transition-colors duration-500 ${
              withManagement ? 'border-border/50' : 'border-destructive/30'
            }`}
          >
            <p className={`text-2xl font-display font-black ${s.color} transition-colors duration-500`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const HorusIAShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [typedText, setTypedText] = useState('');
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Brain,
      title: "Análise Comportamental",
      desc: "IA analisa seu histórico de operações, score de disciplina e padrões emocionais para gerar insights personalizados.",
      mockResponse: "🧠 Análise: Seus últimos 3 losses ocorreram após 15h em dias de alta volatilidade. Seu score cai 23% quando opera recuperando perdas. Recomendação: encerre operações às 14h30 em dias com mais de 2 losses.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    {
      icon: Eye,
      title: "Leitura de Print do Gráfico",
      desc: "Envie prints do gráfico M5 ou M15 e receba análise probabilística com pontos de entrada, cenários e confiança.",
      mockResponse: "📊 Cenário: Tendência de alta com suporte em 1.0842. Entrada sugerida: 1.0855 (rompimento). Confiança: 78%. Timeframe: M15. ⚠️ Atenção: resistência forte em 1.0890, considere parcial.",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
    },
    {
      icon: Shield,
      title: "Alertas de Risco Emocional",
      desc: "Detecta automaticamente quando você está em estado emocional de risco e sugere pausas antes que o colapso aconteça.",
      mockResponse: "🔴 ALERTA: 3 losses consecutivos detectados. Padrão de revenge trading identificado. Valor da última entrada 2x maior que o normal. Recomendação: PARE agora. Sua banca agradece amanhã.",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
    },
    {
      icon: Target,
      title: "Insights de Performance",
      desc: "Métricas avançadas sobre seus melhores horários, pares mais lucrativos e padrões de consistência ao longo do tempo.",
      mockResponse: "📈 Performance: Melhor horário 09h-11h (73% win rate). Par mais lucrativo: EUR/USD (+R$ 342). Dias sem operar emocional: 12. Seu score subiu 18 pontos este mês. Continue assim! 🏆",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
    },
  ];

  useEffect(() => {
    if (!isInView) return;
    const response = features[activeFeature].mockResponse;
    setTypedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < response.length) {
        setTypedText(response.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [activeFeature, isInView]);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isInView]);

  const ActiveIcon = features[activeFeature].icon;

  return (
    <section ref={ref} className="py-20 sm:py-28 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-accent rounded-full blur-[180px]" />
        <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-primary rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-14">
          <motion.div variants={fadeUp} className="mb-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-display uppercase tracking-widest text-accent">
              <Eye className="w-3 h-3" /> Super VIP • R$ 29,90/mês
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-4xl font-black text-foreground mb-4">
            Conheça a <span className="text-accent" style={{ textShadow: '0 0 30px hsl(var(--accent) / 0.5)' }}>Horus IA</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
            Assistente de performance com inteligência artificial que analisa seu comportamento e lê gráficos em tempo real.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Feature selector */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {features.map((f, i) => (
              <motion.button
                key={i}
                variants={fadeUp}
                onClick={() => setActiveFeature(i)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-500 group ${
                  activeFeature === i
                    ? `${f.bgColor} ${f.borderColor} shadow-lg`
                    : 'bg-card/50 border-border/50 hover:border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-500 ${
                    activeFeature === i ? f.bgColor : 'bg-secondary'
                  }`}>
                    <f.icon className={`w-5 h-5 transition-colors duration-500 ${
                      activeFeature === i ? f.color : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-display text-sm font-bold transition-colors duration-500 ${
                      activeFeature === i ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{f.title}</h3>
                    <p className={`text-xs mt-1 leading-relaxed transition-all duration-500 ${
                      activeFeature === i ? 'text-muted-foreground opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}>{f.desc}</p>
                  </div>
                </div>
                {/* Progress bar */}
                {activeFeature === i && (
                  <motion.div
                    className="mt-3 h-0.5 rounded-full overflow-hidden bg-border/30"
                  >
                    <motion.div
                      className={`h-full rounded-full ${f.color.replace('text-', 'bg-')}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 8, ease: 'linear' }}
                      key={`progress-${i}-${activeFeature}`}
                    />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Mock AI terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="sticky top-24"
          >
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground ml-2">
                  Horus IA — {features[activeFeature].title}
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-5 min-h-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* User prompt */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="bg-secondary/50 rounded-lg rounded-tl-none px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          {activeFeature === 0 && "Analise meu comportamento dos últimos 7 dias"}
                          {activeFeature === 1 && "Leia este print do gráfico EUR/USD M15"}
                          {activeFeature === 2 && "Como estou emocionalmente hoje?"}
                          {activeFeature === 3 && "Quais são minhas melhores métricas?"}
                        </p>
                      </div>
                    </div>

                    {/* AI response */}
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full ${features[activeFeature].bgColor} flex items-center justify-center shrink-0`}>
                        <ActiveIcon className={`w-3.5 h-3.5 ${features[activeFeature].color}`} />
                      </div>
                      <div className={`rounded-lg rounded-tl-none px-3 py-2 border ${features[activeFeature].borderColor} ${features[activeFeature].bgColor}`}>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                          {typedText}
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-0.5 h-3 bg-foreground ml-0.5 align-middle"
                          />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Terminal footer */}
              <div className="px-4 py-3 border-t border-border bg-secondary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${features[activeFeature].color.replace('text-', 'bg-')} animate-pulse`} />
                  <span className="text-[10px] text-muted-foreground">IA processando...</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-display">
                  Confiança: <span className={`font-bold ${features[activeFeature].color}`}>
                    {activeFeature === 0 ? '94%' : activeFeature === 1 ? '78%' : activeFeature === 2 ? '89%' : '91%'}
                  </span>
                </span>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-center"
            >
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" /> Exclusivo para assinantes Super VIP
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScore[]>([]);
  const [showPastMonths, setShowPastMonths] = useState(false);

  useEffect(() => {
    const getMonday = () => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.setDate(diff)).toISOString().split('T')[0];
    };
    supabase.from('live_scores').select('day_of_week, wins, losses').eq('week_start', getMonday())
      .then(({ data }) => { if (data) setScores(data as LiveScore[]); });
    supabase.from('monthly_scores').select('*').order('month_start', { ascending: false })
      .then(({ data }) => { if (data) setMonthlyScores(data as MonthlyScore[]); });
  }, []);

  const problems = [
    { icon: TrendingDown, label: "Tentar recuperar perdas", desc: "Aumentar valor após loss tentando recuperar" },
    { icon: AlertTriangle, label: "Quebrar gerenciamento", desc: "Ignorar regras de stop e proteção" },
    { icon: Brain, label: "Operar emocional", desc: "Raiva, frustração e ansiedade controlando" },
    { icon: Flame, label: "Devolver lucro", desc: "Ganhar e perder tudo por não parar" },
    { icon: Eye, label: "Operar fora do plano", desc: "Entrar em operações sem estratégia" },
  ];

  const modules = [
    { icon: BarChart3, title: "Gestão de Banca Profissional", desc: "Modelos 2x0 e 2x1 com controle total de ciclos, stop automático e valor recomendado por operação.", color: "from-primary/20 to-primary/5" },
    { icon: Brain, title: "Detector de Colapso Emocional", desc: "Check-in emocional obrigatório antes de operar. Identifica estados de risco e alerta o trader.", color: "from-destructive/20 to-destructive/5" },
    { icon: Target, title: "Score de Disciplina", desc: "Pontuação de 0 a 100 baseada em respeito ao plano, consistência e controle emocional.", color: "from-success/20 to-success/5" },
    { icon: Shield, title: "Sistema Anti-Impulso", desc: "Bloqueio automático após losses consecutivos. Pausa obrigatória para proteger a banca.", color: "from-primary/20 to-primary/5" },
    { icon: BookOpen, title: "Diário Psicológico", desc: "Registro diário de emoções, erros e lições. Cria autoconsciência e evolução.", color: "from-accent/20 to-accent/5" },
    { icon: Zap, title: "Alertas Inteligentes", desc: "Detecta padrões de impulso: aumento de valor pós-loss, excesso de operações e horário irregular.", color: "from-primary/20 to-primary/5" },
  ];

  const patents = [
    { emoji: "🟤", name: "Iniciante", desc: "Primeiros passos na disciplina" },
    { emoji: "🥉", name: "Trader Disciplinado", desc: "7 dias respeitando o gerenciamento" },
    { emoji: "🛡️", name: "Protetor da Banca", desc: "30 dias sem quebrar o stop" },
    { emoji: "🥇", name: "Mestre da Consistência", desc: "60 dias sem operação emocional" },
    { emoji: "💎", name: "Imune ao Impulso", desc: "Score 95+ por 90 dias" },
  ];

  // Scoreboard data
  const weekWins = scores.reduce((a, s) => a + s.wins, 0);
  const weekLosses = scores.reduce((a, s) => a + s.losses, 0);
  const currentMonthStart = new Date().toISOString().slice(0, 7);
  const matchingMonth = monthlyScores.find(m => m.month_start.startsWith(currentMonthStart));
  const totalMonthWins = (matchingMonth?.wins || 0) + weekWins;
  const totalMonthLosses = (matchingMonth?.losses || 0) + weekLosses;
  const pastMonths = monthlyScores.filter(m => !m.month_start.startsWith(currentMonthStart));

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
          <span className="font-display text-sm sm:text-lg font-bold text-primary text-glow tracking-wider">
            TECHNICAL GIRLAN
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <button onClick={() => navigate("/login")} className="flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-primary-foreground gradient-gold box-glow transition-all hover:scale-105">
              <LogIn className="h-4 w-4" /> Entrar
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-[150px]" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-display uppercase tracking-widest text-primary">
                <Activity className="w-3 h-3" /> Plataforma de Disciplina do Trader
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
              Pare de{" "}
              <span className="text-primary text-glow-strong">destruir sua banca</span>
              <br />por impulso
            </motion.h1>

            <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Sistema completo de gestão de banca, controle emocional e proteção contra o colapso emocional do trader.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate("/register")} className="group flex items-center gap-3 rounded-xl px-8 py-4 font-display text-sm sm:text-base font-bold uppercase tracking-wider text-primary-foreground gradient-gold box-glow-strong transition-all hover:scale-105 hover:shadow-[0_0_50px_hsla(45,100%,50%,0.4)]">
                🟡 Criar Conta
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={() => navigate("/login")} className="flex items-center gap-3 rounded-xl px-8 py-4 font-display text-sm sm:text-base font-bold uppercase tracking-wider text-foreground border border-border bg-card hover:bg-secondary transition-all hover:scale-105">
                ⚫ Acessar Plataforma
              </button>
            </motion.div>
          </motion.div>

          {/* Floating stats - animated toggle */}
          <FloatingStatsToggle />

          {/* Scroll down indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-14 flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-[10px] font-display uppercase tracking-[0.3em] text-muted-foreground">
              Descubra mais
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-6 h-6 text-primary" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              className="-mt-4"
            >
              <ChevronDown className="w-6 h-6 text-primary/40" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 sm:py-28 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-xs font-display uppercase tracking-[0.3em] text-destructive mb-3">O problema real</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-4xl font-black text-foreground mb-4">
              95% dos traders quebram não por estratégia,<br />
              <span className="text-destructive">mas por emocional.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Estes são os comportamentos que destroem contas todos os dias:
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {problems.map((p, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card border border-destructive/20 rounded-xl p-5 text-center hover:border-destructive/40 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-destructive/20 transition-colors">
                  <p.icon className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-display text-xs font-bold text-foreground mb-1">{p.label}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-xs font-display uppercase tracking-[0.3em] text-primary mb-3">A solução</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-4xl font-black text-foreground mb-4">
              Um sistema completo para{" "}
              <span className="text-primary text-glow">proteger</span> sua banca
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Cada módulo foi projetado para resolver um problema específico dos traders.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, i) => (
              <motion.div key={i} variants={fadeUp} className={`bg-gradient-to-br ${m.color} border border-border rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-[0_0_30px_hsla(45,100%,50%,0.1)] group`}>
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mb-4 group-hover:border-primary/40 transition-colors">
                  <m.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground mb-2">{m.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DEMO / MOCKUP SECTION */}
      <section className="py-20 sm:py-28 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-xs font-display uppercase tracking-[0.3em] text-primary mb-3">Demonstração</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-4xl font-black text-foreground mb-4">
              Veja o sistema em ação
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Risco Emocional", value: "BAIXO", icon: Heart, valueColor: "text-success" },
              { label: "Score de Disciplina", value: "92", icon: Target, valueColor: "text-primary" },
              { label: "Operações Hoje", value: "2/2", icon: Activity, valueColor: "text-success" },
              { label: "Banca", value: "+12.4%", icon: LineChart, valueColor: "text-success" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-xl p-5 text-center">
                <item.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className={`text-2xl font-display font-black ${item.valueColor}`}>{item.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Fake chart */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 bg-card border border-border rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-bold text-foreground">Evolução da Banca</h3>
              <span className="text-xs text-success font-bold">+R$ 847,50</span>
            </div>
            <div className="h-32 flex items-end gap-1">
              {[30, 45, 35, 55, 50, 65, 60, 75, 70, 85, 80, 90, 88, 95, 92, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-t transition-all" style={{ height: `${h}%`, background: h > (i > 0 ? [30,45,35,55,50,65,60,75,70,85,80,90,88,95,92,100][i-1] : 0) ? 'hsl(var(--success))' : 'hsl(var(--destructive))', opacity: 0.6 + (i / 32) }} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PATENTS SECTION */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-xs font-display uppercase tracking-[0.3em] text-primary mb-3">Progressão</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-4xl font-black text-foreground mb-4">
              Evolua como trader <span className="text-primary text-glow">disciplinado</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-lg mx-auto">
              Conquiste patentes baseadas em disciplina, não apenas lucro.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {patents.map((p, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-4 bg-card border border-border rounded-xl px-6 py-4 hover:border-primary/30 transition-all group">
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-display text-sm font-bold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-xs font-display font-bold text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors">
                  {i + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* COMMUNITY + SCOREBOARD SECTION */}
      <section className="py-20 sm:py-28 bg-card/50 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-destructive rounded-full blur-[150px]" />
          <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] bg-primary rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-4 py-1.5 text-xs font-display uppercase tracking-widest text-destructive">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" /></span>
                Ao vivo
              </span>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs font-display uppercase tracking-[0.3em] text-primary mb-3">Comunidade</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-4xl font-black text-foreground mb-4">
              Traders disciplinados operando <span className="text-primary text-glow">juntos</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-lg mx-auto">
              Acompanhe nossos resultados em tempo real nas lives diárias.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live schedule */}
            <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_0_40px_hsla(45,100%,50%,0.08)] group">
              <div className="p-3 bg-gradient-to-r from-destructive/10 to-transparent border-b border-border/50">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground">Lives Diárias</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <Youtube className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Seg a Sex</p>
                    <p className="text-2xl font-display font-black text-primary">20h</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                  Operações ao vivo com análise técnica, gerenciamento e disciplina em tempo real.
                </p>
                <div className="flex gap-3">
                  <a href="https://www.youtube.com/@TechnicalGirlan" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3.5 text-sm font-display font-bold text-destructive hover:bg-destructive/20 transition-all hover:scale-[1.02]">
                    <Youtube className="h-5 w-5" /> YouTube
                  </a>
                  <a href="https://t.me/girlananalyst" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-ring/40 bg-ring/10 px-4 py-3.5 text-sm font-display font-bold text-ring hover:bg-ring/20 transition-all hover:scale-[1.02]">
                    <Send className="h-5 w-5" /> Telegram
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Weekly Scoreboard */}
            <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_0_40px_hsla(45,100%,50%,0.08)]">
              <div className="p-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Placar Semanal
                </h3>
              </div>
              <div className="p-6">
                {/* Week totals */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="text-center flex-1 bg-success/10 border border-success/20 rounded-xl p-3">
                    <p className="text-3xl font-display font-black text-success">{weekWins}</p>
                    <p className="text-[10px] text-success/70 uppercase tracking-wider font-display mt-1">Wins</p>
                  </div>
                  <span className="text-xl text-muted-foreground font-black">×</span>
                  <div className="text-center flex-1 bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                    <p className="text-3xl font-display font-black text-destructive">{weekLosses}</p>
                    <p className="text-[10px] text-destructive/70 uppercase tracking-wider font-display mt-1">Losses</p>
                  </div>
                </div>
                {/* Daily breakdown */}
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((dayIdx) => {
                    const score = scores.find(s => s.day_of_week === dayIdx);
                    const wins = score?.wins ?? 0;
                    const losses = score?.losses ?? 0;
                    const total = wins + losses;
                    const winPct = total > 0 ? (wins / total) * 100 : 50;
                    return (
                      <motion.div
                        key={dayIdx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: dayIdx * 0.08 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-xs text-muted-foreground font-display font-bold w-8">{DAY_LABELS_PT[dayIdx]}</span>
                        <div className="flex-1 h-2 rounded-full bg-border/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${winPct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: dayIdx * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-success to-success/60"
                          />
                        </div>
                        <div className="flex items-center gap-2 min-w-[60px] justify-end">
                          <span className="text-xs font-bold text-success">{wins}</span>
                          <span className="text-[10px] text-muted-foreground">/</span>
                          <span className="text-xs font-bold text-destructive">{losses}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Monthly */}
            <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_0_40px_hsla(45,100%,50%,0.08)]">
              <div className="p-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Resultado Mensal
                </h3>
              </div>
              <div className="p-6">
                {/* Current month label */}
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-display uppercase tracking-widest text-primary">
                    {MONTH_LABELS_PT[new Date().getMonth()]} {new Date().getFullYear()}
                  </span>
                </div>

                {/* Current month scores */}
                <div className="flex items-center gap-4 mb-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="text-center flex-1 bg-success/10 border border-success/20 rounded-xl p-4"
                  >
                    <p className="text-4xl font-display font-black text-success">{totalMonthWins}</p>
                    <p className="text-[10px] text-success/70 uppercase tracking-wider font-display mt-1">Wins</p>
                  </motion.div>
                  <span className="text-xl text-muted-foreground font-black">×</span>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: 'spring', delay: 0.1 }}
                    className="text-center flex-1 bg-destructive/10 border border-destructive/20 rounded-xl p-4"
                  >
                    <p className="text-4xl font-display font-black text-destructive">{totalMonthLosses}</p>
                    <p className="text-[10px] text-destructive/70 uppercase tracking-wider font-display mt-1">Losses</p>
                  </motion.div>
                </div>

                {/* Win rate bar */}
                {(totalMonthWins + totalMonthLosses) > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mb-4"
                  >
                    <div className="h-2.5 rounded-full bg-border/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(totalMonthWins / (totalMonthWins + totalMonthLosses)) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-success to-success/60"
                      />
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground mt-1.5">
                      Win Rate: <span className="text-success font-bold">{Math.round((totalMonthWins / (totalMonthWins + totalMonthLosses)) * 100)}%</span>
                    </p>
                  </motion.div>
                )}

                {/* Past months */}
                {pastMonths.length > 0 && (
                  <div className="border-t border-border/30 pt-3">
                    <button
                      onClick={() => setShowPastMonths(!showPastMonths)}
                      className="w-full flex items-center justify-center gap-2 text-xs font-display text-primary hover:text-primary/80 transition-colors py-1.5 rounded-lg hover:bg-primary/5"
                    >
                      {showPastMonths ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {showPastMonths ? 'Ocultar' : 'Ver meses anteriores'}
                    </button>
                    <AnimatePresence>
                      {showPastMonths && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 space-y-1.5">
                            {pastMonths.slice(0, 6).map((m, i) => {
                              const d = new Date(m.month_start);
                              const mTotal = m.wins + m.losses;
                              const mWinPct = mTotal > 0 ? (m.wins / mTotal) * 100 : 0;
                              return (
                                <motion.div
                                  key={m.month_start}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30"
                                >
                                  <span className="text-xs text-muted-foreground font-display w-20 truncate">
                                    {MONTH_LABELS_PT[d.getMonth()].slice(0, 3)} {d.getFullYear()}
                                  </span>
                                  <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-success to-success/60" style={{ width: `${mWinPct}%` }} />
                                  </div>
                                  <div className="flex items-center gap-1.5 min-w-[50px] justify-end">
                                    <span className="text-xs font-bold text-success">{m.wins}</span>
                                    <span className="text-[10px] text-muted-foreground">×</span>
                                    <span className="text-xs font-bold text-destructive">{m.losses}</span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* HORUS IA SECTION */}
      <HorusIAShowcase />

      {/* FINAL CTA */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary rounded-full blur-[200px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6">
              Sua banca não quebra por estratégia.
              <br />
              <span className="text-primary text-glow-strong">Ela quebra quando o emocional assume o controle.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Junte-se à comunidade de traders que escolheram proteger sua banca e operar com disciplina.
            </motion.p>
            <motion.div variants={fadeUp}>
              <button onClick={() => navigate("/register")} className="group inline-flex items-center gap-3 rounded-xl px-10 py-5 font-display text-sm sm:text-lg font-bold uppercase tracking-wider text-primary-foreground gradient-gold box-glow-strong transition-all hover:scale-105 hover:shadow-[0_0_60px_hsla(45,100%,50%,0.5)]">
                🟡 Criar Conta Gratuitamente
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-xs font-bold text-primary tracking-wider">TECHNICAL GIRLAN</span>
          <p className="text-xs text-muted-foreground">Plataforma de disciplina e gestão de banca para traders.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.youtube.com/@TechnicalGirlan" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-destructive transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="https://t.me/girlananalyst" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-ring transition-colors">
              <Send className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
