import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Shield, Zap, RefreshCw, Loader2, Lightbulb, Target, Award, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AccountAnalysisResult {
  score: number;
  risk_level: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  patterns: string[];
  improvements: string[];
  insights: string[];
  final_phrase: string;
}

const LOADING_MSGS = [
  'Horus IA analisando sua conta completa...',
  'Horus IA cruzando dados de operações, gestão e emocional...',
  'Horus IA identificando padrões comportamentais...',
  'Horus IA gerando plano de melhoria...',
];

const PHRASES = [
  'Sua conta deixa rastros. A Horus IA lê esses rastros.',
  'Seu resultado final é reflexo do seu comportamento repetido.',
  'O mercado mostra o preço. Sua conta mostra seus padrões.',
  'Entender seu erro recorrente vale mais do que buscar mais uma entrada.',
];

const scoreLabel = (s: number) => {
  if (s <= 30) return { text: 'Conta em risco', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' };
  if (s <= 50) return { text: 'Comportamento instável', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' };
  if (s <= 70) return { text: 'Trader em evolução', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' };
  if (s <= 85) return { text: 'Trader disciplinado', color: 'text-success', bg: 'bg-success/10 border-success/20' };
  return { text: 'Trader profissional', color: 'text-success', bg: 'bg-success/10 border-success/20' };
};

const riskBadge = (r: string) => {
  const map: Record<string, { text: string; cls: string }> = {
    baixo: { text: 'BAIXO', cls: 'bg-success/20 text-success border-success/30' },
    medio: { text: 'MÉDIO', cls: 'bg-primary/20 text-primary border-primary/30' },
    alto: { text: 'ALTO', cls: 'bg-orange-400/20 text-orange-400 border-orange-400/30' },
    critico: { text: 'CRÍTICO', cls: 'bg-destructive/20 text-destructive border-destructive/30' },
  };
  return map[r] || map.medio;
};

export default function AccountAnalysis() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<AccountAnalysisResult | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<{ created_at: string; score: number } | null>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    loadLastAnalysis();
    const iv = setInterval(() => setPhraseIdx(i => (i + 1) % PHRASES.length), 6000);
    return () => clearInterval(iv);
  }, []);

  const loadLastAnalysis = async () => {
    if (!session) return;
    const { data } = await supabase.from('account_analyses').select('*').order('created_at', { ascending: false }).limit(1).single();
    if (data) {
      setLastAnalysis({ created_at: data.created_at, score: data.score });
      setResult({
        score: data.score,
        risk_level: data.risk_level,
        summary: data.summary || '',
        strengths: (data.strengths as string[]) || [],
        weaknesses: (data.weaknesses as string[]) || [],
        patterns: (data.patterns as string[]) || [],
        improvements: (data.improvements as string[]) || [],
        insights: (data.insights as string[]) || [],
        final_phrase: data.final_phrase || '',
      });
    }
  };

  const runAnalysis = async () => {
    if (!session) return;
    setLoading(true);
    setResult(null);
    let idx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const iv = setInterval(() => { idx = (idx + 1) % LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[idx]); }, 3000);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/horus-account-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: 'Erro', description: data.error || 'Falha na análise', variant: 'destructive' });
        return;
      }
      setResult(data);
      setLastAnalysis({ created_at: new Date().toISOString(), score: data.score });
      toast({ title: 'Análise concluída', description: 'Horus IA finalizou a leitura da sua conta.' });
    } catch {
      toast({ title: 'Erro', description: 'Horus IA temporariamente indisponível.', variant: 'destructive' });
    } finally {
      clearInterval(iv);
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const sl = result ? scoreLabel(result.score) : null;
  const rb = result ? riskBadge(result.risk_level) : null;

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center box-glow-strong">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">Análise da Conta</h2>
                  <p className="text-xs text-muted-foreground">Receba uma leitura completa do seu comportamento operacional</p>
                </div>
              </div>
              <motion.p key={phraseIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary italic font-medium">
                "{PHRASES[phraseIdx]}"
              </motion.p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" onClick={runAnalysis} disabled={loading}
                  className="gradient-gold text-primary-foreground font-display gap-2 box-glow">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : result ? <RefreshCw className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  {loading ? 'Analisando...' : result ? 'Atualizar análise' : 'Analisar minha conta'}
                </Button>
              </motion.div>
              {lastAnalysis && (
                <p className="text-[10px] text-muted-foreground">
                  Última análise: {new Date(lastAnalysis.created_at).toLocaleString('pt-BR')} • Score: {lastAnalysis.score}/100
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="border border-primary/20 rounded-xl bg-primary/5 p-8 text-center space-y-4">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 mx-auto rounded-2xl gradient-gold flex items-center justify-center">
              <Eye className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <p className="text-sm text-primary font-display">{loadingMsg}</p>
            <div className="space-y-2 max-w-md mx-auto">
              <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-2/3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Score Card */}
            <Card className={`border ${sl!.bg}`}>
              <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`text-5xl font-display font-bold ${sl!.color}`}>{result.score}</p>
                    <p className="text-xs text-muted-foreground">/100</p>
                  </div>
                  <div>
                    <p className="text-sm font-display font-bold text-foreground">Score Geral da Conta</p>
                    <p className={`text-xs font-bold ${sl!.color}`}>{sl!.text}</p>
                  </div>
                </div>
                <Badge className={`${rb!.cls} border text-xs font-display px-3 py-1`}>
                  Risco: {rb!.text}
                </Badge>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-2">
                <p className="text-xs font-display text-primary flex items-center gap-2"><Eye className="w-3 h-3" /> RESUMO GERAL</p>
                <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-success/20">
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs font-display text-success flex items-center gap-2"><TrendingUp className="w-3 h-3" /> PONTOS FORTES</p>
                  <div className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" /> {s}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs font-display text-destructive flex items-center gap-2"><TrendingDown className="w-3 h-3" /> ONDE ESTÁ PECANDO</p>
                  <div className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" /> {w}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patterns */}
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <p className="text-xs font-display text-primary flex items-center gap-2"><Activity className="w-3 h-3" /> PADRÕES DETECTADOS</p>
                <div className="space-y-2">
                  {result.patterns.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> {p}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5 space-y-3">
                <p className="text-xs font-display text-primary flex items-center gap-2"><Target className="w-3 h-3" /> PLANO DE MELHORIA</p>
                <div className="space-y-2">
                  {result.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary font-display font-bold text-xs mt-0.5">{i + 1}.</span> {imp}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <div>
              <p className="text-xs font-display text-muted-foreground mb-3 flex items-center gap-2"><Lightbulb className="w-3 h-3" /> INSIGHTS DA SUA CONTA</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.insights.map((ins, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="border-border/50 bg-card/80 hover:border-primary/20 transition-colors">
                      <CardContent className="p-3 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">{ins}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Final Phrase */}
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-5 flex items-start gap-3">
                <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-display text-primary mb-1">CONCLUSÃO DA HORUS IA</p>
                  <p className="text-sm text-foreground font-medium italic">"{result.final_phrase}"</p>
                </div>
              </CardContent>
            </Card>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
