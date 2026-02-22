import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Target, BarChart3, UserPlus, MessageCircle, Youtube, Plus, CheckCircle, XCircle, X, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface Trade {
  id: string;
  pair_name: string;
  payout: number;
  result: string;
  amount: number;
  profit: number;
  trade_date: string;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState({ wins: 0, losses: 0, profit: 0 });
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [todayTrades, setTodayTrades] = useState<Trade[]>([]);

  // Banca popup
  const [editingBalance, setEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState('');

  // Entrada popup
  const [editingEntry, setEditingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState('');

  // Quick trade form
  const [pairName, setPairName] = useState('');
  const [payout, setPayout] = useState(80);
  const [tradeAmount, setTradeAmount] = useState(2);
  const [tradeResult, setTradeResult] = useState<string>('win');

  const today = new Date().toISOString().split('T')[0];

  const loadData = () => {
    if (!user) return;

    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });

    supabase.from('trades').select('*').eq('user_id', user.id).order('trade_date', { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        setAllTrades(data as Trade[]);
        const grouped: Record<string, { date: string; profit: number }> = {};
        let cumulative = 0;
        data.forEach((t) => {
          const date = t.trade_date;
          if (!grouped[date]) grouped[date] = { date, profit: 0 };
          grouped[date].profit += Number(t.profit);
        });
        const result = Object.values(grouped).map(d => {
          cumulative += d.profit;
          return { ...d, cumulative: Number(cumulative.toFixed(2)) };
        });
        setChartData(result);
      });

    supabase.from('trades').select('*').eq('user_id', user.id).eq('trade_date', today).order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setTodayTrades(data as Trade[]);
        const wins = data.filter(t => t.result === 'win').length;
        const losses = data.filter(t => t.result === 'loss').length;
        const profit = data.reduce((s, t) => s + Number(t.profit), 0);
        setTodayStats({ wins, losses, profit });
      });
  };

  useEffect(() => { loadData(); }, [user]);

  const balance = Number(profile?.balance || 0);
  const totalProfit = Number(profile?.total_profit || 0);
  const entryPct = Number(profile?.entry_percentage || 2);
  const entryValue = balance * (entryPct / 100);

  const saveBalance = async () => {
    if (!user || !newBalance) return;
    await supabase.from('profiles').update({ balance: Number(newBalance) }).eq('user_id', user.id);
    setEditingBalance(false);
    loadData();
    toast({ title: 'Banca atualizada!' });
  };

  const saveEntry = async () => {
    if (!user || !newEntry) return;
    await supabase.from('profiles').update({ entry_percentage: Number(newEntry) }).eq('user_id', user.id);
    setEditingEntry(false);
    loadData();
    toast({ title: 'Entrada atualizada!' });
  };

  const addQuickTrade = async () => {
    if (!user || !pairName) return;
    if (todayTrades.length >= 3) {
      toast({ title: 'Limite atingido', description: 'Máximo 3 operações por dia.', variant: 'destructive' });
      return;
    }

    const profit = tradeResult === 'win' ? tradeAmount * (payout / 100) : -tradeAmount;

    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      pair_name: pairName,
      payout,
      result: tradeResult,
      amount: tradeAmount,
      profit,
      soros_level: 0,
      trade_date: today,
    });

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      const newBal = balance + profit;
      await supabase.from('profiles').update({ balance: newBal }).eq('user_id', user.id);
      setPairName('');
      loadData();
      toast({ title: 'Operação registrada!' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow">
          Bem-vindo de volta!
        </h1>
        <p className="text-muted-foreground">Resumo da sua conta de trading</p>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* BANCA - Popover to edit */}
        <Popover>
          <PopoverTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
              className="bg-card border border-border rounded-lg p-4 box-glow cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Banca</span>
                <Edit2 className="w-3 h-3 text-primary/50" />
              </div>
              <p className="text-xl font-display font-bold text-primary text-glow">
                R$ {balance.toFixed(2)}
              </p>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-card border-border">
            <h4 className="font-display font-bold text-sm text-foreground mb-3">Configurar Banca</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Valor da Banca (R$)</label>
                <Input
                  type="number"
                  placeholder={balance.toFixed(2)}
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="bg-secondary mt-1"
                />
              </div>
              <Button onClick={saveBalance} className="w-full gradient-gold text-primary-foreground gap-2" size="sm">
                <Save className="w-3.5 h-3.5" /> Salvar
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* LUCRO TOTAL - Popover with trade summary */}
        <Popover>
          <PopoverTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Lucro Total</span>
                <Edit2 className="w-3 h-3 text-primary/50" />
              </div>
              <p className={`text-xl font-display font-bold ${totalProfit >= 0 ? 'win-text' : 'loss-text'}`}>
                R$ {totalProfit.toFixed(2)}
              </p>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border max-h-60 overflow-y-auto">
            <h4 className="font-display font-bold text-sm text-foreground mb-3">Histórico de Operações</h4>
            {allTrades.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma operação registrada</p>
            ) : (
              <div className="space-y-1.5">
                {allTrades.slice(-10).reverse().map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
                    <span className="text-foreground font-medium">{t.pair_name}</span>
                    <span className="text-muted-foreground">{t.trade_date}</span>
                    <span className={Number(t.profit) >= 0 ? 'win-text' : 'loss-text'}>
                      {Number(t.profit) >= 0 ? '+' : ''}R$ {Number(t.profit).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* ENTRADA - Popover to edit percentage */}
        <Popover>
          <PopoverTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span className="flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Entrada ({entryPct}%)</span>
                <Edit2 className="w-3 h-3 text-primary/50" />
              </div>
              <p className="text-xl font-display font-bold text-foreground">
                R$ {entryValue.toFixed(2)}
              </p>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-card border-border">
            <h4 className="font-display font-bold text-sm text-foreground mb-3">Configurar Entrada</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Porcentagem de entrada (%)</label>
                <Input
                  type="number"
                  placeholder={String(entryPct)}
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="bg-secondary mt-1"
                />
              </div>
              <Button onClick={saveEntry} className="w-full gradient-gold text-primary-foreground gap-2" size="sm">
                <Save className="w-3.5 h-3.5" /> Salvar
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* HOJE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <BarChart3 className="w-3.5 h-3.5" /> Hoje
          </div>
          <p className="text-sm text-foreground">
            <span className="win-text font-bold">{todayStats.wins}W</span>
            {' / '}
            <span className="loss-text font-bold">{todayStats.losses}L</span>
            {' · '}
            <span className={`font-bold ${todayStats.profit >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {todayStats.profit.toFixed(2)}
            </span>
          </p>
        </motion.div>
      </div>

      {/* Quick Trade Form */}
      {todayTrades.length < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-primary/20 rounded-lg p-4"
        >
          <h3 className="font-display text-sm font-bold text-primary mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrar Operação Rápida ({todayTrades.length}/3)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Input placeholder="Par (ex: EUR/USD)" value={pairName} onChange={(e) => setPairName(e.target.value)} className="bg-secondary" />
            <Input type="number" placeholder="Payout %" value={payout} onChange={(e) => setPayout(Number(e.target.value))} className="bg-secondary" />
            <Input type="number" placeholder="Valor R$" value={tradeAmount} onChange={(e) => setTradeAmount(Number(e.target.value))} className="bg-secondary" />
            <Select value={tradeResult} onValueChange={setTradeResult}>
              <SelectTrigger className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="win">✅ Win</SelectItem>
                <SelectItem value="loss">❌ Loss</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addQuickTrade} className="gradient-gold text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Today's trades mini list */}
      {todayTrades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-lg overflow-hidden"
        >
          <div className="p-3 border-b border-border bg-secondary/50">
            <h3 className="font-display text-xs font-bold text-muted-foreground">Operações de Hoje</h3>
          </div>
          {todayTrades.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 text-sm">
              <span className="font-medium text-foreground">{t.pair_name}</span>
              <span className="text-muted-foreground">{t.payout}%</span>
              <span className="text-muted-foreground">R$ {Number(t.amount).toFixed(2)}</span>
              <span className={t.result === 'win' ? 'win-text' : 'loss-text'}>
                {t.result === 'win' ? <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> : <XCircle className="w-3.5 h-3.5 inline mr-1" />}
                {t.result === 'win' ? 'Win' : 'Loss'}
              </span>
              <span className={`font-bold ${Number(t.profit) >= 0 ? 'win-text' : 'loss-text'}`}>
                R$ {Number(t.profit).toFixed(2)}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Evolution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Evolução do Lucro
        </h3>
        <div className="h-56">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
                <XAxis dataKey="date" stroke="hsl(0, 0%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(0, 0%, 55%)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(0, 0%, 7%)', border: '1px solid hsl(0, 0%, 16%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(45, 100%, 50%)' }}
                />
                <Line type="monotone" dataKey="cumulative" stroke="hsl(45, 100%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(45, 100%, 50%)', r: 3 }} name="Lucro Acum." />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Registre operações para ver sua evolução
            </div>
          )}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-card to-secondary border border-primary/20 rounded-lg p-6 space-y-4"
      >
        <div className="text-center space-y-2">
          <h3 className="font-display text-lg font-bold text-primary text-glow">
            Junte-se à comunidade!
          </h3>
          <p className="text-muted-foreground text-sm">
            Cadastre-se na nossa corretora parceira e acompanhe nossos conteúdos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="https://broker-qx.pro/sign-up/?lid=1711160" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full gradient-gold text-primary-foreground font-display gap-2 box-glow hover:opacity-90">
              <UserPlus className="w-5 h-5" />
              Cadastro Broker
            </Button>
          </a>
          <a href="https://t.me/girlananalyst" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 font-display gap-2">
              <MessageCircle className="w-5 h-5" />
              Telegram
            </Button>
          </a>
          <a href="https://www.youtube.com/@technicalgirlan" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 font-display gap-2">
              <Youtube className="w-5 h-5" />
              YouTube
            </Button>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
