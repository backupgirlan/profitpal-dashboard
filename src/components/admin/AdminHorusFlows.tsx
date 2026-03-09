import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Shield, Eye, Save, RefreshCw, ToggleLeft, ToggleRight,
  Clock, MessageSquare, AlertTriangle, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SETTINGS = {
  checkin_enabled: 'true',
  checkin_mandatory: 'true',
  checkin_reset_hour: '0',
  protection_enabled: 'true',
  protection_loss_threshold: '2',
  protection_lockout_minutes: '15',
  protection_block_trading: 'true',
  protection_auto_dialog: 'false',
  ai_default_tone: 'firme',
  checkin_message_healthy: 'Seu estado atual parece adequado para operar. Mantenha disciplina e respeite seu plano.',
  checkin_message_caution: 'Seu estado exige mais cautela hoje. Se decidir operar, faça isso com risco reduzido e total respeito ao gerenciamento.',
  checkin_message_risk: 'Hoje não parece ser um bom momento para operar. Seu estado atual aumenta fortemente o risco de impulsividade e quebra de plano.',
  protection_message_main: 'A partir daqui, o problema deixa de ser estratégia e passa a ser comportamento. Seu próximo erro pode não ser técnico. Pode ser emocional.',
  protection_message_dialog_opener: 'Eu preciso ser direto com você: neste momento, continuar operando tende a piorar sua tomada de decisão. Seu histórico e seu estado atual indicam risco alto de entrar em modo recuperação. Vamos parar e olhar isso com clareza antes que você transforme duas perdas em um problema maior.',
};

interface SectionProps { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; }
function Section({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-border/50 bg-card/80">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-accent/30 transition-colors rounded-xl"
      >
        <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <CardContent className="px-5 pb-5 pt-0 space-y-4 border-t border-border/30">
          <div className="pt-4">{children}</div>
        </CardContent>
      )}
    </Card>
  );
}

function ToggleRow({ label, desc, settingKey, settings, onChange }: any) {
  const value = settings[settingKey] === 'true';
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Switch checked={value} onCheckedChange={(v) => onChange(settingKey, String(v))} />
    </div>
  );
}

export default function AdminHorusFlows() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('horus_settings')
      .select('setting_key, setting_value')
      .in('setting_key', Object.keys(DEFAULT_SETTINGS));

    if (data?.length) {
      const map: Record<string, string> = { ...DEFAULT_SETTINGS };
      data.forEach(row => { map[row.setting_key] = row.setting_value; });
      setSettings(map);
    }
    setLoading(false);
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from('horus_settings').upsert(
          { setting_key: key, setting_value: value, setting_type: 'flow', updated_at: new Date().toISOString() },
          { onConflict: 'setting_key' }
        );
      }
      toast({ title: '✅ Configurações salvas', description: 'Fluxos inteligentes da Horus IA atualizados.' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center box-glow-strong">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Fluxos Inteligentes da Horus IA</h2>
              <p className="text-xs text-muted-foreground">Configure check-in diário, modo proteção e tom da IA</p>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gradient-gold text-primary-foreground font-display gap-2 shrink-0">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar tudo
        </Button>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge className={`text-xs gap-1.5 ${settings.checkin_enabled === 'true' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-muted text-muted-foreground'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${settings.checkin_enabled === 'true' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
          Check-in {settings.checkin_enabled === 'true' ? 'ativo' : 'inativo'}
        </Badge>
        <Badge className={`text-xs gap-1.5 ${settings.protection_enabled === 'true' ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-muted text-muted-foreground'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${settings.protection_enabled === 'true' ? 'bg-red-400' : 'bg-muted-foreground'}`} />
          Modo Proteção {settings.protection_enabled === 'true' ? 'ativo' : 'inativo'} · após {settings.protection_loss_threshold} losses
        </Badge>
        <Badge className="text-xs gap-1.5 bg-primary/15 text-primary border-primary/30">
          <Eye className="w-3 h-3" />
          Tom: {settings.ai_default_tone}
        </Badge>
      </div>

      {/* Check-in Settings */}
      <Section title="Check-in Diário" icon={Eye}>
        <div className="space-y-3">
          <ToggleRow label="Ativar check-in diário" desc="Modal aparece uma vez por dia ao abrir a plataforma" settingKey="checkin_enabled" settings={settings} onChange={handleChange} />
          <Separator className="bg-border/30" />
          <ToggleRow label="Check-in obrigatório" desc="Usuário não pode fechar sem responder" settingKey="checkin_mandatory" settings={settings} onChange={handleChange} />
          <Separator className="bg-border/30" />
          <div className="space-y-2 pt-1">
            <Label className="text-xs text-muted-foreground">Horário de reset diário (hora UTC)</Label>
            <Select value={settings.checkin_reset_hour} onValueChange={(v) => handleChange('checkin_reset_hour', v)}>
              <SelectTrigger className="bg-secondary h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{String(i).padStart(2, '0')}:00 UTC</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Protection Mode Settings */}
      <Section title="Modo Proteção" icon={Shield}>
        <div className="space-y-4">
          <ToggleRow label="Ativar Modo Proteção" desc="Overlay bloqueante após N losses seguidos" settingKey="protection_enabled" settings={settings} onChange={handleChange} />
          <Separator className="bg-border/30" />

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Ativar após quantos losses seguidos</Label>
            <Select value={settings.protection_loss_threshold} onValueChange={(v) => handleChange('protection_loss_threshold', v)}>
              <SelectTrigger className="bg-secondary h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 losses seguidos (recomendado)</SelectItem>
                <SelectItem value="3">3 losses seguidos</SelectItem>
                <SelectItem value="4">4 losses seguidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">Tempo de pausa recomendada</Label>
              <span className="text-xs font-mono text-primary">{settings.protection_lockout_minutes} min</span>
            </div>
            <Slider
              value={[parseInt(settings.protection_lockout_minutes)]}
              min={5}
              max={60}
              step={5}
              onValueChange={([v]) => handleChange('protection_lockout_minutes', String(v))}
              className="mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5 min</span><span>60 min</span>
            </div>
          </div>

          <Separator className="bg-border/30" />
          <ToggleRow label="Bloquear botão de operação" desc="Travar registro de trades durante o modo proteção" settingKey="protection_block_trading" settings={settings} onChange={handleChange} />
          <ToggleRow label="Abrir diálogo automaticamente" desc="Inicia conversa de proteção sem clicar" settingKey="protection_auto_dialog" settings={settings} onChange={handleChange} />
        </div>
      </Section>

      {/* AI Tone */}
      <Section title="Tom da IA" icon={MessageSquare}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tom padrão da Horus IA</Label>
            <Select value={settings.ai_default_tone} onValueChange={(v) => handleChange('ai_default_tone', v)}>
              <SelectTrigger className="bg-secondary h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="acolhedor">🤝 Acolhedor — gentil e empático</SelectItem>
                <SelectItem value="equilibrado">⚖️ Equilibrado — neutro e preciso</SelectItem>
                <SelectItem value="firme">💪 Firme — direto e assertivo</SelectItem>
                <SelectItem value="verdade_dura">🔥 Verdade Dura — incisivo e sem filtro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['acolhedor', 'equilibrado', 'firme', 'verdade_dura'].map(tone => (
              <button
                key={tone}
                onClick={() => handleChange('ai_default_tone', tone)}
                className={`p-3 rounded-xl border text-left transition-all ${settings.ai_default_tone === tone ? 'border-primary/50 bg-primary/10' : 'border-border/50 bg-secondary/30 hover:border-primary/30'}`}
              >
                <p className="text-xs font-semibold text-foreground capitalize">{tone === 'verdade_dura' ? 'Verdade Dura' : tone.charAt(0).toUpperCase() + tone.slice(1)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {tone === 'acolhedor' ? 'Gentil e empático' : tone === 'equilibrado' ? 'Neutro e preciso' : tone === 'firme' ? 'Direto e assertivo' : 'Incisivo, sem filtro'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Editable Messages */}
      <Section title="Mensagens Editáveis" icon={MessageSquare} defaultOpen={false}>
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mensagens do Check-in</p>
            {[
              { key: 'checkin_message_healthy', label: '✅ Estado saudável' },
              { key: 'checkin_message_caution', label: '⚠️ Estado de atenção' },
              { key: 'checkin_message_risk', label: '🔴 Estado de risco' },
            ].map(({ key, label }) => (
              <div key={key} className="mb-3">
                <Label className="text-[11px] text-muted-foreground mb-1.5 block">{label}</Label>
                <Textarea
                  value={settings[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  className="bg-secondary text-sm min-h-[64px] resize-y"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <Separator className="bg-border/30" />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mensagens do Modo Proteção</p>
            {[
              { key: 'protection_message_main', label: '🛑 Mensagem principal do overlay' },
              { key: 'protection_message_dialog_opener', label: '💬 Abertura da Conversa de Proteção' },
            ].map(({ key, label }) => (
              <div key={key} className="mb-3">
                <Label className="text-[11px] text-muted-foreground mb-1.5 block">{label}</Label>
                <Textarea
                  value={settings[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  className="bg-secondary text-sm min-h-[80px] resize-y"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Save button */}
      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} disabled={saving} className="gradient-gold text-primary-foreground font-display gap-2 h-11 px-8">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </div>
    </div>
  );
}
