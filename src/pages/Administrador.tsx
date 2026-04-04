import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LogOut, Mail, Phone, User, Calendar, Tag, MessageSquare, Search, Inbox,
  ArrowUpDown, ChevronLeft, ChevronRight, Globe, Monitor, Smartphone, Layout
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ADMIN_EMAIL = 'backupgirlan@gmail.com';
const PER_PAGE = 9;

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

// ── Portfolio preview data ──
const portfolioSites = [
  {
    name: "Help GB Tec",
    url: "girlanbarreto.lovable.app",
    category: "Landing Page",
    screens: [
      { label: "Hero", color: "from-violet-600 to-indigo-800", sections: ["nav", "hero-big", "cta"] },
      { label: "Serviços", color: "from-blue-600 to-cyan-700", sections: ["nav", "grid-6", "text"] },
      { label: "Projetos", color: "from-purple-700 to-pink-600", sections: ["nav", "grid-3", "cards"] },
    ]
  },
  {
    name: "GB Trader Mind",
    url: "app.gbtrader.com",
    category: "Sistema",
    screens: [
      { label: "Dashboard", color: "from-slate-800 to-slate-900", sections: ["sidebar", "charts", "stats"] },
      { label: "Operações", color: "from-gray-800 to-gray-900", sections: ["sidebar", "table", "form"] },
      { label: "Horus IA", color: "from-amber-900 to-yellow-800", sections: ["sidebar", "chat", "analysis"] },
    ]
  },
  {
    name: "Clínica Saúde+",
    url: "clinicasaude.com.br",
    category: "Site",
    screens: [
      { label: "Home", color: "from-teal-500 to-emerald-600", sections: ["nav", "hero-img", "services"] },
      { label: "Agendamento", color: "from-teal-600 to-green-700", sections: ["nav", "calendar", "form"] },
      { label: "Contato", color: "from-green-600 to-teal-700", sections: ["nav", "map", "form-sm"] },
    ]
  },
  {
    name: "Loja Elegância",
    url: "lojaelegancia.com.br",
    category: "Loja Virtual",
    screens: [
      { label: "Home", color: "from-rose-500 to-pink-600", sections: ["nav", "banner", "products"] },
      { label: "Produtos", color: "from-pink-600 to-fuchsia-600", sections: ["nav", "filters", "grid-4"] },
      { label: "Carrinho", color: "from-fuchsia-600 to-purple-600", sections: ["nav", "cart-list", "checkout"] },
    ]
  },
  {
    name: "Restaurante Sabor",
    url: "restaurantesabor.com.br",
    category: "Aplicativo",
    screens: [
      { label: "Cardápio", color: "from-orange-500 to-red-600", sections: ["nav", "categories", "items"] },
      { label: "Pedido", color: "from-red-600 to-orange-600", sections: ["nav", "order", "total"] },
      { label: "Delivery", color: "from-amber-600 to-orange-600", sections: ["nav", "map-track", "status"] },
    ]
  },
  {
    name: "Imobiliária Premium",
    url: "imobpremium.com.br",
    category: "Site",
    screens: [
      { label: "Home", color: "from-sky-600 to-blue-700", sections: ["nav", "search-bar", "featured"] },
      { label: "Imóveis", color: "from-blue-700 to-indigo-700", sections: ["nav", "filters", "grid-3"] },
      { label: "Detalhes", color: "from-indigo-600 to-blue-700", sections: ["nav", "gallery", "info"] },
    ]
  },
];

// Mini wireframe renderer
function MiniWireframe({ sections, color }: { sections: string[]; color: string }) {
  const renderSection = (s: string, i: number) => {
    switch (s) {
      case "nav": return <div key={i} className="h-2 flex items-center gap-0.5 px-1 bg-white/10 rounded-sm"><div className="w-2 h-1 rounded-sm bg-white/30"/><div className="flex-1"/><div className="flex gap-0.5">{[1,2,3].map(x=><div key={x} className="w-1.5 h-0.5 rounded-full bg-white/20"/>)}</div></div>;
      case "sidebar": return <div key={i} className="absolute left-0 top-2 bottom-0 w-4 bg-white/5 rounded-r flex flex-col gap-0.5 p-0.5 pt-1">{[1,2,3,4].map(x=><div key={x} className="h-1 w-full rounded-sm bg-white/15"/>)}</div>;
      case "hero-big": return <div key={i} className="flex-1 flex flex-col items-center justify-center gap-1 px-2"><div className="h-1.5 w-3/4 rounded-full bg-white/25"/><div className="h-1 w-1/2 rounded-full bg-white/15"/><div className="h-2 w-8 rounded bg-white/20 mt-1"/></div>;
      case "hero-img": return <div key={i} className="flex-1 flex gap-1 px-1"><div className="flex-1 flex flex-col justify-center gap-1"><div className="h-1.5 w-full rounded-full bg-white/20"/><div className="h-1 w-3/4 rounded-full bg-white/10"/></div><div className="w-8 h-6 rounded bg-white/10 self-center"/></div>;
      case "cta": return <div key={i} className="flex justify-center gap-1 pb-1"><div className="h-2 w-10 rounded bg-white/25"/><div className="h-2 w-8 rounded bg-white/10 border border-white/10"/></div>;
      case "grid-6": return <div key={i} className="flex-1 grid grid-cols-3 grid-rows-2 gap-0.5 px-1">{[1,2,3,4,5,6].map(x=><div key={x} className="rounded-sm bg-white/8"/>)}</div>;
      case "grid-4": return <div key={i} className="flex-1 grid grid-cols-2 grid-rows-2 gap-0.5 px-1">{[1,2,3,4].map(x=><div key={x} className="rounded-sm bg-white/10"/>)}</div>;
      case "grid-3": return <div key={i} className="flex-1 grid grid-cols-3 gap-0.5 px-1">{[1,2,3].map(x=><div key={x} className="rounded-sm bg-white/10 h-6"/>)}</div>;
      case "cards": return <div key={i} className="flex gap-0.5 px-1 pb-1">{[1,2,3].map(x=><div key={x} className="flex-1 h-4 rounded-sm bg-white/8"/>)}</div>;
      case "text": return <div key={i} className="px-2 space-y-0.5 pb-1"><div className="h-1 w-3/4 rounded-full bg-white/15 mx-auto"/><div className="h-0.5 w-full rounded-full bg-white/8"/></div>;
      case "charts": return <div key={i} className="flex-1 ml-5 flex gap-0.5 p-1"><div className="flex-1 rounded bg-white/8 flex items-end gap-px p-0.5">{[60,40,80,55,70].map((h,j)=><div key={j} className="flex-1 rounded-t bg-white/15" style={{height:`${h}%`}}/>)}</div><div className="w-8 rounded bg-white/5 flex flex-col gap-0.5 p-0.5">{[1,2,3].map(x=><div key={x} className="h-2 rounded-sm bg-white/10"/>)}</div></div>;
      case "stats": return <div key={i} className="ml-5 flex gap-0.5 px-1 pb-1">{[1,2,3].map(x=><div key={x} className="flex-1 h-3 rounded-sm bg-white/8"/>)}</div>;
      case "table": return <div key={i} className="flex-1 ml-5 flex flex-col gap-px p-1">{[1,2,3,4].map(x=><div key={x} className="h-1.5 rounded-sm bg-white/8"/>)}</div>;
      case "form": return <div key={i} className="ml-5 px-1 pb-1 space-y-0.5"><div className="h-2 w-full rounded-sm bg-white/10"/><div className="h-2 w-full rounded-sm bg-white/10"/><div className="h-2 w-16 rounded-sm bg-white/20"/></div>;
      case "form-sm": return <div key={i} className="px-1 pb-1 space-y-0.5"><div className="h-1.5 w-full rounded-sm bg-white/10"/><div className="h-1.5 w-full rounded-sm bg-white/10"/><div className="h-2 w-10 rounded-sm bg-white/20"/></div>;
      case "chat": return <div key={i} className="flex-1 ml-5 flex flex-col gap-0.5 p-1"><div className="self-start h-2 w-12 rounded bg-white/10"/><div className="self-end h-2 w-10 rounded bg-white/15"/><div className="self-start h-2 w-14 rounded bg-white/10"/></div>;
      case "analysis": return <div key={i} className="ml-5 px-1 pb-1"><div className="h-4 rounded bg-white/8"/></div>;
      case "calendar": return <div key={i} className="flex-1 px-1"><div className="h-full grid grid-cols-7 grid-rows-4 gap-px">{Array.from({length:28}).map((_,j)=><div key={j} className={`rounded-sm ${j%5===0?'bg-white/20':'bg-white/6'}`}/>)}</div></div>;
      case "map": return <div key={i} className="flex-1 px-1"><div className="h-full rounded bg-white/8 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white/20"/></div></div>;
      case "map-track": return <div key={i} className="flex-1 px-1"><div className="h-full rounded bg-white/8 relative"><div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-white/30 animate-ping"/></div></div>;
      case "banner": return <div key={i} className="h-6 mx-1 rounded bg-white/10 flex items-center justify-center"><div className="h-1.5 w-12 rounded-full bg-white/20"/></div>;
      case "products": return <div key={i} className="flex-1 grid grid-cols-2 gap-0.5 px-1">{[1,2,3,4].map(x=><div key={x} className="rounded-sm bg-white/8 flex flex-col"><div className="flex-1 bg-white/5 rounded-t-sm"/><div className="h-1 m-0.5 rounded-full bg-white/15"/></div>)}</div>;
      case "filters": return <div key={i} className="flex gap-0.5 px-1 py-0.5">{["Todos","Cat A","Cat B","Cat C"].map(x=><div key={x} className="h-2 px-1 rounded-full bg-white/10 text-[3px] text-white/30 flex items-center">{x}</div>)}</div>;
      case "cart-list": return <div key={i} className="flex-1 px-1 space-y-0.5">{[1,2,3].map(x=><div key={x} className="flex gap-0.5 h-3"><div className="w-3 rounded-sm bg-white/10"/><div className="flex-1 flex flex-col justify-center gap-px"><div className="h-0.5 w-full rounded-full bg-white/15"/><div className="h-0.5 w-1/2 rounded-full bg-white/8"/></div></div>)}</div>;
      case "checkout": return <div key={i} className="px-1 pb-1"><div className="h-3 rounded bg-white/20 flex items-center justify-center"><div className="h-1 w-8 rounded-full bg-white/30"/></div></div>;
      case "services": return <div key={i} className="flex-1 grid grid-cols-3 gap-0.5 px-1">{[1,2,3].map(x=><div key={x} className="rounded-sm bg-white/8 flex flex-col items-center justify-center gap-0.5 py-1"><div className="w-2 h-2 rounded-full bg-white/15"/><div className="h-0.5 w-3/4 rounded-full bg-white/10"/></div>)}</div>;
      case "categories": return <div key={i} className="flex gap-0.5 px-1 overflow-hidden">{[1,2,3,4].map(x=><div key={x} className="w-6 h-6 rounded-full bg-white/10 shrink-0"/>)}</div>;
      case "items": return <div key={i} className="flex-1 px-1 space-y-0.5">{[1,2,3].map(x=><div key={x} className="flex gap-0.5 h-3 rounded-sm bg-white/5"><div className="w-3 rounded-l-sm bg-white/10"/><div className="flex-1 flex items-center"><div className="h-0.5 w-full rounded-full bg-white/15"/></div></div>)}</div>;
      case "order": return <div key={i} className="flex-1 px-1 space-y-0.5">{[1,2].map(x=><div key={x} className="flex justify-between h-2 items-center"><div className="h-0.5 w-8 rounded-full bg-white/15"/><div className="h-0.5 w-4 rounded-full bg-white/10"/></div>)}</div>;
      case "total": return <div key={i} className="px-1 pb-1 border-t border-white/10 pt-0.5 flex justify-between"><div className="h-1 w-6 rounded-full bg-white/20"/><div className="h-2 w-10 rounded bg-white/25"/></div>;
      case "search-bar": return <div key={i} className="mx-1 h-3 rounded-full bg-white/10 border border-white/10 flex items-center px-1"><div className="w-1 h-1 rounded-full bg-white/20 mr-0.5"/><div className="h-0.5 flex-1 rounded-full bg-white/10"/></div>;
      case "featured": return <div key={i} className="flex-1 grid grid-cols-2 gap-0.5 px-1">{[1,2].map(x=><div key={x} className="rounded-sm bg-white/8 min-h-[16px]"/>)}</div>;
      case "gallery": return <div key={i} className="flex-1 flex gap-0.5 px-1"><div className="flex-1 rounded bg-white/10"/><div className="w-4 flex flex-col gap-0.5">{[1,2,3].map(x=><div key={x} className="flex-1 rounded-sm bg-white/8"/>)}</div></div>;
      case "info": return <div key={i} className="px-1 pb-1 space-y-0.5"><div className="h-1.5 w-1/2 rounded-full bg-white/20"/><div className="h-0.5 w-full rounded-full bg-white/8"/><div className="h-0.5 w-3/4 rounded-full bg-white/8"/></div>;
      case "status": return <div key={i} className="px-1 pb-1 flex items-center gap-1"><div className="flex-1 h-1 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-white/25"/></div><div className="text-[4px] text-white/30">Em rota</div></div>;
      default: return <div key={i} className="h-3 mx-1 rounded bg-white/5"/>;
    }
  };

  return (
    <div className={`w-full h-full bg-gradient-to-br ${color} rounded-md flex flex-col gap-0.5 relative overflow-hidden`}>
      {sections.map((s, i) => renderSection(s, i))}
    </div>
  );
}

// Animated site preview card
function SitePreviewCard({ site }: { site: typeof portfolioSites[0] }) {
  const [currentScreen, setCurrentScreen] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScreen(prev => (prev + 1) % site.screens.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [site.screens.length]);

  const screen = site.screens[currentScreen];

  return (
    <Card className="overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      {/* Browser chrome */}
      <div className="h-5 bg-muted/50 border-b border-border/50 flex items-center px-2 gap-1.5">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
        </div>
        <div className="flex-1 mx-2 h-3 rounded-full bg-background/50 flex items-center px-1.5 gap-1">
          <Globe className="w-2 h-2 text-muted-foreground/40" />
          <span className="text-[7px] text-muted-foreground/60 truncate">{site.url}</span>
        </div>
      </div>

      {/* Screen preview */}
      <div className="h-28 relative">
        <div className="absolute inset-0 transition-all duration-700 ease-in-out">
          <MiniWireframe sections={screen.sections} color={screen.color} />
        </div>
        {/* Screen indicator dots */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          {site.screens.map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentScreen ? 'bg-white/70 w-2.5' : 'bg-white/25'}`}
            />
          ))}
        </div>
        {/* Page label */}
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
          <span className="text-[7px] text-white/80 font-medium">{screen.label}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-foreground">{site.name}</h4>
          <Badge variant="outline" className="text-[9px]">{site.category}</Badge>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Monitor className="w-3 h-3" />
          <span>{site.screens.length} páginas</span>
          <span className="mx-1">•</span>
          <span className="text-primary/70">Preview ao vivo</span>
        </div>
      </div>
    </Card>
  );
}

export default function Administrador() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('leads');

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

  const filtered = useMemo(() => {
    let result = leads.filter(l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').includes(search)
    );
    result.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortAsc ? diff : -diff;
    });
    return result;
  }, [leads, search, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, sortAsc]);

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
            <Input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
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
              <Layout className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-bold text-foreground">Help GB Tec Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="leads" className="gap-2">
              <Inbox className="w-4 h-4" /> Orçamentos <Badge variant="secondary" className="text-xs ml-1">{leads.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <Monitor className="w-4 h-4" /> Portfólio
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: LEADS ── */}
          <TabsContent value="leads">
            {/* Search + Sort */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, e-mail ou telefone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortAsc(!sortAsc)}
                className="shrink-0 gap-1.5"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortAsc ? 'Mais antigo' : 'Mais recente'}
              </Button>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map(lead => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── TAB: PORTFOLIO ── */}
          <TabsContent value="portfolio">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground mb-1">Projetos Desenvolvidos</h2>
              <p className="text-sm text-muted-foreground">Preview inteligente dos sites e sistemas criados pela Help GB Tec</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {portfolioSites.map(site => (
                <SitePreviewCard key={site.name} site={site} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

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
