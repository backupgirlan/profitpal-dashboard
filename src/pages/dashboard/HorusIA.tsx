import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Eye, Brain, Upload, Clock, TrendingUp, Shield, Zap, Star, Lock, ChevronRight, ImageIcon, BarChart3, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SuperVipGate from '@/components/SuperVipGate';

const POSITIONING_PHRASES = [
  'Horus IA — inteligência aplicada à disciplina do trader',
  'Sua performance lida com dados. Sua mente lida com pressão. A Horus IA observa os dois.',
  'A maioria perde por comportamento, não por estratégia.',
  'Analise seu padrão antes que ele destrua sua banca.',
];

const HorusIA = () => {
  const { user } = useAuth();
  const [isSuperVip, setIsSuperVip] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('behavioral');
  const [tone, setTone] = useState('equilibrado');
  const [behavioralQuery, setBehavioralQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('M5');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [printAnalyses, setPrintAnalyses] = useState<any[]>([]);

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

  if (isSuperVip === null) return null;
  if (!isSuperVip && !isAdmin) return <SuperVipGate />;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center box-glow-strong">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-primary text-glow">
                HORUS IA
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wider">
                ASSISTENTE INTELIGENTE DE PERFORMANCE
              </p>
            </div>
            <Badge className="ml-auto gradient-gold text-primary-foreground border-0 font-display text-xs">
              <Star className="w-3 h-3 mr-1" /> SUPER VIP
            </Badge>
          </div>
          <motion.p
            key={phraseIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-muted-foreground italic max-w-xl"
          >
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
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
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
        <TabsList className="bg-secondary/80 border border-border/50 w-full justify-start">
          <TabsTrigger value="behavioral" className="gap-2 font-display text-xs">
            <Brain className="w-4 h-4" /> Análise Comportamental
          </TabsTrigger>
          <TabsTrigger value="print" className="gap-2 font-display text-xs">
            <ImageIcon className="w-4 h-4" /> Leitura de Print
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 font-display text-xs">
            <Clock className="w-4 h-4" /> Histórico
          </TabsTrigger>
        </TabsList>

        {/* Behavioral Analysis */}
        <TabsContent value="behavioral" className="space-y-4 mt-4">
          <Card className="border-primary/10 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display text-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Análise Comportamental do Trader
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
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
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
                  <Select defaultValue="geral">
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
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
                <Textarea
                  placeholder="Ex: Quero entender meu padrão após perdas consecutivas..."
                  value={behavioralQuery}
                  onChange={e => setBehavioralQuery(e.target.value)}
                  className="bg-secondary min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  ⚠️ Análise de performance e autoconhecimento. Não substitui acompanhamento profissional.
                </p>
                <Button className="gradient-gold text-primary-foreground font-display gap-2" disabled>
                  <Zap className="w-4 h-4" /> Analisar
                  <Badge variant="outline" className="ml-1 text-[10px] border-primary-foreground/30 text-primary-foreground">Em breve</Badge>
                </Button>
              </div>

              {/* Example Response Preview */}
              <div className="mt-4 border border-border/50 rounded-xl bg-secondary/30 p-4">
                <p className="text-xs font-display text-primary mb-2 flex items-center gap-2">
                  <Eye className="w-3 h-3" /> PRÉVIA DE RESPOSTA
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>"Seu padrão mostra impulsividade após perdas consecutivas."</p>
                  <p>"Você opera melhor entre 19h e 21h."</p>
                  <p>"Seu maior erro recorrente é tentar recuperar prejuízo no mesmo dia."</p>
                  <p>"Seu comportamento indica risco de tilt emocional após devolução de lucro."</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {src}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Print Analysis */}
        <TabsContent value="print" className="space-y-4 mt-4">
          <Card className="border-primary/10 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                Análise de Print do Gráfico
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Envie um print do gráfico para receber análise probabilística de cenário.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Timeframe</label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="bg-secondary w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M5">M5</SelectItem>
                    <SelectItem value="M15">M15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium">Arraste ou clique para enviar o print</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</p>
                <Button variant="outline" className="mt-3 border-primary/30 text-primary gap-2" disabled>
                  <Upload className="w-4 h-4" /> Enviar Print
                  <Badge variant="outline" className="ml-1 text-[10px]">Em breve</Badge>
                </Button>
              </div>

              {/* Response Format Preview */}
              <div className="border border-border/50 rounded-xl bg-secondary/30 p-4">
                <p className="text-xs font-display text-primary mb-3 flex items-center gap-2">
                  <Eye className="w-3 h-3" /> FORMATO DE RESPOSTA
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-success/20">
                    <p className="text-xs text-muted-foreground font-display">EXEMPLO 1</p>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="text-muted-foreground">Cenário:</span> <span className="text-success font-bold">Compra</span></p>
                      <p className="text-sm"><span className="text-muted-foreground">Entrada estimada:</span> <span className="text-foreground font-mono">10:35</span></p>
                      <p className="text-sm"><span className="text-muted-foreground">Saída estimada:</span> <span className="text-foreground font-mono">10:40</span></p>
                      <p className="text-sm"><span className="text-muted-foreground">Confiança:</span> <span className="text-primary font-bold">78%</span></p>
                    </div>
                  </div>
                  <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-destructive/20">
                    <p className="text-xs text-muted-foreground font-display">EXEMPLO 2</p>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="text-muted-foreground">Cenário:</span> <span className="text-destructive font-bold">Venda</span></p>
                      <p className="text-sm"><span className="text-muted-foreground">Entrada estimada:</span> <span className="text-foreground font-mono">14:15</span></p>
                      <p className="text-sm"><span className="text-muted-foreground">Saída estimada:</span> <span className="text-foreground font-mono">14:30</span></p>
                      <p className="text-sm"><span className="text-muted-foreground">Confiança:</span> <span className="text-primary font-bold">82%</span></p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 italic">
                  ⚠️ Análise probabilística, não garantia de resultado.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Histórico de Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 && printAnalyses.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma análise realizada ainda.</p>
                  <p className="text-xs text-muted-foreground mt-1">Suas análises aparecerão aqui quando a Horus IA estiver ativa.</p>
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
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-display text-foreground">
                              {item._type === 'behavioral' ? 'Análise Comportamental' : `Print ${item.timeframe}`}
                            </p>
                            {item.confidence && (
                              <Badge variant="outline" className="text-[10px]">{item.confidence}%</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.response || item.scenario || 'Sem resposta'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(item.created_at).toLocaleString('pt-BR')}
                          </p>
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
