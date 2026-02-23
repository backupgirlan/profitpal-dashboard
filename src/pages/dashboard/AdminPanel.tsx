import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, CheckCircle, XCircle, Plus, Trash2, Youtube, MessageSquare, GraduationCap } from 'lucide-react';

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

  // Advice
  const [advices, setAdvices] = useState<any[]>([]);
  const [adviceTitle, setAdviceTitle] = useState('');
  const [adviceContent, setAdviceContent] = useState('');

  // Videos
  const [videos, setVideos] = useState<any[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Courses
  const [courseCategories, setCourseCategories] = useState<any[]>([]);
  const [courseVideos, setCourseVideos] = useState<any[]>([]);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCourseVideoTitle, setNewCourseVideoTitle] = useState('');
  const [newCourseVideoUrl, setNewCourseVideoUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data }) => {
        setIsAdmin(!!data);
        if (data) {
          loadProfiles();
          loadAdvices();
          loadVideos();
          loadCourseData();
        } else {
          setLoading(false);
        }
      });
  }, [user]);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('id, user_id, display_name, is_vip, created_at').order('created_at', { ascending: false });
    if (data) setProfiles(data as UserProfile[]);
    setLoading(false);
  };

  const loadAdvices = async () => {
    const { data } = await supabase.from('admin_advice').select('*').order('created_at', { ascending: false });
    if (data) setAdvices(data);
  };

  const loadVideos = async () => {
    const { data } = await supabase.from('youtube_videos').select('*').order('created_at', { ascending: false });
    if (data) setVideos(data);
  };

  const loadCourseData = async () => {
    const { data: cats } = await supabase.from('course_categories').select('*').order('sort_order');
    if (cats) setCourseCategories(cats);
    const { data: vids } = await supabase.from('course_videos').select('*').order('sort_order');
    if (vids) setCourseVideos(vids);
  };

  const addCourseCategory = async () => {
    if (!newCatTitle) return;
    const { error } = await supabase.from('course_categories').insert({ title: newCatTitle, sort_order: courseCategories.length });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setNewCatTitle('');
    loadCourseData();
    toast({ title: 'Categoria criada!' });
  };

  const deleteCourseCategory = async (id: string) => {
    await supabase.from('course_categories').delete().eq('id', id);
    loadCourseData();
  };

  const addCourseVideo = async () => {
    if (!newCourseVideoTitle || !newCourseVideoUrl || !selectedCategoryId) return;
    const { error } = await supabase.from('course_videos').insert({
      title: newCourseVideoTitle,
      youtube_url: newCourseVideoUrl,
      category_id: selectedCategoryId,
      sort_order: courseVideos.filter(v => v.category_id === selectedCategoryId).length,
    });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setNewCourseVideoTitle('');
    setNewCourseVideoUrl('');
    loadCourseData();
    toast({ title: 'Vídeo do curso adicionado!' });
  };

  const deleteCourseVideo = async (id: string) => {
    await supabase.from('course_videos').delete().eq('id', id);
    loadCourseData();
  };

  const toggleVip = async (userId: string, currentVip: boolean) => {
    await supabase.from('profiles').update({ is_vip: !currentVip }).eq('user_id', userId);
    toast({ title: !currentVip ? 'Acesso VIP liberado!' : 'Acesso VIP removido.' });
    loadProfiles();
  };

  const addAdvice = async () => {
    if (!adviceTitle || !adviceContent) return;
    const { error } = await supabase.from('admin_advice').insert({ title: adviceTitle, content: adviceContent });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setAdviceTitle('');
    setAdviceContent('');
    loadAdvices();
    toast({ title: 'Conselho adicionado!' });
  };

  const deleteAdvice = async (id: string) => {
    await supabase.from('admin_advice').delete().eq('id', id);
    loadAdvices();
  };

  const addVideo = async () => {
    if (!videoTitle || !videoUrl) return;
    const { error } = await supabase.from('youtube_videos').insert({ title: videoTitle, youtube_url: videoUrl });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setVideoTitle('');
    setVideoUrl('');
    loadVideos();
    toast({ title: 'Vídeo adicionado!' });
  };

  const deleteVideo = async (id: string) => {
    await supabase.from('youtube_videos').delete().eq('id', id);
    loadVideos();
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
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-secondary w-full justify-start flex-wrap">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="advice">Conselhos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary max-w-sm" />
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
                    <Button size="sm" variant={p.is_vip ? 'outline' : 'default'} onClick={() => toggleVip(p.user_id, p.is_vip)}
                      className={p.is_vip ? 'border-destructive/50 text-destructive hover:bg-destructive/10' : 'gradient-gold text-primary-foreground'}>
                      {p.is_vip ? 'Revogar' : 'Liberar'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ADVICE TAB */}
        <TabsContent value="advice" className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Novo Conselho
            </h3>
            <Input placeholder="Título" value={adviceTitle} onChange={(e) => setAdviceTitle(e.target.value)} className="bg-secondary" />
            <Textarea placeholder="Conteúdo do conselho..." value={adviceContent} onChange={(e) => setAdviceContent(e.target.value)} className="bg-secondary min-h-[80px]" />
            <Button onClick={addAdvice} className="gradient-gold text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Adicionar Conselho
            </Button>
          </div>
          <div className="space-y-2">
            {advices.map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-sm font-bold text-foreground">{a.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteAdvice(a.id)} className="text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {advices.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Nenhum conselho cadastrado</p>}
          </div>
        </TabsContent>

        {/* VIDEOS TAB */}
        <TabsContent value="videos" className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Youtube className="w-4 h-4 text-primary" /> Novo Vídeo
            </h3>
            <Input placeholder="Título do vídeo" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="bg-secondary" />
            <Input placeholder="Link do YouTube (ex: https://youtu.be/...)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="bg-secondary" />
            <Button onClick={addVideo} className="gradient-gold text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Adicionar Vídeo
            </Button>
          </div>
          <div className="space-y-2">
            {videos.map((v) => (
              <div key={v.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-sm font-bold text-foreground">{v.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{v.youtube_url}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteVideo(v.id)} className="text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {videos.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Nenhum vídeo cadastrado</p>}
          </div>
        </TabsContent>

        {/* COURSES TAB */}
        <TabsContent value="courses" className="space-y-4">
          {/* Add Category */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> Nova Categoria
            </h3>
            <div className="flex gap-2">
              <Input placeholder="Nome da categoria" value={newCatTitle} onChange={(e) => setNewCatTitle(e.target.value)} className="bg-secondary" />
              <Button onClick={addCourseCategory} className="gradient-gold text-primary-foreground gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Criar
              </Button>
            </div>
          </div>

          {/* Add Video to Category */}
          {courseCategories.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <Youtube className="w-4 h-4 text-primary" /> Adicionar Vídeo ao Curso
              </h3>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {courseCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Título do vídeo" value={newCourseVideoTitle} onChange={(e) => setNewCourseVideoTitle(e.target.value)} className="bg-secondary" />
              <Input placeholder="Link do YouTube" value={newCourseVideoUrl} onChange={(e) => setNewCourseVideoUrl(e.target.value)} className="bg-secondary" />
              <Button onClick={addCourseVideo} className="gradient-gold text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Adicionar Vídeo
              </Button>
            </div>
          )}

          {/* List Categories & Videos */}
          <div className="space-y-3">
            {courseCategories.map((cat) => {
              const catVids = courseVideos.filter((v: any) => v.category_id === cat.id);
              return (
                <div key={cat.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-secondary/50">
                    <span className="font-display text-sm font-bold text-foreground">{cat.title}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteCourseCategory(cat.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {catVids.length === 0 ? (
                    <p className="p-3 text-center text-muted-foreground text-xs">Nenhum vídeo</p>
                  ) : (
                    catVids.map((v: any) => (
                      <div key={v.id} className="flex items-center justify-between px-3 py-2 border-t border-border/50">
                        <div>
                          <span className="text-sm text-foreground">{v.title}</span>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{v.youtube_url}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteCourseVideo(v.id)} className="text-destructive shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
            {courseCategories.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Nenhuma categoria criada</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
