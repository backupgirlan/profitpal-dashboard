import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Quote } from 'lucide-react';

const Psychology = () => {
  const [contents, setContents] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('psychology_content').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setContents(data); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <Brain className="w-6 h-6" /> Psicologia do Trader
        </h1>
        <p className="text-muted-foreground">Fortaleça sua mentalidade para operar com consistência</p>
      </div>

      {contents.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Brain className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Conteúdo em breve...</p>
          <p className="text-sm text-muted-foreground mt-1">O administrador irá adicionar textos motivacionais aqui.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contents.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-6 box-glow">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{c.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{c.content}</p>
                  <span className="text-xs text-primary mt-3 inline-block">{c.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Psychology;
