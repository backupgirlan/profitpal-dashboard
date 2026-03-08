import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BookOpen, Save, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const EMOTIONAL_OPTIONS = [
  { key: 'calmo', label: '😌 Calmo', color: 'border-success/50 bg-success/10 text-success' },
  { key: 'concentrado', label: '🎯 Concentrado', color: 'border-accent/50 bg-accent/10 text-accent' },
  { key: 'ansioso', label: '😰 Ansioso', color: 'border-destructive/50 bg-destructive/10 text-destructive' },
  { key: 'impulsivo', label: '⚡ Impulsivo', color: 'border-destructive/50 bg-destructive/10 text-destructive' },
];

export default function EmotionalDiary() {
  const { user } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [lessons, setLessons] = useState('');
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [todayEntry, setTodayEntry] = useState<any>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    // Load today's entry
    supabase.from('trader_diary').select('*').eq('user_id', user.id).eq('entry_date', today).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTodayEntry(data);
          setSelectedEmotion(data.emotional_state || '');
          setMistakes(data.mistakes || '');
          setLessons(data.lessons || '');
        }
      });
    // Load recent entries
    supabase.from('trader_diary').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(7)
      .then(({ data }) => { if (data) setEntries(data); });
  }, [user, today]);

  const handleSave = async () => {
    if (!user || !selectedEmotion) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      entry_date: today,
      emotional_state: selectedEmotion,
      mistakes: mistakes || null,
      lessons: lessons || null,
    };
    
    if (todayEntry) {
      await supabase.from('trader_diary').update(payload).eq('id', todayEntry.id);
    } else {
      await supabase.from('trader_diary').insert(payload);
    }
    
    toast.success('Diário salvo com sucesso!');
    setSaving(false);
    // Reload
    const { data } = await supabase.from('trader_diary').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(7);
    if (data) setEntries(data);
    const { data: te } = await supabase.from('trader_diary').select('*').eq('user_id', user.id).eq('entry_date', today).maybeSingle();
    if (te) setTodayEntry(te);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-accent" />
          Diário Emocional
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registre seu estado emocional e lições aprendidas ao final do dia.
        </p>
      </div>

      {/* Today's Entry */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-display text-xs font-bold text-foreground uppercase tracking-wider">
              Registro de Hoje — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">Como foi seu emocional hoje?</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {EMOTIONAL_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSelectedEmotion(opt.key)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  selectedEmotion === opt.key ? opt.color : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Erros cometidos hoje
              </label>
              <Textarea
                value={mistakes}
                onChange={e => setMistakes(e.target.value)}
                placeholder="Ex: Operei fora do horário, não segui o gerenciamento..."
                className="bg-secondary/50 min-h-[80px] text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                O que aprendi hoje no mercado?
              </label>
              <Textarea
                value={lessons}
                onChange={e => setLessons(e.target.value)}
                placeholder="Ex: Paciência nos momentos de lateralização é essencial..."
                className="bg-secondary/50 min-h-[80px] text-sm"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!selectedEmotion || saving}
            className="gradient-gold text-primary-foreground font-display gap-2 mt-6 w-full"
          >
            <Save className="w-4 h-4" /> {todayEntry ? 'Atualizar Registro' : 'Salvar Registro'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent entries */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-6">
          <h3 className="font-display text-xs font-bold text-foreground uppercase tracking-wider mb-4">
            Registros Recentes
          </h3>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro encontrado. Comece registrando seu dia!</p>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => {
                const emotionOpt = EMOTIONAL_OPTIONS.find(o => o.key === entry.emotional_state);
                return (
                  <div key={entry.id} className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.entry_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {emotionOpt && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${emotionOpt.color}`}>
                          {emotionOpt.label}
                        </span>
                      )}
                    </div>
                    {entry.mistakes && (
                      <p className="text-xs text-muted-foreground"><span className="text-destructive font-medium">Erros:</span> {entry.mistakes}</p>
                    )}
                    {entry.lessons && (
                      <p className="text-xs text-muted-foreground mt-1"><span className="text-success font-medium">Lições:</span> {entry.lessons}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
