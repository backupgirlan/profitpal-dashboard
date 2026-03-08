import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Send, Trash2, Loader2, MessageSquare, Sparkles, User, ChevronDown, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const SUGGESTIONS = [
  'Por que eu quebro meu gerenciamento?',
  'Como parar de tentar recuperar perda?',
  'Como melhorar minha disciplina?',
  'Como controlar o emocional após loss?',
  'Meu problema é estratégia ou comportamento?',
  'Como montar uma rotina de trader mais estável?',
];

const LOADING_MSGS = [
  'Horus IA refletindo sobre sua pergunta...',
  'Horus IA analisando seu contexto...',
  'Horus IA formulando resposta...',
];

export default function TraderDialog() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [useContext, setUseContext] = useState(true);
  const [tone, setTone] = useState('equilibrado');
  const [historyTab, setHistoryTab] = useState('today');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [user, historyTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    let query = supabase.from('trader_dialog_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true });

    const now = new Date();
    if (historyTab === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      query = query.gte('created_at', todayStr);
    } else if (historyTab === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      query = query.gte('created_at', weekAgo);
    }

    const { data } = await query.limit(100);
    if (data) setMessages(data as ChatMessage[]);
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || !session || loading) return;
    setInput('');
    setLoading(true);

    // Optimistic add
    const tempMsg: ChatMessage = { id: 'temp-' + Date.now(), role: 'user', content: msg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    let idx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const iv = setInterval(() => { idx = (idx + 1) % LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[idx]); }, 2500);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/horus-trader-dialog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ message: msg, useContext, tone }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: 'Erro', description: data.error || 'Falha ao enviar', variant: 'destructive' });
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        return;
      }
      // Reload to get real IDs
      await loadMessages();
    } catch {
      toast({ title: 'Erro', description: 'Horus IA temporariamente indisponível.', variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      clearInterval(iv);
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from('trader_dialog_messages').delete().eq('user_id', user.id);
    setMessages([]);
    toast({ title: 'Histórico apagado' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center box-glow-strong">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Diálogo do Trader</h2>
              <p className="text-xs text-muted-foreground">Converse com a Horus IA sobre emocional, disciplina, gerenciamento e mercado</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap mt-3">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted-foreground">Tom:</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-secondary h-7 text-xs w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="acolhedor">🤝 Acolhedor</SelectItem>
                  <SelectItem value="equilibrado">⚖️ Equilibrado</SelectItem>
                  <SelectItem value="firme">💪 Firme</SelectItem>
                  <SelectItem value="verdade_dura">🔥 Verdade Dura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={useContext} onCheckedChange={setUseContext} className="scale-75" />
              <label className="text-[10px] text-muted-foreground">Usar dados da conta</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Tabs */}
      <Tabs value={historyTab} onValueChange={setHistoryTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-secondary/80 h-8">
            <TabsTrigger value="today" className="text-xs h-6 px-3">Hoje</TabsTrigger>
            <TabsTrigger value="week" className="text-xs h-6 px-3">7 dias</TabsTrigger>
            <TabsTrigger value="all" className="text-xs h-6 px-3">Tudo</TabsTrigger>
          </TabsList>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-destructive hover:text-destructive gap-1 h-7">
              <Trash2 className="w-3 h-3" /> Apagar histórico
            </Button>
          )}
        </div>
      </Tabs>

      {/* Chat Area */}
      <Card className="border-border/50 bg-card/90 min-h-[400px] max-h-[600px] flex flex-col">
        <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-sm text-muted-foreground">Inicie uma conversa com a Horus IA</p>
              <p className="text-xs text-muted-foreground italic">"Seu resultado final é reflexo do seu comportamento repetido."</p>

              {/* Quick Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto mt-4">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs p-3 rounded-lg border border-border/50 bg-secondary/50 hover:border-primary/30 hover:bg-primary/5 transition-colors text-foreground"
                  >
                    <Sparkles className="w-3 h-3 text-primary inline mr-1.5" />{s}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-7 h-7 rounded-lg gradient-gold flex items-center justify-center shrink-0 mt-1">
                  <Eye className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary/20 text-foreground border border-primary/20'
                  : 'bg-secondary/80 text-foreground border border-border/50'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5">
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-lg gradient-gold flex items-center justify-center shrink-0 mt-1">
                <Eye className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="bg-secondary/80 border border-border/50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground italic">{loadingMsg}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </CardContent>

        {/* Input */}
        <div className="p-3 border-t border-border/50">
          {messages.length > 0 && !loading && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-border/50 bg-secondary/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap shrink-0">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="bg-secondary min-h-[44px] max-h-[120px] text-sm resize-none"
              rows={1}
            />
            <Button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="gradient-gold text-primary-foreground shrink-0 h-[44px] w-[44px] p-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
