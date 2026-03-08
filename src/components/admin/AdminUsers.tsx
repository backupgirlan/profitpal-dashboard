import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Search, CheckCircle, XCircle, Star, Shield, UserCheck, UserX,
  Eye, MoreHorizontal, Filter
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  is_vip: boolean;
  is_super_vip?: boolean;
  created_at: string | null;
  last_login_date: string | null;
  balance: number | null;
  total_profit: number | null;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles')
      .select('id, user_id, display_name, is_vip, is_super_vip, created_at, last_login_date, balance, total_profit')
      .order('created_at', { ascending: false });
    if (data) setProfiles(data as UserProfile[]);
    setLoading(false);
  };

  const toggleVip = async (userId: string, currentVip: boolean) => {
    await supabase.from('profiles').update({ is_vip: !currentVip }).eq('user_id', userId);
    toast({ title: !currentVip ? 'VIP ativado' : 'VIP revogado' });
    loadProfiles();
  };

  const toggleSuperVip = async (userId: string, current: boolean) => {
    await supabase.from('profiles').update({ is_super_vip: !current } as any).eq('user_id', userId);
    toast({ title: !current ? 'Super VIP ativado' : 'Super VIP revogado' });
    loadProfiles();
  };

  const filtered = profiles.filter(p => {
    const matchesSearch = (p.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
      p.user_id.toLowerCase().includes(search.toLowerCase());
    if (filter === 'vip') return matchesSearch && p.is_vip;
    if (filter === 'super_vip') return matchesSearch && p.is_super_vip;
    if (filter === 'blocked') return matchesSearch && !p.is_vip;
    return matchesSearch;
  });

  const getStatusBadge = (p: UserProfile) => {
    if (p.is_super_vip) return <Badge className="gradient-gold text-primary-foreground border-0 text-[10px]"><Star className="w-3 h-3 mr-1" />Super VIP</Badge>;
    if (p.is_vip) return <Badge variant="outline" className="border-success/50 text-success text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />VIP</Badge>;
    return <Badge variant="outline" className="border-destructive/50 text-destructive text-[10px]"><XCircle className="w-3 h-3 mr-1" />Bloqueado</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Gestão de Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">{profiles.length} usuários cadastrados na plataforma</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: profiles.length, icon: Users, color: 'text-blue-400' },
          { label: 'VIP', value: profiles.filter(p => p.is_vip).length, icon: UserCheck, color: 'text-success' },
          { label: 'Super VIP', value: profiles.filter(p => p.is_super_vip).length, icon: Star, color: 'text-primary' },
          { label: 'Bloqueados', value: profiles.filter(p => !p.is_vip).length, icon: UserX, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="border-border/50 bg-card/80">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-secondary"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="bg-secondary w-40">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="super_vip">Super VIP</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/50 bg-card/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-3 px-4 text-[11px] font-display text-muted-foreground uppercase tracking-wider">Usuário</th>
                <th className="text-left py-3 px-4 text-[11px] font-display text-muted-foreground uppercase tracking-wider hidden md:table-cell">Plano</th>
                <th className="text-left py-3 px-4 text-[11px] font-display text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Cadastro</th>
                <th className="text-left py-3 px-4 text-[11px] font-display text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Último Login</th>
                <th className="text-right py-3 px-4 text-[11px] font-display text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Nenhum usuário encontrado</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {(p.display_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{p.display_name || 'Sem nome'}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{p.user_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">{getStatusBadge(p)}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">
                    {p.last_login_date || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => toggleVip(p.user_id, p.is_vip)}>
                          {p.is_vip ? <><UserX className="w-4 h-4 mr-2" /> Revogar VIP</> : <><UserCheck className="w-4 h-4 mr-2" /> Ativar VIP</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleSuperVip(p.user_id, !!p.is_super_vip)}>
                          {p.is_super_vip ? <><XCircle className="w-4 h-4 mr-2" /> Revogar Super VIP</> : <><Star className="w-4 h-4 mr-2" /> Ativar Super VIP</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Shield className="w-4 h-4 mr-2" /> Bloquear
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
