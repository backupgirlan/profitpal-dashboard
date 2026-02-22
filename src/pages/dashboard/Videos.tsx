import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Youtube } from 'lucide-react';

const getYoutubeEmbedUrl = (url: string) => {
  // Handle youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
  let videoId = '';
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1);
    } else if (u.searchParams.get('v')) {
      videoId = u.searchParams.get('v') || '';
    } else if (u.pathname.includes('/embed/')) {
      videoId = u.pathname.split('/embed/')[1];
    }
  } catch {
    return '';
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

const Videos = () => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('youtube_videos').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setVideos(data); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <Youtube className="w-6 h-6" /> Vídeos
        </h1>
        <p className="text-muted-foreground">Conteúdos em vídeo para sua evolução</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {videos.map((v) => {
          const embedUrl = getYoutubeEmbedUrl(v.youtube_url);
          return (
            <div key={v.id} className="bg-card border border-border rounded-lg overflow-hidden">
              {embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={v.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-secondary flex items-center justify-center text-muted-foreground text-sm">
                  Link inválido
                </div>
              )}
              <div className="p-4">
                <h3 className="font-display text-sm font-bold text-foreground">{v.title}</h3>
              </div>
            </div>
          );
        })}
        {videos.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">Nenhum vídeo disponível no momento</div>
        )}
      </div>
    </div>
  );
};

export default Videos;
