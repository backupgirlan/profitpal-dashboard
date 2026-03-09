import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Brain, Upload, Clock, TrendingUp, Shield, Zap, Star, ImageIcon, BarChart3, Activity, AlertTriangle, CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import SuperVipGate from '@/components/SuperVipGate';
import AccountAnalysis from '@/components/horus/AccountAnalysis';
import TraderDialog from '@/components/horus/TraderDialog';

const POSITIONING_PHRASES = [
  'Horus IA — inteligência aplicada à disciplina do trader',
  'Sua performance lida com dados. Sua mente lida com pressão. A Horus IA observa os dois.',
  'A maioria perde por comportamento, não por estratégia.',
  'Analise seu padrão antes que ele destrua sua banca.',
];

const LOADING_MESSAGES = [
  'Horus IA analisando comportamento...',
  'Horus IA cruzando dados operacionais...',
  'Horus IA interpretando o cenário...',
];

interface BehavioralResult {
  resumo: string;
  padroes_detectados: string[];
  nivel_risco: string;
  recomendacao: string;
}

interface ChartResult {
  cenario: string;
  entrada_estimada: string;
  saida_estimada: string;
  confianca: number;
  timeframe: string;
  analysis_id?: string;
}

const HorusIA = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isSuperVip, setIsSuperVip] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('behavioral');
  const [tone, setTone] = useState('equilibrado');
  const [focus, setFocus] = useState('geral');
  const [behavioralQuery, setBehavioralQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('M5');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [printAnalyses, setPrintAnalyses] = useState<any[]>([]);

  // Loading states
  const [behaviorLoading, setBehaviorLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // Results
  const [behaviorResult, setBehaviorResult] = useState<BehavioralResult | null>(null);
  const [chartResult, setChartResult] = useState<ChartResult | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pending feedback (prints without result)
  const [pendingPrints, setPendingPrints] = useState<any[]>([]);
  const [pendingFeedbackLoading, setPendingFeedbackLoading] = useState<string | null>(null);

  // Global wins/losses from print analyses
  const [globalPrintWins, setGlobalPrintWins] = useState(0);
  const [globalPrintLosses, setGlobalPrintLosses] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('is_super_vip').eq('user_id', user.id).single(),
      supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
    ]).then(([profileRes, roleRes]) => {
      setIsSuperVip(!!(profileRes.data as any)?.is_super_vip);
      setIsAdmin(!!roleRes.data);
    });
    loadHistory();
    loadPendingPrints();
    loadGlobalPrintStats();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setPhraseIdx(i => (i + 1) % POSITIONING_PHRASES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    if (!user) return;
    const [{ data: a }, { data: p }] = await Promise.all([
      supabase.from('horus_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('horus_print_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]);
    if (a) setAnalyses(a);
    if (p) setPrintAnalyses(p);
  };

  const loadPendingPrints = async () => {
    if (!user) return;
    const { data } = await supabase.from('horus_print_analyses')
      .select('*')
      .eq('user_id', user.id)
      .is('result', null)
      .order('created_at', { ascending: false });
    if (data) setPendingPrints(data);
  };

  const loadGlobalPrintStats = async () => {
    // Count all wins and losses from print analyses across ALL users (public stats)
    const [{ count: winsCount }, { count: lossesCount }] = await Promise.all([
      supabase.from('horus_print_analyses').select('*', { count: 'exact', head: true }).eq('result', 'win'),
      supabase.from('horus_print_analyses').select('*', { count: 'exact', head: true }).eq('result', 'loss'),
    ]);
    setGlobalPrintWins(winsCount || 0);
    setGlobalPrintLosses(lossesCount || 0);
  };

  const sendPendingFeedback = async (analysisId: string, result: 'win' | 'loss') => {
    setPendingFeedbackLoading(analysisId);
    try {
      await supabase.from('horus_print_analyses').update({ result }).eq('id', analysisId);
      setPendingPrints(prev => prev.filter(p => p.id !== analysisId));
      toast({ title: result === 'win' ? '✅ WIN registrado!' : '❌ LOSS registrado!', description: 'Resultado salvo com sucesso.' });
      loadHistory();
      loadGlobalPrintStats();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' });
    } finally {
      setPendingFeedbackLoading(null);
    }
  };

  const runBehavioralAnalysis = async () => {
    if (!session) return;
    setBehaviorLoading(true);
    setBehaviorResult(null);
    const msgs = LOADING_MESSAGES;
    let idx = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => { idx = (idx + 1) % msgs.length; setLoadingMsg(msgs[idx]); }, 2000);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/horus-behavior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tone, focus, query: behavioralQuery }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: 'Erro', description: data.error || 'Falha na análise', variant: 'destructive' });
        return;
      }
      setBehaviorResult(data);
      loadHistory();
      toast({ title: 'Análise concluída', description: 'Horus IA finalizou sua análise comportamental.' });
    } catch (e) {
      toast({ title: 'Erro', description: 'A Horus IA está temporariamente indisponível.', variant: 'destructive' });
    } finally {
      clearInterval(interval);
      setBehaviorLoading(false);
      setLoadingMsg('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Formato inválido', description: 'Use PNG, JPG ou WEBP.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 5MB.', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        handleFileSelect({ target: { files: dt.files } } as any);
      }
    }
  }, []);

  const pastedFileRef = useRef<File | null>(null);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
          if (!allowed.includes(file.type)) return;
          if (file.size > 5 * 1024 * 1024) return;
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          pastedFileRef.current = file;
          toast({ title: 'Print colado', description: 'Pressione Enter para analisar automaticamente.' });
        }
        break;
      }
    }
  }, [toast]);

  const runChartAnalysisRef = useRef<() => void>(() => {});

  const handleKeyDownAnalysis = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && pastedFileRef.current && !chartLoading) {
      e.preventDefault();
      pastedFileRef.current = null;
      runChartAnalysisRef.current();
    }
  }, [chartLoading]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDownAnalysis);
    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDownAnalysis);
    };
  }, [handlePaste, handleKeyDownAnalysis]);

  const validarHorarioEntrada = (horarioSugerido: string): boolean => {
    if (!horarioSugerido || horarioSugerido === '--:--') return false;
    const agora = new Date();
    const [horas, minutos] = horarioSugerido.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos)) return false;
    const sugestao = new Date();
    sugestao.setHours(horas, minutos, 0, 0);
    return sugestao >= agora;
  };

  const runChartAnalysis = async () => {
    if (!session || !selectedFile) return;
    setChartLoading(true);
    setChartResult(null);
    setFeedbackSent(false);
    setLoadingMsg('Horus IA interpretando o cenário...');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('timeframe', selectedTimeframe);

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/horus-chart-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: 'Erro', description: data.error || 'Falha na análise', variant: 'destructive' });
        return;
      }

      if (data.entrada_estimada && !validarHorarioEntrada(data.entrada_estimada)) {
        data._horario_expirado = true;
      }

      setChartResult(data);
      loadHistory();
      loadPendingPrints();
      toast({ title: 'Análise concluída', description: data._horario_expirado ? 'Atenção: horário de entrada já expirou.' : 'Print analisado pela Horus IA.' });
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível interpretar a imagem enviada.', variant: 'destructive' });
    } finally {
      setChartLoading(false);
      setLoadingMsg('');
    }
  };
  runChartAnalysisRef.current = runChartAnalysis;

  const sendFeedback = async (result: 'win' | 'loss') => {
    if (!chartResult?.analysis_id || feedbackSent) return;
    setFeedbackLoading(true);
    try {
      await supabase.from('horus_print_analyses').update({ result }).eq('id', chartResult.analysis_id);
      setFeedbackSent(true);
      setPendingPrints(prev => prev.filter(p => p.id !== chartResult.analysis_id));
      toast({ title: result === 'win' ? '✅ WIN registrado!' : '❌ LOSS registrado!', description: 'Feedback salvo. A Horus IA usará este dado para melhorar futuras análises.' });
      loadHistory();
      loadGlobalPrintStats();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar o feedback.', variant: 'destructive' });
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (isSuperVip === null) return null;
  if (!isSuperVip && !isAdmin) return <SuperVipGate />;

  const riskColor = (r: string) => r === 'alto' ? 'text-destructive' : r === 'medio' ? 'text-primary' : 'text-success';
  const totalGlobalPrints = globalPrintWins + globalPrintLosses;
  const globalWinRate = totalGlobalPrints > 0 ? ((globalPrintWins / totalGlobalPrints) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center box-glow-strong">
              <Eye className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary text-glow">HORUS IA</h1>
              <p className="text-base text-muted-foreground font-medium tracking-wider mt-1">ASSISTENTE INTELIGENTE DE PERFORMANCE</p>
            </div>
            <Badge className="ml-auto gradient-gold text-primary-foreground border-0 font-display text-sm px-4 py-1.5">
              <Star className="w-4 h-4 mr-1.5" /> SUPER VIP
            </Badge>
          </div>
          <motion.p key={phraseIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-lg text-muted-foreground italic max-w-2xl">
            "{POSITIONING_PHRASES[phraseIdx]}"
          </motion.p>
        </div>
      </motion.div>

      {/* Pending Prints Alert */}
      <AnimatePresence>
        {pendingPrints.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-orange-400/30 bg-orange-400/5">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                  <p className="text-base font-display font-bold text-orange-400">
                    {pendingPrints.length} {pendingPrints.length === 1 ? 'análise aguardando' : 'análises aguardando'} resultado
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Preencha o resultado (WIN/LOSS) de cada print analisado para que a Horus IA aprenda com seus dados.
                </p>
                <div className="space-y-3">
                  {pendingPrints.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <ImageIcon className="w-5 h-5 text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-display text-foreground truncate">
                            {p.scenario === 'compra' ? '🟢 Compra' : p.scenario === 'venda' ? '🔴 Venda' : '⚪ Inconclusivo'}
                            {' '} — Confiança: {p.confidence}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(p.created_at).toLocaleString('pt-BR')} • {p.timeframe}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendPendingFeedback(p.id, 'win')}
                          disabled={pendingFeedbackLoading === p.id}
                          className="gap-1.5 border-success/30 bg-success/10 text-success hover:bg-success/20 text-sm h-9 px-4"
                        >
                          {pendingFeedbackLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          WIN
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendPendingFeedback(p.id, 'loss')}
                          disabled={pendingFeedbackLoading === p.id}
                          className="gap-1.5 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm h-9 px-4"
                        >
                          {pendingFeedbackLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          LOSS
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        {[
          { icon: Brain, label: 'Análises', value: analyses.length, color: 'text-primary' },
          { icon: ImageIcon, label: 'Prints', value: printAnalyses.length, color: 'text-blue-400' },
          { icon: CheckCircle, label: 'Wins (Global)', value: globalPrintWins, color: 'text-success' },
          { icon: XCircle, label: 'Losses (Global)', value: globalPrintLosses, color: 'text-destructive' },
          { icon: Activity, label: 'Win Rate Global', value: globalWinRate + '%', color: 'text-primary' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-base text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/80 border border-border/50 w-full justify-start flex-wrap h-auto gap-2 p-2">
          <TabsTrigger value="behavioral" className="gap-2 font-display text-base py-3 px-5"><Brain className="w-5 h-5" /> Comportamental</TabsTrigger>
          <TabsTrigger value="print" className="gap-2 font-display text-base py-3 px-5 relative">
            <ImageIcon className="w-5 h-5" /> Print
            {pendingPrints.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-400 text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                {pendingPrints.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 font-display text-base py-3 px-5"><BarChart3 className="w-5 h-5" /> Análise da Conta</TabsTrigger>
          <TabsTrigger value="dialog" className="gap-2 font-display text-base py-3 px-5"><MessageSquare className="w-5 h-5" /> Diálogo do Trader</TabsTrigger>
          <TabsTrigger value="history" className="gap-2 font-display text-base py-3 px-5"><Clock className="w-5 h-5" /> Histórico</TabsTrigger>
        </TabsList>

        {/* Behavioral Analysis */}
        <TabsContent value="behavioral" className="space-y-5 mt-5">
          <Card className="border-primary/10 bg-card/80">
            <CardHeader className="pb-5">
              <CardTitle className="text-2xl font-display text-foreground flex items-center gap-3">
                <Brain className="w-7 h-7 text-primary" /> Análise Comportamental do Trader
              </CardTitle>
              <p className="text-base text-muted-foreground mt-2">
                A Horus IA analisa seus dados de operações, gestão, diário emocional e padrões de comportamento.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-base font-medium text-muted-foreground mb-2.5 block">Tom da IA</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-secondary h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acolhedor" className="text-base">🤝 Acolhedor</SelectItem>
                      <SelectItem value="equilibrado" className="text-base">⚖️ Equilibrado</SelectItem>
                      <SelectItem value="firme" className="text-base">💪 Firme</SelectItem>
                      <SelectItem value="verdade_dura" className="text-base">🔥 Verdade Dura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-base font-medium text-muted-foreground mb-2.5 block">Foco da Análise</label>
                  <Select value={focus} onValueChange={setFocus}>
                    <SelectTrigger className="bg-secondary h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral" className="text-base">Visão Geral</SelectItem>
                      <SelectItem value="emocional" className="text-base">Padrão Emocional</SelectItem>
                      <SelectItem value="gestao" className="text-base">Gestão de Banca</SelectItem>
                      <SelectItem value="disciplina" className="text-base">Disciplina</SelectItem>
                      <SelectItem value="tilt" className="text-base">Detecção de Tilt</SelectItem>
                      <SelectItem value="horarios" className="text-base">Horários de Operação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-base font-medium text-muted-foreground mb-2.5 block">Pergunta ou contexto adicional (opcional)</label>
                <Textarea placeholder="Ex: Quero entender meu padrão após perdas consecutivas..." value={behavioralQuery} onChange={e => setBehavioralQuery(e.target.value)} className="bg-secondary min-h-[110px] text-base" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">⚠️ Análise de performance e autoconhecimento. Não substitui acompanhamento profissional.</p>
                <Button className="gradient-gold text-primary-foreground font-display gap-2 h-12 px-8 text-base" onClick={runBehavioralAnalysis} disabled={behaviorLoading}>
                  {behaviorLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  {behaviorLoading ? 'Analisando...' : 'Analisar'}
                </Button>
              </div>

              {/* Loading */}
              <AnimatePresence>
                {behaviorLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="border border-primary/20 rounded-xl bg-primary/5 p-8 text-center space-y-4">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-14 h-14 mx-auto rounded-xl gradient-gold flex items-center justify-center">
                      <Eye className="w-7 h-7 text-primary-foreground" />
                    </motion.div>
                    <p className="text-base text-primary font-display">{loadingMsg}</p>
                    <div className="space-y-2.5">
                      <Skeleton className="h-5 w-3/4 mx-auto" />
                      <Skeleton className="h-5 w-1/2 mx-auto" />
                      <Skeleton className="h-5 w-2/3 mx-auto" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Behavior Result */}
              <AnimatePresence>
                {behaviorResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="border border-primary/20 rounded-xl bg-card p-7 space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-display text-primary flex items-center gap-2"><Eye className="w-5 h-5" /> RESULTADO DA ANÁLISE</p>
                      <Badge variant="outline" className={`text-base px-4 py-1.5 ${riskColor(behaviorResult.nivel_risco)}`}>
                        Risco: {behaviorResult.nivel_risco.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-lg text-foreground leading-relaxed">{behaviorResult.resumo}</p>
                    {behaviorResult.padroes_detectados.length > 0 && (
                      <div>
                        <p className="text-base text-muted-foreground mb-3 font-display">PADRÕES DETECTADOS</p>
                        <div className="space-y-3">
                          {behaviorResult.padroes_detectados.map((p, i) => (
                            <div key={i} className="flex items-start gap-3 text-base text-foreground leading-relaxed">
                              <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" />
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="border-t border-border/50 pt-5">
                      <p className="text-base text-muted-foreground mb-3 font-display">RECOMENDAÇÃO</p>
                      <p className="text-lg text-foreground font-medium leading-relaxed">{behaviorResult.recomendacao}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data Sources */}
              <Card className="border-border/50 bg-card/60">
                <CardContent className="p-6">
                  <p className="text-base font-display text-muted-foreground mb-4">FONTES DE DADOS ANALISADAS</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Gestão de Banca', 'Registro de Operações', 'Diário Emocional', 'Checklist',
                      'Modo Disciplina', 'Score Consistência', 'Histórico W/L', 'Horários',
                      'Overtrading', 'Sinais de Tilt', 'Patentes', 'Evolução da Banca',
                      'Pós-Loss', 'Pós-Win', 'Fora do Plano', 'Relatórios'
                    ].map(src => (
                      <div key={src} className="flex items-center gap-2.5 text-base text-muted-foreground">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary/60" /> {src}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Print Analysis */}
        <TabsContent value="print" className="space-y-5 mt-5">
          <Card className="border-primary/10 bg-card/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-display text-foreground flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-blue-400" /> Análise de Print do Gráfico
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Envie um print do gráfico para receber análise probabilística de cenário.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Timeframe</label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="bg-secondary w-36 h-11 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M5">M5</SelectItem>
                    <SelectItem value="M15">M15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Tips */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                <p className="text-sm font-display text-primary flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Dicas para melhor leitura</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-5 list-disc">
                  <li><strong className="text-primary">⏱ Envie o print nos últimos 30 segundos do candle</strong> para maior precisão da leitura</li>
                  <li>Inclua a <strong>régua de preço</strong> (lateral) e <strong>régua de tempo</strong> (inferior)</li>
                  <li>Confirme que o timeframe ({selectedTimeframe}) está visível no canto do gráfico</li>
                  <li>Use prints com boa resolução e contraste nítido entre candles e fundo</li>
                </ul>
              </div>

              {/* Upload Area */}
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileSelect} className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer"
              >
              {previewUrl ? (
                  <div className="space-y-4">
                    <img src={previewUrl} alt="Preview" className="max-h-56 mx-auto rounded-lg border border-border/50" />
                    <p className="text-sm text-muted-foreground">{selectedFile?.name} • Clique para trocar</p>
                    <p className="text-xs text-primary font-display animate-pulse">✨ Print pronto! Pressione Enter ou clique em Analisar Print</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-base text-foreground font-medium">Arraste, clique ou cole (Ctrl+V) para enviar o print</p>
                    <p className="text-sm text-muted-foreground mt-1.5">PNG, JPG, WEBP até 5MB</p>
                    <p className="text-xs text-primary/60 mt-2">💡 Dica: Cole o print com Ctrl+V e pressione Enter para análise automática</p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">⚠️ Análise probabilística. Não representa garantia de resultado.</p>
                <Button className="gradient-gold text-primary-foreground font-display gap-2 h-11 px-6 text-sm" onClick={runChartAnalysis} disabled={chartLoading || !selectedFile}>
                  {chartLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  {chartLoading ? 'Analisando...' : 'Analisar Print'}
                </Button>
              </div>

              {/* Loading */}
              <AnimatePresence>
                {chartLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="border border-primary/20 rounded-xl bg-primary/5 p-6 text-center space-y-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 mx-auto rounded-xl gradient-gold flex items-center justify-center">
                      <Eye className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                    <p className="text-sm text-primary font-display">{loadingMsg}</p>
                    <Skeleton className="h-20 w-full" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chart Result */}
              <AnimatePresence>
                {chartResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`border rounded-xl p-5 space-y-3 ${chartResult.cenario === 'compra' ? 'border-success/30 bg-success/5' : chartResult.cenario === 'venda' ? 'border-destructive/30 bg-destructive/5' : 'border-border/50 bg-card'}`}>
                    <p className="text-sm font-display text-primary flex items-center gap-2"><Eye className="w-4 h-4" /> RESULTADO DA LEITURA</p>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cenário</p>
                        <p className={`text-2xl font-display font-bold ${chartResult.cenario === 'compra' ? 'text-success' : chartResult.cenario === 'venda' ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {chartResult.cenario === 'compra' ? '🟢 COMPRA' : chartResult.cenario === 'venda' ? '🔴 VENDA' : '⚪ INCONCLUSIVO'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Confiança</p>
                        <p className="text-2xl font-display font-bold text-primary">{chartResult.confianca}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Entrada estimada</p>
                        <p className="text-xl font-mono font-bold text-foreground">{chartResult.entrada_estimada}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Saída estimada</p>
                        <p className="text-xl font-mono font-bold text-foreground">{chartResult.saida_estimada}</p>
                      </div>
                    </div>
                    {(chartResult as any)._horario_expirado && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                        <p className="text-xs text-destructive font-medium">Horário de entrada já expirou. Aguarde o próximo candle ou envie um print atualizado.</p>
                      </div>
                    )}
                    {/* Feedback Win/Loss - MANDATORY */}
                    {chartResult.analysis_id && (
                      <div className="border-t border-border/30 pt-3 space-y-2">
                        {feedbackSent ? (
                          <div className="flex items-center gap-2 justify-center py-2">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <p className="text-sm text-muted-foreground font-display">Feedback registrado! A Horus IA irá calibrar futuras análises.</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 justify-center">
                              <AlertTriangle className="w-4 h-4 text-orange-400" />
                              <p className="text-xs text-orange-400 text-center font-display font-bold">
                                OBRIGATÓRIO: Informe o resultado após a operação
                              </p>
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center">
                              A Horus IA aguarda seu feedback para calibrar futuras análises. Você pode preencher depois na aba Print.
                            </p>
                            <div className="flex gap-3 justify-center">
                              <Button
                                variant="outline"
                                onClick={() => sendFeedback('win')}
                                disabled={feedbackLoading}
                                className="gap-2 border-success/30 bg-success/10 text-success hover:bg-success/20 font-display"
                              >
                                {feedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                WIN
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => sendFeedback('loss')}
                                disabled={feedbackLoading}
                                className="gap-2 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 font-display"
                              >
                                {feedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                LOSS
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                      <Badge variant="outline" className="text-xs">{chartResult.timeframe}</Badge>
                      <p className="text-[10px] text-muted-foreground italic">Análise probabilística. Não representa garantia de resultado.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Analysis */}
        <TabsContent value="account" className="mt-4">
          <AccountAnalysis />
        </TabsContent>

        {/* Trader Dialog */}
        <TabsContent value="dialog" className="mt-4">
          <TraderDialog />
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-5 mt-5">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-display text-foreground flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" /> Histórico de Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 && printAnalyses.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma análise realizada ainda.</p>
                  <p className="text-xs text-muted-foreground mt-1">Use a aba Análise Comportamental ou Leitura de Print para começar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...analyses.map(a => ({ ...a, _type: 'behavioral' })), ...printAnalyses.map(p => ({ ...p, _type: 'print' }))]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                        {item._type === 'behavioral' ? (
                          <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">{item._type === 'behavioral' ? 'Comportamental' : `Print ${item.timeframe}`}</Badge>
                            {item._type === 'print' && item.result && (
                              <Badge variant="outline" className={`text-[10px] ${item.result === 'win' ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive'}`}>
                                {item.result === 'win' ? '✅ WIN' : '❌ LOSS'}
                              </Badge>
                            )}
                            {item._type === 'print' && !item.result && (
                              <Badge variant="outline" className="text-[10px] border-orange-400/30 text-orange-400 animate-pulse">
                                ⏳ Aguardando resultado
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString('pt-BR')}</span>
                          </div>
                          {item._type === 'behavioral' ? (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {(() => { try { return JSON.parse(item.response)?.resumo; } catch { return item.response; } })()}
                            </p>
                          ) : (
                            <div className="flex items-center gap-3 text-xs">
                              <span className={item.scenario === 'compra' ? 'text-success font-bold' : 'text-destructive font-bold'}>
                                {item.scenario === 'compra' ? '🟢 Compra' : '🔴 Venda'}
                              </span>
                              <span className="text-muted-foreground">Confiança: {item.confidence}%</span>
                              <span className="text-muted-foreground font-mono">{item.entry_time} → {item.exit_time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HorusIA;
