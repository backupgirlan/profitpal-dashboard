import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Pencil, Trash2, Search, Star, Eye, EyeOff,
  LayoutDashboard, FolderOpen, Users, MessageSquare, LogOut
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

type Demo = {
  id: string;
  name: string;
  category: string;
  cover_image: string | null;
  gallery_images: string[];
  demo_link: string | null;
  description: string | null;
  segment: string | null;
  is_featured: boolean;
  is_active: boolean;
};

const categories = ["site", "sistema", "aplicativo", "ia", "landing", "loja"];

const AdminDemos = () => {
  const { user, loading: authLoading } = useAuth();
  const [demos, setDemos] = useState<Demo[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [activeTab, setActiveTab] = useState<"demos" | "leads" | "testimonials">("demos");
  const [editing, setEditing] = useState<Demo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "site", cover_image: "", demo_link: "",
    description: "", segment: "", is_featured: false, is_active: true,
  });

  const fetchAll = async () => {
    const [{ data: d }, { data: l }, { data: t }] = await Promise.all([
      supabase.from("project_demos").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_leads").select("*").order("created_at", { ascending: false }),
      supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
    ]);
    if (d) setDemos(d as Demo[]);
    if (l) setLeads(l);
    if (t) setTestimonials(t);
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  const resetForm = () => {
    setForm({ name: "", category: "site", cover_image: "", demo_link: "", description: "", segment: "", is_featured: false, is_active: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (editing) {
      await supabase.from("project_demos").update(form).eq("id", editing.id);
    } else {
      await supabase.from("project_demos").insert([form]);
    }
    resetForm();
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("project_demos").delete().eq("id", id);
    fetchAll();
  };

  const startEdit = (demo: Demo) => {
    setForm({
      name: demo.name, category: demo.category, cover_image: demo.cover_image || "",
      demo_link: demo.demo_link || "", description: demo.description || "",
      segment: demo.segment || "", is_featured: demo.is_featured, is_active: demo.is_active,
    });
    setEditing(demo);
    setShowForm(true);
  };

  const filteredDemos = demos.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || d.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 p-4 hidden md:block">
        <h2 className="font-display font-bold text-lg gradient-neon-text mb-8">HELP TEC Admin</h2>
        <nav className="space-y-1">
          {[
            { key: "demos", icon: FolderOpen, label: "Projetos" },
            { key: "leads", icon: Users, label: "Leads" },
            { key: "testimonials", icon: MessageSquare, label: "Depoimentos" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === item.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4">
          <a href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="w-3 h-3" /> Voltar ao Site
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Total Projetos</p>
            <p className="text-2xl font-display font-bold gradient-neon-text">{demos.length}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Ativos</p>
            <p className="text-2xl font-display font-bold text-primary">{demos.filter(d => d.is_active).length}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Leads</p>
            <p className="text-2xl font-display font-bold text-neon-purple">{leads.length}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Depoimentos</p>
            <p className="text-2xl font-display font-bold text-neon-cyan">{testimonials.length}</p>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex gap-2 mb-6 md:hidden">
          {["demos", "leads", "testimonials"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-4 py-2 rounded-lg text-xs font-medium ${activeTab === t ? "gradient-neon text-primary-foreground" : "glass"}`}
            >
              {t === "demos" ? "Projetos" : t === "leads" ? "Leads" : "Depoimentos"}
            </button>
          ))}
        </div>

        {/* DEMOS TAB */}
        {activeTab === "demos" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar projeto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-muted/50" />
              </div>
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="h-10 rounded-md border border-border bg-muted/50 px-3 text-sm">
                <option value="all">Todas categorias</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-neon text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Novo Projeto
              </Button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="glass-strong rounded-2xl p-6 mb-6 space-y-4 box-glow">
                <h3 className="font-display font-semibold">{editing ? "Editar" : "Novo"} Projeto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Nome do projeto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/50" />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 rounded-md border border-border bg-muted/50 px-3 text-sm">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Input placeholder="URL da imagem de capa" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="bg-muted/50" />
                  <Input placeholder="Link da demo" value={form.demo_link} onChange={(e) => setForm({ ...form, demo_link: e.target.value })} className="bg-muted/50" />
                  <Input placeholder="Segmento" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} className="bg-muted/50" />
                </div>
                <Textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-muted/50" />
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                    Destaque
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    Ativo
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={!form.name} className="gradient-neon text-primary-foreground">Salvar</Button>
                  <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-3">
              {filteredDemos.map((demo) => (
                <div key={demo.id} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 overflow-hidden shrink-0">
                    {demo.cover_image && <img src={demo.cover_image} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{demo.name}</h4>
                      {demo.is_featured && <Star className="w-3 h-3 text-primary shrink-0" />}
                      {!demo.is_active && <EyeOff className="w-3 h-3 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{demo.category} • {demo.segment}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(demo)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(demo.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LEADS TAB */}
        {activeTab === "leads" && (
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg mb-4">Leads Recebidos</h3>
            {leads.map((lead) => (
              <div key={lead.id} className="glass rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{lead.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple">{lead.project_type}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{lead.email} • {lead.phone}</p>
                <p className="text-xs text-muted-foreground">{lead.message}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-2">{new Date(lead.created_at).toLocaleString("pt-BR")}</p>
              </div>
            ))}
            {leads.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum lead recebido ainda.</p>}
          </div>
        )}

        {/* TESTIMONIALS TAB */}
        {activeTab === "testimonials" && (
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg mb-4">Depoimentos</h3>
            {testimonials.map((t) => (
              <div key={t.id} className="glass rounded-xl p-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.company}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t.comment}</p>
              </div>
            ))}
            {testimonials.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum depoimento cadastrado.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDemos;
