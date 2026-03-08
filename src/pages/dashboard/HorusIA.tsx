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

  // Image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Ref to trigger auto-analysis after paste
  const pastedFileRef = useRef<File | null>(null);

  // Ctrl+V paste support — auto-analyze on Enter
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

  // Enter key triggers analysis after paste
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

  // AXIS: Validação de sincronização temporal
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

      // AXIS: Validar se horário sugerido ainda é válido
      if (data.entrada_estimada && !validarHorarioEntrada(data.entrada_estimada)) {
        data._horario_expirado = true;
      }

      setChartResult(data);
      loadHistory();
      toast({ title: 'Análise concluída', description: data._horario_expirado ? 'Atenção: horário de entrada já expirou.' : 'Print analisado pela Horus IA.' });
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível interpretar a imagem enviada.', variant: 'destructive' });
    } finally {
      setChartLoading(false);
      setLoadingMsg('');
    }
  };
  runChartAnalysisRef.current = runChartAnalysis;

  if (isSuperVip === null) return null;
  if (!isSuperVip && !isAdmin) return <SuperVipGate />;

  const riskColor = (r: string) => r === 'alto' ? 'text-destructive' : r === 'medio' ? 'text-primary' : 'text-success';

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center box-glow-strong">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-primary text-glow">HORUS IA</h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wider">ASSISTENTE INTELIGENTE DE PERFORMANCE</p>
            </div>
            <Badge className="ml-auto gradient-gold text-primary-foreground border-0 font-display text-xs">
              <Star className="w-3 h-3 mr-1" /> SUPER VIP
            </Badge>
          </div>
          <motion.p key={phraseIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground italic max-w-xl">
            "{POSITIONING_PHRASES[phraseIdx]}"
          </motion.p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Brain, label: 'Análises', value: analyses.length, color: 'text-primary' },
          { icon: ImageIcon, label: 'Prints', value: printAnalyses.length, color: 'text-blue-400' },
          { icon: Activity, label: 'Confiança Média', value: printAnalyses.length > 0 ? Math.round(printAnalyses.reduce((s, p) => s + (p.confidence || 0), 0) / printAnalyses.length) + '%' : '--', color: 'text-success' },
          { icon: Shield, label: 'Status', value: 'Ativo', color: 'text-primary' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/80 border border-border/50 w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="behavioral" className="gap-2 font-display text-xs"><Brain className="w-4 h-4" /> Comportamental</TabsTrigger>
          <TabsTrigger value="print" className="gap-2 font-display text-xs"><ImageIcon className="w-4 h-4" /> Print</TabsTrigger>
          <TabsTrigger value="account" className="gap-2 font-display text-xs"><BarChart3 className="w-4 h-4" /> Análise da Conta</TabsTrigger>
          <TabsTrigger value="dialog" className="gap-2 font-display text-xs"><MessageSquare className="w-4 h-4" /> Diálogo do Trader</TabsTrigger>
          <TabsTrigger value="history" className="gap-2 font-display text-xs"><Clock className="w-4 h-4" /> Histórico</TabsTrigger>
        </TabsList>

        {/* Behavioral Analysis */}
        <TabsContent value="behavioral" className="space-y-4 mt-4">
          <Card className="border-primary/10 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display text-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> Análise Comportamental do Trader
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                A Horus IA analisa seus dados de operações, gestão, diário emocional e padrões de comportamento.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tom da IA</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acolhedor">🤝 Acolhedor</SelectItem>
                      <SelectItem value="equilibrado">⚖️ Equilibrado</SelectItem>
                      <SelectItem value="firme">💪 Firme</SelectItem>
                      <SelectItem value="verdade_dura">🔥 Verdade Dura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Foco da Análise</label>
                  <Select value={focus} onValueChange={setFocus}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Visão Geral</SelectItem>
                      <SelectItem value="emocional">Padrão Emocional</SelectItem>
                      <SelectItem value="gestao">Gestão de Banca</SelectItem>
                      <SelectItem value="disciplina">Disciplina</SelectItem>
                      <SelectItem value="tilt">Detecção de Tilt</SelectItem>
                      <SelectItem value="horarios">Horários de Operação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pergunta ou contexto adicional (opcional)</label>
                <Textarea placeholder="Ex: Quero entender meu padrão após perdas consecutivas..." value={behavioralQuery} onChange={e => setBehavioralQuery(e.target.value)} className="bg-secondary min-h-[80px]" />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">⚠️ Análise de performance e autoconhecimento. Não substitui acompanhamento profissional.</p>
                <Button className="gradient-gold text-primary-foreground font-display gap-2" onClick={runBehavioralAnalysis} disabled={behaviorLoading}>
                  {behaviorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {behaviorLoading ? 'Analisando...' : 'Analisar'}
                </Button>
              </div>

              {/* Loading */}
              <AnimatePresence>
                {behaviorLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="border border-primary/20 rounded-xl bg-primary/5 p-6 text-center space-y-3">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-12 h-12 mx-auto rounded-xl gradient-gold flex items-center justify-center">
                      <Eye className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                    <p className="text-sm text-primary font-display">{loadingMsg}</p>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 mx-auto" />
                      <Skeleton className="h-4 w-1/2 mx-auto" />
                      <Skeleton className="h-4 w-2/3 mx-auto" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Behavior Result */}
              <AnimatePresence>
                {behaviorResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="border border-primary/20 rounded-xl bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-display text-primary flex items-center gap-2"><Eye className="w-3 h-3" /> RESULTADO DA ANÁLISE</p>
                      <Badge variant="outline" className={`text-xs ${riskColor(behaviorResult.nivel_risco)}`}>
                        Risco: {behaviorResult.nivel_risco.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{behaviorResult.resumo}</p>
                    {behaviorResult.padroes_detectados.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 font-display">PADRÕES DETECTADOS</p>
                        <div className="space-y-1.5">
                          {behaviorResult.padroes_detectados.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs text-muted-foreground mb-1 font-display">RECOMENDAÇÃO</p>
                      <p className="text-sm text-foreground font-medium">{behaviorResult.recomendacao}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data Sources */}
              <Card className="border-border/50 bg-card/60">
                <CardContent className="p-4">
                  <p className="text-xs font-display text-muted-foreground mb-3">FONTES DE DADOS ANALISADAS</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Gestão de Banca', 'Registro de Operações', 'Diário Emocional', 'Checklist',
                      'Modo Disciplina', 'Score Consistência', 'Histórico W/L', 'Horários',
                      'Overtrading', 'Sinais de Tilt', 'Patentes', 'Evolução da Banca',
                      'Pós-Loss', 'Pós-Win', 'Fora do Plano', 'Relatórios'
                    ].map(src => (
                      <div key={src} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" /> {src}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Print Analysis */}
        <TabsContent value="print" className="space-y-4 mt-4">
          <Card className="border-primary/10 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" /> Análise de Print do Gráfico
              </CardTitle>
              <p className="text-xs text-muted-foreground">Envie um print do gráfico para receber análise probabilística de cenário.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Timeframe</label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="bg-secondary w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M5">M5</SelectItem>
                    <SelectItem value="M15">M15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Tips */}
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 space-y-1">
                <p className="text-xs font-display text-primary flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Dicas para melhor leitura</p>
                <ul className="text-[11px] text-muted-foreground space-y-0.5 ml-4 list-disc">
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
                className="border-2 border-dashed border-border/60 rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer"
              >
                {previewUrl ? (
                  <div className="space-y-3">
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg border border-border/50" />
                    <p className="text-xs text-muted-foreground">{selectedFile?.name} • Clique para trocar</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-foreground font-medium">Arraste ou clique para enviar o print</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP até 5MB</p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">⚠️ Análise probabilística. Não representa garantia de resultado.</p>
                <Button className="gradient-gold text-primary-foreground font-display gap-2" onClick={runChartAnalysis} disabled={chartLoading || !selectedFile}>
                  {chartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
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
                    <p className="text-xs font-display text-primary flex items-center gap-2"><Eye className="w-3 h-3" /> RESULTADO DA LEITURA</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Cenário</p>
                        <p className={`text-xl font-display font-bold ${chartResult.cenario === 'compra' ? 'text-success' : chartResult.cenario === 'venda' ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {chartResult.cenario === 'compra' ? '🟢 COMPRA' : chartResult.cenario === 'venda' ? '🔴 VENDA' : '⚪ INCONCLUSIVO'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confiança</p>
                        <p className="text-xl font-display font-bold text-primary">{chartResult.confianca}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Entrada estimada</p>
                        <p className="text-lg font-mono font-bold text-foreground">{chartResult.entrada_estimada}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Saída estimada</p>
                        <p className="text-lg font-mono font-bold text-foreground">{chartResult.saida_estimada}</p>
                      </div>
                    </div>
                    {(chartResult as any)._horario_expirado && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                        <p className="text-xs text-destructive font-medium">Horário de entrada já expirou. Aguarde o próximo candle ou envie um print atualizado.</p>
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
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Histórico de Análises
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
