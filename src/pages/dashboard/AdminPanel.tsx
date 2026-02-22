import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Search, CheckCircle, XCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  is_vip: boolean;
  created_at: string | null;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check admin role
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data }) => {
        setIsAdmin(!!data);
        if (data) loadProfiles();
        else setLoading(false);
      });
  }, [user]);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('id, user_id, display_name, is_vip, created_at').order('created_at', { ascending: false });
    if (data) setProfiles(data as UserProfile[]);
    setLoading(false);
  };

  const toggleVip = async (userId: string, currentVip: boolean) => {
    await supabase.from('profiles').update({ is_vip: !currentVip }).eq('user_id', userId);
    toast({ title: !currentVip ? 'Acesso VIP liberado!' : 'Acesso VIP removido.' });
    loadProfiles();
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-xl font-display font-bold text-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground">Apenas administradores podem acessar este painel.</p>
        </div>
      </div>
    );
  }

  const filtered = profiles.filter(p =>
    (p.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
    p.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <Shield className="w-6 h-6" /> Painel Administrativo
        </h1>
        <p className="text-muted-foreground">Gerencie o acesso VIP dos usuários</p>
      </div>

      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-secondary max-w-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_120px] md:grid-cols-[1fr_1fr_100px_120px] gap-4 p-3 border-b border-border bg-secondary/50 text-xs text-muted-foreground font-display uppercase">
          <span>Nome</span>
          <span className="hidden md:block">Data</span>
          <span className="text-center">Status</span>
          <span className="text-center">Ação</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado</div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_100px_120px] md:grid-cols-[1fr_1fr_100px_120px] gap-4 p-3 border-b border-border/50 items-center">
              <span className="text-sm text-foreground truncate">{p.display_name || 'Sem nome'}</span>
              <span className="hidden md:block text-xs text-muted-foreground">
                {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-'}
              </span>
              <div className="flex justify-center">
                {p.is_vip ? (
                  <span className="flex items-center gap-1 text-xs text-success-foreground bg-success/20 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> VIP
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/20 px-2 py-1 rounded-full">
                    <XCircle className="w-3 h-3" /> Bloqueado
                  </span>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant={p.is_vip ? 'outline' : 'default'}
                  onClick={() => toggleVip(p.user_id, p.is_vip)}
                  className={p.is_vip ? 'border-destructive/50 text-destructive hover:bg-destructive/10' : 'gradient-gold text-primary-foreground'}
                >
                  {p.is_vip ? 'Revogar' : 'Liberar'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
