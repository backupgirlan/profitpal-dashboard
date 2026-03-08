import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, User, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [stopDaily, setStopDaily] = useState('');
  const [stopWeekly, setStopWeekly] = useState('');
  const [maxTradesDay, setMaxTradesDay] = useState('');
  const [maxLossDay, setMaxLossDay] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, stop_daily, stop_weekly').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || '');
          setStopDaily(String(data.stop_daily || ''));
          setStopWeekly(String(data.stop_weekly || ''));
        }
      });
    // Load local settings
    const local = localStorage.getItem('trader_settings');
    if (local) {
      const parsed = JSON.parse(local);
      setMaxTradesDay(String(parsed.maxTradesDay || ''));
      setMaxLossDay(String(parsed.maxLossDay || ''));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: displayName || null,
      stop_daily: Number(stopDaily) || 0,
      stop_weekly: Number(stopWeekly) || 0,
    }).eq('user_id', user.id);

    localStorage.setItem('trader_settings', JSON.stringify({
      maxTradesDay: Number(maxTradesDay) || 0,
      maxLossDay: Number(maxLossDay) || 0,
    }));

    toast.success('Configurações salvas!');
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seu perfil e limites de operação.</p>
      </div>

      {/* Profile */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-6">
          <h3 className="font-display text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Perfil
          </h3>
          <div>
            <Label className="text-xs">Nome de exibição</Label>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-secondary/50 mt-1" placeholder="Seu nome" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Email: {user?.email}</p>
        </CardContent>
      </Card>

      {/* Stop Limits */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-6">
          <h3 className="font-display text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" /> Limites de Proteção
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Stop Diário (R$)</Label>
              <Input type="number" value={stopDaily} onChange={e => setStopDaily(e.target.value)} className="bg-secondary/50 mt-1" placeholder="0" />
              <p className="text-[10px] text-muted-foreground mt-1">Perda máxima por dia</p>
            </div>
            <div>
              <Label className="text-xs">Stop Semanal (R$)</Label>
              <Input type="number" value={stopWeekly} onChange={e => setStopWeekly(e.target.value)} className="bg-secondary/50 mt-1" placeholder="0" />
              <p className="text-[10px] text-muted-foreground mt-1">Perda máxima por semana</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtrading limits */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-6">
          <h3 className="font-display text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Bloqueio de Overtrading
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Máximo de operações/dia</Label>
              <Input type="number" value={maxTradesDay} onChange={e => setMaxTradesDay(e.target.value)} className="bg-secondary/50 mt-1" placeholder="0 = sem limite" />
            </div>
            <div>
              <Label className="text-xs">Máximo de losses/dia</Label>
              <Input type="number" value={maxLossDay} onChange={e => setMaxLossDay(e.target.value)} className="bg-secondary/50 mt-1" placeholder="0 = sem limite" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Quando o limite for atingido, novas operações serão bloqueadas. "Limite atingido. Disciplina é a chave do trader consistente."
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gradient-gold text-primary-foreground font-display gap-2 w-full">
        <Save className="w-4 h-4" /> Salvar Configurações
      </Button>
    </div>
  );
}
