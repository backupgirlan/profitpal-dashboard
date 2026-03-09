import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Shield, Zap, RefreshCw, Loader2, Lightbulb, Target, Award, Activity, Bot, User
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

interface ChatMessage {
  id: string;
  role: 'horus' | 'trader';
  content: string;
  type?: 'score' | 'risk' | 'strength' | 'weakness' | 'pattern' | 'improvement' | 'insight' | 'final' | 'summary';
  icon?: React.ReactNode;
  color?: string;
}

function buildChatMessages(result: AccountAnalysisResult): ChatMessage[] {
  const msgs: ChatMessage[] = [];
  let id = 0;
  const next = () => String(++id);

  msgs.push({ id: next(), role: 'trader', content: 'Horus, analisa minha conta por favor. Quero entender como estou operando.' });
  msgs.push({ id: next(), role: 'horus', content: 'Acabei de cruzar todos os dados da sua conta. Vou te dar uma leitura completa. 🔎' });

  // Score
  const sl = scoreLabel(result.score);
  msgs.push({
    id: next(), role: 'horus', type: 'score',
    content: `📊 **Score da sua conta: ${result.score}/100**\n\n${sl.text}`,
    color: sl.color,
  });

  // Risk
  const rb = riskBadge(result.risk_level);
  msgs.push({
    id: next(), role: 'horus', type: 'risk',
    content: `🛡️ **Nível de risco: ${rb.text}**`,
    color: result.risk_level === 'alto' || result.risk_level === 'critico' ? 'text-destructive' : result.risk_level === 'medio' ? 'text-primary' : 'text-success',
  });

  // Summary
  msgs.push({ id: next(), role: 'horus', type: 'summary', content: result.summary });

  msgs.push({ id: next(), role: 'trader', content: 'E o que eu tô fazendo de certo?' });

  // Strengths
  if (result.strengths.length > 0) {
    msgs.push({
      id: next(), role: 'horus', type: 'strength',
      content: `✅ **Pontos fortes:**\n\n${result.strengths.map(s => `• ${s}`).join('\n')}`,
    });
  }

  msgs.push({ id: next(), role: 'trader', content: 'E onde estou errando?' });

  // Weaknesses
  if (result.weaknesses.length > 0) {
    msgs.push({
      id: next(), role: 'horus', type: 'weakness',
      content: `⚠️ **Onde está pecando:**\n\n${result.weaknesses.map(w => `• ${w}`).join('\n')}`,
    });
  }

  // Patterns
  if (result.patterns.length > 0) {
    msgs.push({
      id: next(), role: 'horus', type: 'pattern',
      content: `🔍 **Padrões que detectei:**\n\n${result.patterns.map(p => `• ${p}`).join('\n')}`,
    });
  }

  msgs.push({ id: next(), role: 'trader', content: 'O que eu preciso fazer pra melhorar?' });

  // Improvements
  if (result.improvements.length > 0) {
    msgs.push({
      id: next(), role: 'horus', type: 'improvement',
      content: `🎯 **Plano de melhoria:**\n\n${result.improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}`,
    });
  }

  // Insights
  if (result.insights.length > 0) {
    msgs.push({
      id: next(), role: 'horus', type: 'insight',
      content: `💡 **Insights da sua conta:**\n\n${result.insights.map(ins => `• ${ins}`).join('\n')}`,
    });
  }

  // Final phrase
  if (result.final_phrase) {
    msgs.push({
      id: next(), role: 'horus', type: 'final',
      content: `🏆 **Conclusão:**\n\n"${result.final_phrase}"`,
    });
  }

  return msgs;
}

function ChatBubble({ msg, index }: { msg: ChatMessage; index: number }) {
  const isHorus = msg.role === 'horus';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, duration: 0.35, ease: 'easeOut' }}
      className={`flex gap-2.5 ${isHorus ? 'justify-start' : 'justify-end'}`}
    >
      {isHorus && (
        <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shrink-0 mt-1 box-glow">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
        isHorus
          ? 'bg-secondary/60 border border-border/50 text-foreground rounded-tl-md'
          : 'bg-primary/15 border border-primary/20 text-foreground rounded-tr-md'
      }`}>
        {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className={msg.color || 'text-primary'}>{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
      {!isHorus && (
        <div className="w-8 h-8 rounded-full bg-secondary border border-border/50 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}

export default function AccountAnalysis() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<AccountAnalysisResult | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<{ created_at: string; score: number } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLastAnalysis();
  }, []);

  // Animate messages appearing one by one
  useEffect(() => {
    if (chatMessages.length === 0) { setVisibleCount(0); return; }
    if (visibleCount >= chatMessages.length) return;
    const timer = setTimeout(() => {
      setVisibleCount(v => v + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [chatMessages, visibleCount]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleCount]);

  const loadLastAnalysis = async () => {
    if (!session) return;
    const { data } = await supabase.from('account_analyses').select('*').order('created_at', { ascending: false }).limit(1).single();
    if (data) {
      setLastAnalysis({ created_at: data.created_at, score: data.score });
      const r: AccountAnalysisResult = {
        score: data.score,
        risk_level: data.risk_level,
        summary: data.summary || '',
        strengths: (data.strengths as string[]) || [],
        weaknesses: (data.weaknesses as string[]) || [],
        patterns: (data.patterns as string[]) || [],
        improvements: (data.improvements as string[]) || [],
        insights: (data.insights as string[]) || [],
        final_phrase: data.final_phrase || '',
      };
      setResult(r);
      const msgs = buildChatMessages(r);
      setChatMessages(msgs);
      setVisibleCount(msgs.length); // Show all immediately for loaded data
    }
  };

  const runAnalysis = async () => {
    if (!session) return;
    setLoading(true);
    setResult(null);
    setChatMessages([]);
    setVisibleCount(0);
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
      const msgs = buildChatMessages(data);
      setChatMessages(msgs);
      setVisibleCount(0); // Start animation from 0
      toast({ title: 'Análise concluída', description: 'Horus IA finalizou a leitura da sua conta.' });
    } catch {
      toast({ title: 'Erro', description: 'Horus IA temporariamente indisponível.', variant: 'destructive' });
    } finally {
      clearInterval(iv);
      setLoading(false);
      setLoadingMsg('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center box-glow-strong">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">Análise da Conta</h2>
                <p className="text-xs text-muted-foreground">Conversa inteligente com a Horus IA sobre sua performance</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="sm" onClick={runAnalysis} disabled={loading}
                  className="gradient-gold text-primary-foreground font-display gap-2 box-glow">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : result ? <RefreshCw className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {loading ? 'Analisando...' : result ? 'Atualizar' : 'Analisar minha conta'}
                </Button>
              </motion.div>
              {lastAnalysis && (
                <p className="text-[10px] text-muted-foreground">
                  Última: {new Date(lastAnalysis.created_at).toLocaleString('pt-BR')} • Score: {lastAnalysis.score}/100
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
              <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-5/6" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Conversation */}
      {chatMessages.length > 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-border/50 bg-card/90 overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border/30 bg-secondary/30">
              <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-bold text-foreground">Horus IA</p>
                <p className="text-[10px] text-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Online • Trader Profissional
                </p>
              </div>
              {result && (
                <Badge className={`${scoreLabel(result.score).bg} border text-xs font-display px-2 py-0.5`}>
                  Score: {result.score}
                </Badge>
              )}
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {chatMessages.slice(0, visibleCount).map((msg, i) => (
                <ChatBubble key={msg.id} msg={msg} index={i} />
              ))}

              {/* Typing indicator when messages are still appearing */}
              {visibleCount < chatMessages.length && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary/60 border border-border/50 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
