import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Send, Trash2, Loader2, Sparkles, User, Check, CheckCheck, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

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

const HISTORY_FILTERS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 dias' },
  { value: 'all', label: 'Tudo' },
];

const CHAT_BG_OPTIONS = [
  { id: 'default', label: 'Padrão', bg: '#0B0F19', pattern: true },
  { id: 'dark', label: 'Escuro', bg: '#080B12', pattern: false },
  { id: 'deep', label: 'Profundo', bg: '#0D1117', pattern: true },
  { id: 'navy', label: 'Marinho', bg: '#0A1628', pattern: true },
  { id: 'charcoal', label: 'Carvão', bg: '#1A1A1A', pattern: false },
  { id: 'forest', label: 'Floresta', bg: '#0B1A14', pattern: true },
  { id: 'warm', label: 'Quente', bg: '#1A140B', pattern: true },
  { id: 'purple', label: 'Roxo', bg: '#12091A', pattern: true },
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [chatBg, setChatBg] = useState(() => localStorage.getItem('horus-chat-bg') || 'default');
  const [showBgPicker, setShowBgPicker] = useState(false);

  const selectedBg = CHAT_BG_OPTIONS.find(o => o.id === chatBg) || CHAT_BG_OPTIONS[0];

  const handleBgChange = (id: string) => {
    setChatBg(id);
    localStorage.setItem('horus-chat-bg', id);
  };

  useEffect(() => {
    loadMessages();
  }, [user, historyTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadMessages = async () => {
    if (!user) return;
    let query = supabase.from('trader_dialog_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    const now = new Date();
    if (historyTab === 'today') {
      query = query.gte('created_at', now.toISOString().split('T')[0]);
    } else if (historyTab === 'week') {
      query = query.gte('created_at', new Date(now.getTime() - 7 * 86400000).toISOString());
    }
    const { data } = await query.limit(100);
    if (data) setMessages(data as ChatMessage[]);
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || !session || loading) return;
    setInput('');
    setLoading(true);

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

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const groupByDate = (msgs: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    for (const msg of msgs) {
      const d = new Date(msg.created_at).toLocaleDateString('pt-BR');
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: d, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  };

  const dateLabel = (dateStr: string) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('pt-BR');
    if (dateStr === today) return 'Hoje';
    if (dateStr === yesterday) return 'Ontem';
    return dateStr;
  };

  const groups = groupByDate(messages);

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[550px] max-h-[850px] rounded-2xl overflow-hidden border border-border/50 bg-[hsl(var(--secondary)/0.3)]">
      {/* WhatsApp-style Header */}
      <div className="bg-card border-b border-border/50 px-5 py-4 flex items-center gap-4 shrink-0">
        <div className="w-13 h-13 rounded-full gradient-gold flex items-center justify-center shadow-lg" style={{ width: 52, height: 52 }}>
          <Eye className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-display font-bold text-foreground leading-tight">Horus IA</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? (
              <span className="text-primary animate-pulse">digitando...</span>
            ) : 'Assistente de performance do trader'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="bg-secondary/80 h-10 text-sm w-36 border-border/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acolhedor" className="text-sm">🤝 Acolhedor</SelectItem>
              <SelectItem value="equilibrado" className="text-sm">⚖️ Equilibrado</SelectItem>
              <SelectItem value="firme" className="text-sm">💪 Firme</SelectItem>
              <SelectItem value="verdade_dura" className="text-sm">🔥 Verdade Dura</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setShowBgPicker(!showBgPicker)} className="h-10 w-10 text-muted-foreground hover:text-primary">
              <Palette className="w-5 h-5" />
            </Button>
            <AnimatePresence>
              {showBgPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-12 z-50 bg-card border border-border/50 rounded-xl p-3 shadow-xl min-w-[200px]"
                >
                  <p className="text-xs text-muted-foreground mb-2 font-display tracking-wider">COR DO FUNDO</p>
                  <div className="grid grid-cols-4 gap-2">
                    {CHAT_BG_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { handleBgChange(opt.id); setShowBgPicker(false); }}
                        className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                          chatBg === opt.id ? 'border-primary ring-2 ring-primary/30' : 'border-border/30'
                        }`}
                        style={{ backgroundColor: opt.bg }}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearHistory} className="h-10 w-10 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Settings Bar */}
      <div className="bg-card/60 border-b border-border/30 px-5 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={useContext} onCheckedChange={setUseContext} className="scale-[0.85]" />
            <span className="text-sm text-muted-foreground">Usar dados da conta</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {HISTORY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setHistoryTab(f.value)}
              className={`text-sm px-3.5 py-1.5 rounded-full transition-colors ${
                historyTab === f.value
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 transition-colors duration-300" style={{
        backgroundColor: selectedBg.bg,
        backgroundImage: selectedBg.pattern
          ? 'radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.06) 0%, transparent 50%)'
          : 'none',
      }}>
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full py-10 space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center shadow-xl"
            >
              <Eye className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-display font-bold text-foreground">Diálogo do Trader</h3>
              <p className="text-base text-muted-foreground max-w-md">
                Converse com a Horus IA sobre emocional, disciplina, gerenciamento e mercado.
              </p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/30 p-4 max-w-lg w-full">
              <p className="text-xs text-muted-foreground mb-3 font-display text-center tracking-wider">SUGESTÕES RÁPIDAS</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => sendMessage(s)}
                    className="text-left text-[15px] px-4 py-3 rounded-xl bg-secondary/40 hover:bg-primary/10 hover:text-primary transition-all text-foreground flex items-center gap-3"
                  >
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex justify-center my-4">
              <span className="text-xs bg-card/90 backdrop-blur-sm text-muted-foreground px-4 py-1.5 rounded-lg shadow-sm border border-border/20 font-medium">
                {dateLabel(group.date)}
              </span>
            </div>
            {group.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot avatar */}
                {msg.role !== 'user' && (
                  <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shrink-0 mr-2 mt-auto mb-1 shadow-md">
                    <Eye className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}

                {/* Message bubble */}
                <div className={`relative max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary/20 border border-primary/15 rounded-br-md'
                    : 'bg-card border border-border/40 rounded-bl-md'
                }`}>
                  {/* Sender label */}
                  {msg.role !== 'user' && (
                    <p className="text-xs font-display font-bold text-primary mb-1.5">Horus IA</p>
                  )}

                  {/* Content */}
                  {msg.role === 'user' ? (
                    <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="text-base text-foreground leading-relaxed prose prose-sm prose-invert max-w-none
                      prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2.5 prose-strong:text-primary">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* Time + read ticks */}
                  <div className={`flex items-center gap-1.5 mt-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[11px] text-muted-foreground/70">{formatTime(msg.created_at)}</span>
                    {msg.role === 'user' && (
                      <CheckCheck className="w-4 h-4 text-primary/60" />
                    )}
                  </div>
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 ml-2 mt-auto mb-1 shadow-md border border-border/30">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start mb-2"
            >
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shrink-0 mr-2 mt-auto mb-1 shadow-md">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border/40 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
                <p className="text-xs font-display font-bold text-primary mb-2">Horus IA</p>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                      className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                  </div>
                  <span className="text-sm text-muted-foreground italic">{loadingMsg}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestions bar */}
      {messages.length > 0 && !loading && (
        <div className="bg-card/60 border-t border-border/20 px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
          {SUGGESTIONS.slice(0, 3).map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              className="text-sm px-4 py-2 rounded-full border border-border/30 bg-secondary/40 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap shrink-0">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* WhatsApp-style Input Bar */}
      <div className="bg-card border-t border-border/50 px-4 py-3 flex items-end gap-3 shrink-0">
        <div className="flex-1 bg-secondary/60 rounded-2xl border border-border/30 px-5 py-1.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem..."
            className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none py-2.5 leading-relaxed"
            rows={1}
            style={{ maxHeight: 140 }}
          />
        </div>
        <Button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="gradient-gold text-primary-foreground shrink-0 h-12 w-12 rounded-full p-0 shadow-lg hover:shadow-xl transition-shadow"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
