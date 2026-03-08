import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Eye, Key, CreditCard, Shield, Brain, BarChart3, Users, Settings, Save,
  Lock, Unlock, FileText, Activity, Star, Zap, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';

export default function HorusAdminTabs() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [prompts, setPrompts] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [printCount, setPrintCount] = useState(0);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: s }, { data: p }, { data: subs }, { data: ac }, { data: pc }] = await Promise.all([
      supabase.from('horus_settings').select('*'),
      supabase.from('horus_prompts').select('*').order('prompt_key'),
      supabase.from('profiles').select('id, user_id, display_name, is_super_vip, super_vip_expires_at, created_at').order('created_at', { ascending: false }),
      supabase.from('horus_analyses').select('id', { count: 'exact' }),
      supabase.from('horus_print_analyses').select('id', { count: 'exact' }),
    ]);
    if (s) {
      const map: Record<string, string> = {};
      s.forEach((item: any) => { map[item.setting_key] = item.setting_value; });
      setSettings(map);
    }
    if (p) setPrompts(p);
    if (subs) setSubscribers(subs as any[]);
    setAnalysisCount(ac?.length || 0);
    setPrintCount(pc?.length || 0);
    setLoading(false);
  };

  const updateSetting = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    const { error } = await supabase.from('horus_settings').update({ setting_value: value, updated_at: new Date().toISOString() }).eq('setting_key', key);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
  };

  const saveSetting = async (key: string) => {
    const { error } = await supabase.from('horus_settings').update({ setting_value: settings[key] || '', updated_at: new Date().toISOString() }).eq('setting_key', key);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else toast({ title: 'Salvo com sucesso' });
  };

  const updatePrompt = async (id: string, newValue: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, prompt_value: newValue } : p));
  };

  const savePrompt = async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    const { error } = await supabase.from('horus_prompts').update({ prompt_value: prompt.prompt_value, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else toast({ title: 'Prompt salvo' });
  };

  const toggleSuperVip = async (userId: string, current: boolean) => {
    await supabase.from('profiles').update({ is_super_vip: !current } as any).eq('user_id', userId);
    toast({ title: !current ? 'Super VIP liberado' : 'Super VIP revogado' });
    loadAll();
  };

  const superVipUsers = subscribers.filter((s: any) => s.is_super_vip);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
          <Eye className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-primary text-glow">Configurações da Horus IA</h2>
          <p className="text-xs text-muted-foreground">Gerencie integrações, planos, acesso e prompts da IA</p>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="bg-secondary w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="integrations" className="text-xs gap-1"><Key className="w-3 h-3" /> APIs</TabsTrigger>
          <TabsTrigger value="plans" className="text-xs gap-1"><Star className="w-3 h-3" /> Planos</TabsTrigger>
          <TabsTrigger value="access" className="text-xs gap-1"><Shield className="w-3 h-3" /> Acesso</TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs gap-1"><FileText className="w-3 h-3" /> Prompts</TabsTrigger>
          <TabsTrigger value="limits" className="text-xs gap-1"><Activity className="w-3 h-3" /> Limites</TabsTrigger>
          <TabsTrigger value="subscribers" className="text-xs gap-1"><Users className="w-3 h-3" /> Assinantes</TabsTrigger>
          <TabsTrigger value="mercadopago" className="text-xs gap-1"><CreditCard className="w-3 h-3" /> Pagamentos</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs gap-1"><BarChart3 className="w-3 h-3" /> Métricas</TabsTrigger>
        </TabsList>

        {/* Tab 1 - API Integrations */}
        <TabsContent value="integrations" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Integrações de API
              </CardTitle>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-primary" />
                  As credenciais sensíveis devem ser tratadas com segurança e salvas no backend, nunca expostas no frontend.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'ia_api_key', label: 'API Key da Horus IA', type: 'secret' },
                { key: 'ia_endpoint', label: 'Endpoint da IA', type: 'text' },
                { key: 'ia_image_key', label: 'Chave da IA de Leitura de Imagem', type: 'secret' },
                { key: 'ia_behavior_endpoint', label: 'Endpoint da IA Comportamental', type: 'text' },
              ].map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs">{field.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type={field.type === 'secret' ? 'password' : 'text'}
                      value={settings[field.key] || ''}
                      onChange={e => updateSetting(field.key, e.target.value)}
                      className="bg-secondary"
                      placeholder="Configurar no backend..."
                    />
                    <Button size="sm" variant="outline" onClick={() => saveSetting(field.key)} className="shrink-0">
                      <Save className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <Label className="text-xs">Status da Integração</Label>
                <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                  <XCircle className="w-3 h-3 mr-1" /> Inativo
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2 - Plans */}
        <TabsContent value="plans" className="space-y-4 mt-4">
          <Card className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Plano Super VIP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Nome do Plano</Label><Input value="Super VIP" disabled className="bg-secondary" /></div>
                <div><Label className="text-xs">Valor</Label><Input value="R$ 29,90" disabled className="bg-secondary" /></div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Benefícios Inclusos</Label>
                <div className="space-y-1.5">
                  {[
                    'Acesso à Horus IA',
                    'Leitura de prints de gráfico',
                    'Análise comportamental inteligente',
                    'Leitura completa dos módulos do site',
                    'Respostas inteligentes baseadas nos dados do usuário',
                  ].map(b => (
                    <div key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-success" /> {b}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Label className="text-xs">Status</Label>
                <Badge className="gradient-gold text-primary-foreground text-xs border-0">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3 - Access Control */}
        <TabsContent value="access" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Controle de Acesso da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'ia_access_mode', label: 'Modo de Acesso', options: [
                  { value: 'super_vip_only', label: 'Apenas Super VIP' },
                  { value: 'active_users', label: 'Usuários Ativos' },
                  { value: 'all', label: 'Todos' },
                ]},
              ].map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs">{field.label}</Label>
                  <Select value={settings[field.key] || 'super_vip_only'} onValueChange={v => { updateSetting(field.key, v); saveSetting(field.key); }}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {field.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="space-y-3">
                {[
                  { key: 'trial_enabled', label: 'Permitir período de teste' },
                  { key: 'block_expired', label: 'Bloquear IA se assinatura vencer' },
                ].map(field => (
                  <div key={field.key} className="flex items-center justify-between">
                    <Label className="text-xs">{field.label}</Label>
                    <Switch
                      checked={settings[field.key] === 'true'}
                      onCheckedChange={v => { updateSetting(field.key, v ? 'true' : 'false'); saveSetting(field.key); }}
                    />
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <Label className="text-xs mb-2 block">Legenda de Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Usuário Comum', badge: 'outline' as const, color: '' },
                    { label: 'VIP', badge: 'outline' as const, color: 'border-success/50 text-success' },
                    { label: 'Super VIP', badge: 'default' as const, color: 'gradient-gold text-primary-foreground border-0' },
                    { label: 'Super VIP Expirado', badge: 'outline' as const, color: 'border-destructive/50 text-destructive' },
                  ].map(s => (
                    <Badge key={s.label} variant={s.badge} className={`text-xs justify-center ${s.color}`}>{s.label}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4 - Prompts */}
        <TabsContent value="prompts" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Editor de Prompts da IA
              </CardTitle>
              <p className="text-xs text-muted-foreground">Edite os prompts sem mexer no código.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {prompts.map(p => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">{p.prompt_label}</Label>
                    <Button size="sm" variant="outline" onClick={() => savePrompt(p.id)} className="text-xs h-7 gap-1">
                      <Save className="w-3 h-3" /> Salvar
                    </Button>
                  </div>
                  <Textarea
                    value={p.prompt_value}
                    onChange={e => updatePrompt(p.id, e.target.value)}
                    className="bg-secondary min-h-[60px] text-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5 - Limits */}
        <TabsContent value="limits" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Limites de Uso da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'daily_print_limit', label: 'Limite diário de prints' },
                { key: 'daily_behavioral_limit', label: 'Limite diário de análises comportamentais' },
                { key: 'monthly_limit', label: 'Limite mensal total' },
                { key: 'min_confidence', label: 'Confiança mínima para exibir sinal (%)' },
              ].map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs">{field.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={settings[field.key] || ''}
                      onChange={e => updateSetting(field.key, e.target.value)}
                      className="bg-secondary w-32"
                    />
                    <Button size="sm" variant="outline" onClick={() => saveSetting(field.key)}>
                      <Save className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="space-y-3">
                {[
                  { key: 'unlimited_access', label: 'Acesso ilimitado' },
                  { key: 'm5_enabled', label: 'Habilitar M5' },
                  { key: 'm15_enabled', label: 'Habilitar M15' },
                ].map(field => (
                  <div key={field.key} className="flex items-center justify-between">
                    <Label className="text-xs">{field.label}</Label>
                    <Switch
                      checked={settings[field.key] === 'true'}
                      onCheckedChange={v => { updateSetting(field.key, v ? 'true' : 'false'); saveSetting(field.key); }}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Modelo da IA</Label>
                <Input
                  value={settings['ia_model'] || ''}
                  onChange={e => updateSetting('ia_model', e.target.value)}
                  className="bg-secondary"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6 - Subscribers */}
        <TabsContent value="subscribers" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Assinantes Super VIP
              </CardTitle>
              <p className="text-xs text-muted-foreground">{superVipUsers.length} Super VIP ativos de {subscribers.length} usuários</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscribers.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {(s.display_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{s.display_name || 'Sem nome'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {s.is_super_vip ? (
                            <Badge className="gradient-gold text-primary-foreground text-[10px] border-0">Super VIP</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Comum</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={s.is_super_vip ? 'outline' : 'default'}
                      onClick={() => toggleSuperVip(s.user_id, s.is_super_vip)}
                      className={s.is_super_vip ? 'border-destructive/50 text-destructive hover:bg-destructive/10 text-xs' : 'gradient-gold text-primary-foreground text-xs'}
                    >
                      {s.is_super_vip ? <><Lock className="w-3 h-3 mr-1" /> Bloquear</> : <><Unlock className="w-3 h-3 mr-1" /> Liberar</>}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7 - Mercado Pago */}
        <TabsContent value="mercadopago" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Pagamentos Mercado Pago
              </CardTitle>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-primary" />
                  Credenciais devem ser armazenadas de forma segura no backend.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'mercadopago_public_key', label: 'Public Key', type: 'text' },
                { key: 'mercadopago_access_token', label: 'Access Token', type: 'password' },
                { key: 'mercadopago_client_id', label: 'Client ID', type: 'text' },
                { key: 'mercadopago_client_secret', label: 'Client Secret', type: 'password' },
                { key: 'mercadopago_webhook_url', label: 'URL de Webhook', type: 'text' },
              ].map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs">{field.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type={field.type}
                      value={settings[field.key] || ''}
                      onChange={e => updateSetting(field.key, e.target.value)}
                      className="bg-secondary"
                      placeholder="Configurar..."
                    />
                    <Button size="sm" variant="outline" onClick={() => saveSetting(field.key)} className="shrink-0">
                      <Save className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Ambiente</Label>
                  <Select value={settings['mercadopago_environment'] || 'sandbox'} onValueChange={v => { updateSetting('mercadopago_environment', v); saveSetting('mercadopago_environment'); }}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={settings['mercadopago_status'] || 'inactive'} onValueChange={v => { updateSetting('mercadopago_status', v); saveSetting('mercadopago_status'); }}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                {[
                  { key: 'mercadopago_auto_qr', label: 'Gerar QR Code Pix automaticamente' },
                  { key: 'mercadopago_auto_checkout', label: 'Ativar checkout interno' },
                  { key: 'mercadopago_auto_confirm', label: 'Confirmação automática de pagamento' },
                  { key: 'mercadopago_auto_upgrade', label: 'Upgrade automático para Super VIP' },
                ].map(field => (
                  <div key={field.key} className="flex items-center justify-between">
                    <Label className="text-xs">{field.label}</Label>
                    <Switch
                      checked={settings[field.key] === 'true'}
                      onCheckedChange={v => { updateSetting(field.key, v ? 'true' : 'false'); saveSetting(field.key); }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8 - Metrics */}
        <TabsContent value="metrics" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Análises Feitas', value: analysisCount, icon: Brain, color: 'text-primary' },
              { label: 'Prints Enviados', value: printCount, icon: Eye, color: 'text-blue-400' },
              { label: 'Super VIP Ativos', value: superVipUsers.length, icon: Star, color: 'text-primary' },
              { label: 'Taxa Conversão', value: subscribers.length > 0 ? Math.round((superVipUsers.length / subscribers.length) * 100) + '%' : '0%', icon: TrendingUp, color: 'text-success' },
            ].map(m => (
              <Card key={m.label} className="border-border/50">
                <CardContent className="p-4 text-center">
                  <m.icon className={`w-6 h-6 ${m.color} mx-auto mb-2`} />
                  <p className="text-2xl font-display font-bold text-foreground">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Métricas detalhadas serão exibidas aqui quando a Horus IA estiver ativa.</p>
              <p className="text-xs text-muted-foreground mt-1">Inclui: pagamentos aprovados, prints com maior confiança, horários de maior uso.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
