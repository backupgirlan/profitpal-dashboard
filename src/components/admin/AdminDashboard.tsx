import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, Eye, ImageIcon, TrendingUp, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    superVipActive: 0,
    totalAnalyses: 0,
    totalPrints: 0,
    monthlyRevenue: 0,
  });
  const [userChartData, setUserChartData] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [
      { data: profiles },
      { data: activeProfiles },
      { data: analyses },
      { data: prints },
    ] = await Promise.all([
      supabase.from('profiles').select('id, is_vip, is_super_vip, created_at, last_login_date'),
      supabase.from('profiles').select('id').eq('last_login_date', today),
      supabase.from('horus_analyses').select('id'),
      supabase.from('horus_print_analyses').select('id'),
    ]);

    const allProfiles = (profiles || []) as any[];
    const superVip = allProfiles.filter((p: any) => p.is_super_vip);

    setStats({
      totalUsers: allProfiles.length,
      activeToday: (activeProfiles || []).length,
      superVipActive: superVip.length,
      totalAnalyses: (analyses || []).length,
      totalPrints: (prints || []).length,
      monthlyRevenue: superVip.length * 29.90,
    });

    // Generate chart data from last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const usersOnDay = allProfiles.filter((p: any) => p.created_at?.startsWith(dateStr)).length;
      chartData.push({ date: dayLabel, usuarios: usersOnDay, superVip: 0 });
    }
    setUserChartData(chartData);
  };

  const statCards = [
    { label: 'Usuários Cadastrados', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Ativos Hoje', value: stats.activeToday, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Super VIP Ativos', value: stats.superVipActive, icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Receita Mensal Est.', value: `R$ ${stats.monthlyRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Análises Horus IA', value: stats.totalAnalyses, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Prints Analisados', value: stats.totalPrints, icon: ImageIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Dashboard Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da plataforma GB Trader Mind</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/80 hover:border-border transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[26px] font-display font-bold text-foreground leading-none">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Novos Usuários (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={userChartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(218, 11%, 65%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(218, 11%, 65%)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 47%, 11%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(210, 20%, 98%)' }}
                />
                <Area type="monotone" dataKey="usuarios" stroke="hsl(48, 96%, 53%)" fill="url(#colorUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" /> Uso da Horus IA (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(218, 11%, 65%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(218, 11%, 65%)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 47%, 11%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(210, 20%, 98%)' }}
                />
                <Bar dataKey="usuarios" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Activity className="w-4 h-4 text-success" /> Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { text: 'Sistema inicializado', time: 'Agora', color: 'bg-success' },
              { text: 'Painel administrativo carregado', time: 'Agora', color: 'bg-blue-400' },
              { text: 'Dados da plataforma sincronizados', time: 'Agora', color: 'bg-primary' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-foreground">{item.text}</span>
                <span className="text-xs text-muted-foreground ml-auto">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
