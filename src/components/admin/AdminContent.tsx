import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare, Youtube, GraduationCap, Trophy, Plus, Trash2, FileText
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminContent() {
  const { toast } = useToast();
  const [advices, setAdvices] = useState<any[]>([]);
  const [adviceTitle, setAdviceTitle] = useState('');
  const [adviceContent, setAdviceContent] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [courseCategories, setCourseCategories] = useState<any[]>([]);
  const [courseVideos, setCourseVideos] = useState<any[]>([]);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCourseVideoTitle, setNewCourseVideoTitle] = useState('');
  const [newCourseVideoUrl, setNewCourseVideoUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [liveScores, setLiveScores] = useState<Record<number, { wins: number; losses: number; id?: string }>>({});
  const [savingScore, setSavingScore] = useState<number | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [{ data: adv }, { data: vid }, { data: cats }, { data: cvids }] = await Promise.all([
      supabase.from('admin_advice').select('*').order('created_at', { ascending: false }),
      supabase.from('youtube_videos').select('*').order('created_at', { ascending: false }),
      supabase.from('course_categories').select('*').order('sort_order'),
      supabase.from('course_videos').select('*').order('sort_order'),
    ]);
    if (adv) setAdvices(adv);
    if (vid) setVideos(vid);
    if (cats) setCourseCategories(cats);
    if (cvids) setCourseVideos(cvids);
    loadLiveScores();
  };

  const getMonday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  const loadLiveScores = async () => {
    const weekStart = getMonday();
    const { data } = await supabase.from('live_scores').select('*').eq('week_start', weekStart);
    const map: Record<number, { wins: number; losses: number; id?: string }> = {};
    for (let i = 0; i <= 6; i++) map[i] = { wins: 0, losses: 0 };
    if (data) data.forEach((s: any) => { map[s.day_of_week] = { wins: s.wins, losses: s.losses, id: s.id }; });
    setLiveScores(map);
  };

  const updateScore = async (dayIdx: number, field: 'wins' | 'losses', delta: number) => {
    setSavingScore(dayIdx);
    const current = liveScores[dayIdx] || { wins: 0, losses: 0 };
    const newVal = Math.max(0, (current[field] || 0) + delta);
    const weekStart = getMonday();
    if (current.id) {
      await supabase.from('live_scores').update({ [field]: newVal, updated_at: new Date().toISOString() }).eq('id', current.id);
    } else {
      await supabase.from('live_scores').insert({ day_of_week: dayIdx, [field]: newVal, week_start: weekStart });
    }
    await loadLiveScores();
    setSavingScore(null);
  };

  const addAdvice = async () => { if (!adviceTitle || !adviceContent) return; await supabase.from('admin_advice').insert({ title: adviceTitle, content: adviceContent }); setAdviceTitle(''); setAdviceContent(''); loadAll(); toast({ title: 'Conselho adicionado' }); };
  const deleteAdvice = async (id: string) => { await supabase.from('admin_advice').delete().eq('id', id); loadAll(); };
  const addVideo = async () => { if (!videoTitle || !videoUrl) return; await supabase.from('youtube_videos').insert({ title: videoTitle, youtube_url: videoUrl }); setVideoTitle(''); setVideoUrl(''); loadAll(); toast({ title: 'Vídeo adicionado' }); };
  const deleteVideo = async (id: string) => { await supabase.from('youtube_videos').delete().eq('id', id); loadAll(); };
  const addCourseCategory = async () => { if (!newCatTitle) return; await supabase.from('course_categories').insert({ title: newCatTitle, sort_order: courseCategories.length }); setNewCatTitle(''); loadAll(); toast({ title: 'Categoria criada' }); };
  const deleteCourseCategory = async (id: string) => { await supabase.from('course_categories').delete().eq('id', id); loadAll(); };
  const addCourseVideo = async () => { if (!newCourseVideoTitle || !newCourseVideoUrl || !selectedCategoryId) return; await supabase.from('course_videos').insert({ title: newCourseVideoTitle, youtube_url: newCourseVideoUrl, category_id: selectedCategoryId, sort_order: courseVideos.filter(v => v.category_id === selectedCategoryId).length }); setNewCourseVideoTitle(''); setNewCourseVideoUrl(''); loadAll(); toast({ title: 'Vídeo adicionado ao curso' }); };
  const deleteCourseVideo = async (id: string) => { await supabase.from('course_videos').delete().eq('id', id); loadAll(); };

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Gestão de Conteúdo</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie conselhos, vídeos, cursos e placar ao vivo</p>
      </div>

      <Tabs defaultValue="advice" className="w-full">
        <TabsList className="bg-secondary w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="advice" className="text-xs gap-1"><MessageSquare className="w-3 h-3" /> Conselhos</TabsTrigger>
          <TabsTrigger value="videos" className="text-xs gap-1"><Youtube className="w-3 h-3" /> Vídeos</TabsTrigger>
          <TabsTrigger value="courses" className="text-xs gap-1"><GraduationCap className="w-3 h-3" /> Cursos</TabsTrigger>
          <TabsTrigger value="livescores" className="text-xs gap-1"><Trophy className="w-3 h-3" /> Placar</TabsTrigger>
        </TabsList>

        {/* Advice */}
        <TabsContent value="advice" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Novo Conselho
              </h3>
              <Input placeholder="Título" value={adviceTitle} onChange={e => setAdviceTitle(e.target.value)} className="bg-secondary" />
              <Textarea placeholder="Conteúdo" value={adviceContent} onChange={e => setAdviceContent(e.target.value)} className="bg-secondary min-h-[80px]" />
              <Button onClick={addAdvice} className="gradient-gold text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Adicionar</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {advices.map(a => (
              <Card key={a.id} className="border-border/50">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div><h4 className="text-sm font-bold text-foreground">{a.title}</h4><p className="text-xs text-muted-foreground mt-1">{a.content}</p></div>
                  <Button variant="ghost" size="sm" onClick={() => deleteAdvice(a.id)} className="text-destructive shrink-0"><Trash2 className="w-4 h-4" /></Button>
                </CardContent>
              </Card>
            ))}
            {advices.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Nenhum conselho ainda</p>}
          </div>
        </TabsContent>

        {/* Videos */}
        <TabsContent value="videos" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Youtube className="w-4 h-4 text-primary" /> Novo Vídeo
              </h3>
              <Input placeholder="Título" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="bg-secondary" />
              <Input placeholder="URL do YouTube" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="bg-secondary" />
              <Button onClick={addVideo} className="gradient-gold text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Adicionar</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {videos.map(v => (
              <Card key={v.id} className="border-border/50">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div><h4 className="text-sm font-bold text-foreground">{v.title}</h4><p className="text-xs text-muted-foreground truncate max-w-xs">{v.youtube_url}</p></div>
                  <Button variant="ghost" size="sm" onClick={() => deleteVideo(v.id)} className="text-destructive shrink-0"><Trash2 className="w-4 h-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Courses */}
        <TabsContent value="courses" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> Nova Categoria
              </h3>
              <div className="flex gap-2">
                <Input placeholder="Nome da categoria" value={newCatTitle} onChange={e => setNewCatTitle(e.target.value)} className="bg-secondary" />
                <Button onClick={addCourseCategory} className="gradient-gold text-primary-foreground gap-2 shrink-0"><Plus className="w-4 h-4" /> Criar</Button>
              </div>
            </CardContent>
          </Card>
          {courseCategories.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-display font-bold">Adicionar Vídeo ao Curso</h3>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="bg-secondary"><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                  <SelectContent>{courseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Título do vídeo" value={newCourseVideoTitle} onChange={e => setNewCourseVideoTitle(e.target.value)} className="bg-secondary" />
                <Input placeholder="URL do YouTube" value={newCourseVideoUrl} onChange={e => setNewCourseVideoUrl(e.target.value)} className="bg-secondary" />
                <Button onClick={addCourseVideo} className="gradient-gold text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Adicionar</Button>
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            {courseCategories.map(cat => {
              const catVids = courseVideos.filter((v: any) => v.category_id === cat.id);
              return (
                <Card key={cat.id} className="border-border/50 overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-secondary/30">
                    <span className="text-sm font-display font-bold text-foreground">{cat.title}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteCourseCategory(cat.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  {catVids.length === 0 ? (
                    <p className="p-3 text-center text-muted-foreground text-xs">Nenhum vídeo nesta categoria</p>
                  ) : catVids.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between px-3 py-2 border-t border-border/30">
                      <div><span className="text-sm text-foreground">{v.title}</span><p className="text-xs text-muted-foreground truncate max-w-[200px]">{v.youtube_url}</p></div>
                      <Button variant="ghost" size="sm" onClick={() => deleteCourseVideo(v.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Live Scores */}
        <TabsContent value="livescores" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Placar ao Vivo
              </h3>
              <p className="text-xs text-muted-foreground">Atualize o placar da semana</p>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 0].map(dayIdx => {
                  const score = liveScores[dayIdx] || { wins: 0, losses: 0 };
                  const isSaving = savingScore === dayIdx;
                  return (
                    <div key={dayIdx} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                      <span className="font-display text-sm font-bold text-foreground w-10">{dayLabels[dayIdx]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">W:</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" disabled={isSaving} onClick={() => updateScore(dayIdx, 'wins', -1)}>-</Button>
                        <span className="text-sm font-bold text-success w-6 text-center">{score.wins}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-success" disabled={isSaving} onClick={() => updateScore(dayIdx, 'wins', 1)}>+</Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">L:</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-success" disabled={isSaving} onClick={() => updateScore(dayIdx, 'losses', -1)}>-</Button>
                        <span className="text-sm font-bold text-destructive w-6 text-center">{score.losses}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" disabled={isSaving} onClick={() => updateScore(dayIdx, 'losses', 1)}>+</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
