import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
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

          {/* Floating stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-card/80 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-display font-black text-primary">2x0</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Modelo</p>
            </div>
            <div className="bg-card/80 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-display font-black text-success">95%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Quebram</p>
            </div>
            <div className="bg-card/80 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-display font-black text-primary">100</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Score</p>
            </div>
          </motion.div>

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
      <section className="py-20 sm:py-28 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-xs font-display uppercase tracking-[0.3em] text-primary mb-3">Comunidade</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-4xl font-black text-foreground mb-4">
              Traders disciplinados operando <span className="text-primary text-glow">juntos</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live schedule */}
            <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                </span>
                <h3 className="font-display text-sm font-bold text-foreground">Lives Diárias</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Seg a Sex — <span className="text-foreground font-bold">20h</span></p>
              <div className="flex gap-3">
                <a href="https://www.youtube.com/@TechnicalGirlan" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/20 transition-all">
                  <Youtube className="h-5 w-5" /> YouTube
                </a>
                <a href="https://t.me/girlananalyst" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-ring/40 bg-ring/10 px-4 py-3 text-sm font-semibold text-ring hover:bg-ring/20 transition-all">
                  <Send className="h-5 w-5" /> Telegram
                </a>
              </div>
            </motion.div>

            {/* Weekly Scoreboard */}
            <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Placar Semanal
              </h3>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((dayIdx) => {
                  const score = scores.find(s => s.day_of_week === dayIdx);
                  return (
                    <div key={dayIdx} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium w-8">{DAY_LABELS_PT[dayIdx]}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-bold text-success">
                          <CheckCircle className="w-3 h-3" /> {score?.wins ?? 0}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="flex items-center gap-1 font-bold text-destructive">
                          <XCircle className="w-3 h-3" /> {score?.losses ?? 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Monthly */}
            <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Resultado Mensal
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center flex-1 bg-success/10 rounded-lg p-3">
                  <p className="text-2xl font-display font-black text-success">{totalMonthWins}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
                </div>
                <span className="text-lg text-muted-foreground font-bold">×</span>
                <div className="text-center flex-1 bg-destructive/10 rounded-lg p-3">
                  <p className="text-2xl font-display font-black text-destructive">{totalMonthLosses}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Losses</p>
                </div>
              </div>
              {pastMonths.length > 0 && (
                <>
                  <button onClick={() => setShowPastMonths(!showPastMonths)} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                    {showPastMonths ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Ver meses anteriores
                  </button>
                  {showPastMonths && (
                    <div className="mt-2 space-y-1">
                      {pastMonths.slice(0, 6).map(m => {
                        const d = new Date(m.month_start);
                        return (
                          <div key={m.month_start} className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{MONTH_LABELS_PT[d.getMonth()]} {d.getFullYear()}</span>
                            <span><span className="text-success font-bold">{m.wins}</span> × <span className="text-destructive font-bold">{m.losses}</span></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

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
