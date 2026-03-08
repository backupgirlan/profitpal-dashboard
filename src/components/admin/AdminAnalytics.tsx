import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, Brain, Eye, ImageIcon, TrendingUp, Clock, Star, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ analyses: 0, prints: 0, avgConfidence: 0, superVip: 0 });
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [prints, setPrints] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: a }, { data: p }, { data: profiles }] = await Promise.all([
      supabase.from('horus_analyses').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('horus_print_analyses').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('is_super_vip'),
    ]);
    const allPrints = p || [];
    const avgConf = allPrints.length > 0 ? Math.round(allPrints.reduce((s: number, x: any) => s + (x.confidence || 0), 0) / allPrints.length) : 0;
    setStats({
      analyses: (a || []).length,
      prints: allPrints.length,
      avgConfidence: avgConf,
      superVip: ((profiles || []) as any[]).filter((x: any) => x.is_super_vip).length,
    });
    if (a) setAnalyses(a);
    if (p) setPrints(allPrints);
  };

  // Usage by hour chart
  const hourData = Array.from({ length: 24 }, (_, h) => {
    const count = [...analyses, ...prints].filter(x => new Date(x.created_at).getHours() === h).length;
    return { hour: `${h}h`, count };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Análises da Plataforma</h1>
        <p className="text-sm text-muted-foreground mt-1">Métricas e estatísticas da Horus IA</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Análises Comportamentais', value: stats.analyses, icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Prints Analisados', value: stats.prints, icon: ImageIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Confiança Média', value: `${stats.avgConfidence}%`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Super VIP Ativos', value: stats.superVip, icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
        ].map(s => (
          <Card key={s.label} className="border-border/50 bg-card/80">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-[26px] font-display font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage by Hour */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Uso da IA por Horário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
              <XAxis dataKey="hour" tick={{ fill: 'hsl(218, 11%, 65%)', fontSize: 10 }} interval={2} />
              <YAxis tick={{ fill: 'hsl(218, 11%, 65%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(222, 47%, 11%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(48, 96%, 53%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Activity className="w-4 h-4 text-success" /> Histórico de Análises
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 && prints.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma análise realizada ainda.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {[...analyses.map(a => ({ ...a, _type: 'behavioral' })), ...prints.map(p => ({ ...p, _type: 'print' }))]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 20)
                .map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/20">
                    {item._type === 'behavioral' ? (
                      <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {item._type === 'behavioral' ? 'Análise Comportamental' : `Print ${item.timeframe}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {item.response || item.scenario || 'Sem resposta'}
                      </p>
                    </div>
                    {item.confidence && <Badge variant="outline" className="text-[10px] shrink-0">{item.confidence}%</Badge>}
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(item.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
