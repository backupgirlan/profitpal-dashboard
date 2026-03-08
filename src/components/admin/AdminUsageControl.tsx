import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Activity, Users, RotateCcw, Lock, Unlock, Search, Brain, ImageIcon } from 'lucide-react';

export default function AdminUsageControl() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [usage, setUsage] = useState<Record<string, { analyses: number; prints: number }>>({});
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [{ data: p }, { data: a }, { data: pr }] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name, is_vip, is_super_vip').order('created_at', { ascending: false }),
      supabase.from('horus_analyses').select('user_id, created_at'),
      supabase.from('horus_print_analyses').select('user_id, created_at'),
    ]);
    if (p) setProfiles(p as any[]);

    const today = new Date().toISOString().split('T')[0];
    const usageMap: Record<string, { analyses: number; prints: number }> = {};
    (a || []).forEach((x: any) => {
      if (x.created_at?.startsWith(today)) {
        if (!usageMap[x.user_id]) usageMap[x.user_id] = { analyses: 0, prints: 0 };
        usageMap[x.user_id].analyses++;
      }
    });
    (pr || []).forEach((x: any) => {
      if (x.created_at?.startsWith(today)) {
        if (!usageMap[x.user_id]) usageMap[x.user_id] = { analyses: 0, prints: 0 };
        usageMap[x.user_id].prints++;
      }
    });
    setUsage(usageMap);
  };

  const filtered = profiles.filter(p =>
    (p.display_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Controle de Uso</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitore e gerencie o uso da Horus IA por usuário</p>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar usuário..." value={search} onChange={e => setSearch(e.target.value)} className="bg-secondary" />
      </div>

      <Card className="border-border/50 bg-card/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-3 px-4 text-[11px] font-display text-muted-foreground uppercase">Usuário</th>
                <th className="text-center py-3 px-4 text-[11px] font-display text-muted-foreground uppercase">Plano</th>
                <th className="text-center py-3 px-4 text-[11px] font-display text-muted-foreground uppercase">Análises Hoje</th>
                <th className="text-center py-3 px-4 text-[11px] font-display text-muted-foreground uppercase">Prints Hoje</th>
                <th className="text-right py-3 px-4 text-[11px] font-display text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const u = usage[p.user_id] || { analyses: 0, prints: 0 };
                return (
                  <tr key={p.user_id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {(p.display_name || 'U')[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-foreground">{p.display_name || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.is_super_vip ? (
                        <Badge className="gradient-gold text-primary-foreground text-[10px] border-0">Super VIP</Badge>
                      ) : p.is_vip ? (
                        <Badge variant="outline" className="text-[10px] border-success/50 text-success">VIP</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Comum</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Brain className="w-3 h-3 text-purple-400" />
                        <span className="text-sm font-mono font-bold text-foreground">{u.analyses}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ImageIcon className="w-3 h-3 text-blue-400" />
                        <span className="text-sm font-mono font-bold text-foreground">{u.prints}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" title="Resetar limite">
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive" title="Bloquear IA">
                          <Lock className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-success" title="Liberar IA">
                          <Unlock className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
