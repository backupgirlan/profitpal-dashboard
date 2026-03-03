import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Play, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getYoutubeEmbedUrl = (url: string) => {
  let videoId = '';
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') videoId = u.pathname.slice(1);
    else if (u.searchParams.get('v')) videoId = u.searchParams.get('v') || '';
    else if (u.pathname.includes('/embed/')) videoId = u.pathname.split('/embed/')[1];
  } catch { return ''; }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

interface Category { id: string; title: string; sort_order: number; }
interface Video { id: string; category_id: string; title: string; youtube_url: string; sort_order: number; }

const Courses = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    supabase.from('course_categories').select('*').order('sort_order')
      .then(({ data }) => { if (data) { setCategories(data as Category[]); if (data.length > 0) setOpenCategory(data[0].id); } });
    supabase.from('course_videos').select('*').order('sort_order')
      .then(({ data }) => { if (data) setVideos(data as Video[]); });
  }, []);

  const videosByCategory = (catId: string) => videos.filter(v => v.category_id === catId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <GraduationCap className="w-6 h-6" /> {t('courses.title')}
        </h1>
        <p className="text-muted-foreground">{t('courses.subtitle')}</p>
      </div>
      {activeVideo && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="aspect-video"><iframe src={getYoutubeEmbedUrl(activeVideo.youtube_url)} title={activeVideo.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
          <div className="p-4"><h3 className="font-display text-sm font-bold text-foreground">{activeVideo.title}</h3></div>
        </div>
      )}
      <div className="space-y-2">
        {categories.map((cat) => {
          const isOpen = openCategory === cat.id;
          const catVideos = videosByCategory(cat.id);
          return (
            <div key={cat.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <button onClick={() => setOpenCategory(isOpen ? null : cat.id)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <span className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  {cat.title}
                </span>
                <span className="text-xs text-muted-foreground">{catVideos.length} {catVideos.length !== 1 ? t('courses.videos_plural') : t('courses.video')}</span>
              </button>
              {isOpen && (
                <div className="border-t border-border">
                  {catVideos.length === 0 ? (
                    <p className="p-4 text-center text-muted-foreground text-sm">{t('courses.noVideosInCategory')}</p>
                  ) : catVideos.map((v) => (
                    <button key={v.id} onClick={() => setActiveVideo(v)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0 ${activeVideo?.id === v.id ? 'bg-primary/10 text-primary' : 'text-foreground'}`}>
                      <Play className={`w-4 h-4 shrink-0 ${activeVideo?.id === v.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm truncate">{v.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {categories.length === 0 && <div className="text-center text-muted-foreground py-8">{t('courses.noCourses')}</div>}
      </div>
    </div>
  );
};

export default Courses;
