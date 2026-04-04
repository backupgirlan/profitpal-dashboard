import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, Mail, Phone, User, Calendar, Tag, MessageSquare, Search, Inbox, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ADMIN_EMAIL = 'backupgirlan@gmail.com';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  project_type: string | null;
  created_at: string;
}

const projectTypeLabels: Record<string, string> = {
  site: 'Site',
  sistema: 'Sistema',
  aplicativo: 'Aplicativo',
  ia: 'Inteligência Artificial',
  landing: 'Landing Page',
  loja: 'Loja Virtual',
  outro: 'Outro',
};

export default function Administrador() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Credenciais inválidas');
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setError('Acesso restrito ao administrador');
      setLoading(false);
      return;
    }
    setAuthenticated(true);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === ADMIN_EMAIL) setAuthenticated(true);
    });
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    supabase
      .from('contact_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setLeads(data);
      });
  }, [authenticated]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.phone || '').includes(search)
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Acesse para ver os orçamentos recebidos</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Inbox className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-bold text-foreground">Orçamentos Recebidos</h1>
            <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(lead => (
            <Card
              key={lead.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${selectedLead?.id === lead.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
              onClick={() => setSelectedLead(lead)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{lead.name}</p>
                      {lead.project_type && (
                        <Badge variant="outline" className="text-[10px] mt-0.5">
                          {projectTypeLabels[lead.project_type] || lead.project_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(lead.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                  </span>
                </div>

                {lead.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" /> {lead.email}
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" /> {lead.phone}
                  </div>
                )}
                {lead.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    {lead.message}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum orçamento encontrado</p>
          </div>
        )}

        {/* Detail modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
            <Card className="w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-foreground">Detalhes do Orçamento</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)}>✕</Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium">{selectedLead.name}</span>
                </div>
                {selectedLead.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">{selectedLead.email}</a>
                  </div>
                )}
                {selectedLead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`https://wa.me/55${selectedLead.phone.replace(/\D/g, '')}`} target="_blank" className="text-primary hover:underline">{selectedLead.phone}</a>
                  </div>
                )}
                {selectedLead.project_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <Badge>{projectTypeLabels[selectedLead.project_type] || selectedLead.project_type}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(selectedLead.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
                {selectedLead.message && (
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Mensagem:</p>
                    <p className="text-foreground whitespace-pre-wrap">{selectedLead.message}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                {selectedLead.phone && (
                  <Button size="sm" asChild className="flex-1">
                    <a href={`https://wa.me/55${selectedLead.phone.replace(/\D/g, '')}?text=Olá ${selectedLead.name}, recebi seu orçamento!`} target="_blank">
                      <Phone className="w-4 h-4 mr-1" /> WhatsApp
                    </a>
                  </Button>
                )}
                {selectedLead.email && (
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <a href={`mailto:${selectedLead.email}`}>
                      <Mail className="w-4 h-4 mr-1" /> E-mail
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
