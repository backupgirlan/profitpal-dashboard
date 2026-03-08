import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye, Brain, FileText, Activity, Shield, Save, Settings, Zap, Clock, AlertTriangle
} from 'lucide-react';

export default function AdminHorusIA() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [prompts, setPrompts] = useState<any[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('horus_settings').select('*'),
      supabase.from('horus_prompts').select('*').order('prompt_key'),
    ]);
    if (s) {
      const map: Record<string, string> = {};
      s.forEach((item: any) => { map[item.setting_key] = item.setting_value; });
      setSettings(map);
    }
    if (p) setPrompts(p);
  };

  const updateSetting = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await supabase.from('horus_settings').update({ setting_value: value, updated_at: new Date().toISOString() }).eq('setting_key', key);
  };

  const savePrompt = async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    const { error } = await supabase.from('horus_prompts').update({ prompt_value: prompt.prompt_value, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else toast({ title: 'Prompt salvo com sucesso' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
          <Eye className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-[28px] font-display font-bold text-foreground">Controle da Horus IA</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie prompts, limites, acesso e configurações da IA</p>
        </div>
      </div>

      <Tabs defaultValue="control" className="w-full">
        <TabsList className="bg-secondary w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="control" className="text-xs gap-1"><Settings className="w-3 h-3" /> Controle</TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs gap-1"><FileText className="w-3 h-3" /> Prompts</TabsTrigger>
          <TabsTrigger value="access" className="text-xs gap-1"><Shield className="w-3 h-3" /> Acesso</TabsTrigger>
          <TabsTrigger value="limits" className="text-xs gap-1"><Activity className="w-3 h-3" /> Limites</TabsTrigger>
        </TabsList>

        {/* Control */}
        <TabsContent value="control" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Status da IA
                </h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-foreground">Horus IA ativa</span>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Modelo da IA</Label>
                  <Select value={settings['ia_model'] || 'google/gemini-2.5-flash'} onValueChange={v => updateSetting('ia_model', v)}>
                    <SelectTrigger className="bg-secondary mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google/gemini-2.5-pro">🧠 Gemini 2.5 Pro</SelectItem>
                      <SelectItem value="google/gemini-2.5-flash">⚡ Gemini 2.5 Flash</SelectItem>
                      <SelectItem value="google/gemini-2.5-flash-lite">💨 Gemini 2.5 Flash Lite</SelectItem>
                      <SelectItem value="google/gemini-3-flash-preview">🚀 Gemini 3 Flash Preview</SelectItem>
                      <SelectItem value="google/gemini-3.1-pro-preview">🔬 Gemini 3.1 Pro Preview</SelectItem>
                      <SelectItem value="openai/gpt-5">🤖 GPT-5</SelectItem>
                      <SelectItem value="openai/gpt-5-mini">🤖 GPT-5 Mini</SelectItem>
                      <SelectItem value="openai/gpt-5-nano">🤖 GPT-5 Nano</SelectItem>
                      <SelectItem value="openai/gpt-5.2">🤖 GPT-5.2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tom Padrão</Label>
                  <Select defaultValue="equilibrado">
                    <SelectTrigger className="bg-secondary mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acolhedor">🤝 Acolhedor</SelectItem>
                      <SelectItem value="equilibrado">⚖️ Equilibrado</SelectItem>
                      <SelectItem value="firme">💪 Firme</SelectItem>
                      <SelectItem value="verdade_dura">🔥 Verdade Dura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Configurações de Tempo
                </h3>
                <div>
                  <Label className="text-xs text-muted-foreground">Tempo mínimo entre análises (min)</Label>
                  <Input type="number" defaultValue="5" className="bg-secondary mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Confiança mínima para exibir sinal (%)</Label>
                  <Input type="number" value={settings['min_confidence'] || '60'} onChange={e => updateSetting('min_confidence', e.target.value)} className="bg-secondary mt-1.5" />
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'm5_enabled', label: 'Habilitar timeframe M5' },
                    { key: 'm15_enabled', label: 'Habilitar timeframe M15' },
                  ].map(f => (
                    <div key={f.key} className="flex items-center justify-between p-2 rounded bg-secondary/30">
                      <Label className="text-xs">{f.label}</Label>
                      <Switch checked={settings[f.key] === 'true'} onCheckedChange={v => updateSetting(f.key, v ? 'true' : 'false')} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prompts */}
        <TabsContent value="prompts" className="space-y-4 mt-4">
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Edite os prompts internos da Horus IA sem alterar o código. Alterações são salvas imediatamente no banco de dados.
            </p>
          </div>
          <div className="space-y-4">
            {prompts.map(p => (
              <Card key={p.id} className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-display font-bold text-foreground">{p.prompt_label}</Label>
                    <Button size="sm" variant="outline" onClick={() => savePrompt(p.id)} className="text-xs h-7 gap-1">
                      <Save className="w-3 h-3" /> Salvar
                    </Button>
                  </div>
                  <Textarea
                    value={p.prompt_value}
                    onChange={e => setPrompts(prev => prev.map(x => x.id === p.id ? { ...x, prompt_value: e.target.value } : x))}
                    className="bg-secondary min-h-[70px] text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono">Chave: {p.prompt_key}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Access */}
        <TabsContent value="access" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Controle de Acesso
              </h3>
              <div>
                <Label className="text-xs text-muted-foreground">Modo de Acesso à IA</Label>
                <Select value={settings['ia_access_mode'] || 'super_vip_only'} onValueChange={v => updateSetting('ia_access_mode', v)}>
                  <SelectTrigger className="bg-secondary mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_vip_only">Apenas Super VIP</SelectItem>
                    <SelectItem value="active_users">Usuários Ativos</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'trial_enabled', label: 'Permitir período de teste' },
                  { key: 'block_expired', label: 'Bloquear IA se assinatura vencer' },
                ].map(f => (
                  <div key={f.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <Label className="text-xs">{f.label}</Label>
                    <Switch checked={settings[f.key] === 'true'} onCheckedChange={v => updateSetting(f.key, v ? 'true' : 'false')} />
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground block mb-2">Legenda de Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Comum</Badge>
                  <Badge variant="outline" className="text-xs border-success/50 text-success">VIP</Badge>
                  <Badge className="gradient-gold text-primary-foreground text-xs border-0">Super VIP</Badge>
                  <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">Expirado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits */}
        <TabsContent value="limits" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Limites de Uso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'daily_behavioral_limit', label: 'Análises comportamentais/dia' },
                  { key: 'daily_print_limit', label: 'Prints/dia' },
                  { key: 'monthly_limit', label: 'Limite mensal total' },
                ].map(f => (
                  <div key={f.key}>
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input type="number" value={settings[f.key] || ''} onChange={e => updateSetting(f.key, e.target.value)} className="bg-secondary mt-1.5" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <Label className="text-xs">Acesso ilimitado</Label>
                <Switch checked={settings['unlimited_access'] === 'true'} onCheckedChange={v => updateSetting('unlimited_access', v ? 'true' : 'false')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
