import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Key, Save, AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';

export default function AdminIntegrations() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from('horus_settings').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: any) => { map[item.setting_key] = item.setting_value; });
        setSettings(map);
      }
    });
  }, []);

  const updateAndSave = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSetting = async (key: string) => {
    const { error } = await supabase.from('horus_settings').update({ setting_value: settings[key] || '', updated_at: new Date().toISOString() }).eq('setting_key', key);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else toast({ title: 'Salvo com sucesso' });
  };

  const apiSections = [
    {
      title: 'Horus IA',
      icon: '🧠',
      status: 'inactive',
      fields: [
        { key: 'ia_api_key', label: 'API Key da Horus IA', type: 'password' },
        { key: 'ia_endpoint', label: 'Endpoint da IA', type: 'text' },
        { key: 'ia_image_key', label: 'Chave da IA de Leitura de Imagem', type: 'password' },
        { key: 'ia_behavior_endpoint', label: 'Endpoint IA Comportamental', type: 'text' },
      ],
    },
    {
      title: 'Mercado Pago',
      icon: '💳',
      status: settings['mercadopago_status'] || 'inactive',
      fields: [
        { key: 'mercadopago_public_key', label: 'Public Key', type: 'text' },
        { key: 'mercadopago_access_token', label: 'Access Token', type: 'password' },
        { key: 'mercadopago_client_id', label: 'Client ID', type: 'text' },
        { key: 'mercadopago_client_secret', label: 'Client Secret', type: 'password' },
        { key: 'mercadopago_webhook_url', label: 'Webhook URL', type: 'text' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Integrações de API</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure as APIs externas da plataforma</p>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Segurança</p>
          <p className="text-xs text-muted-foreground mt-1">
            As credenciais sensíveis devem ser tratadas com segurança e salvas no backend, nunca expostas no frontend.
            Valores sensíveis são mascarados e armazenados de forma segura.
          </p>
        </div>
      </div>

      {apiSections.map((section) => (
        <Card key={section.title} className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[20px] font-display flex items-center gap-2">
                <span>{section.icon}</span> {section.title}
              </CardTitle>
              <Badge
                variant="outline"
                className={section.status === 'active'
                  ? 'border-success/50 text-success'
                  : section.status === 'testing'
                    ? 'border-primary/50 text-primary'
                    : 'border-destructive/50 text-destructive'
                }
              >
                {section.status === 'active' ? <><Wifi className="w-3 h-3 mr-1" /> Ativa</> :
                 section.status === 'testing' ? <><Wifi className="w-3 h-3 mr-1" /> Em Teste</> :
                 <><WifiOff className="w-3 h-3 mr-1" /> Inativa</>}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {section.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                <div className="flex gap-2">
                  <Input
                    type={field.type}
                    value={settings[field.key] || ''}
                    onChange={e => updateAndSave(field.key, e.target.value)}
                    className="bg-secondary"
                    placeholder="Configurar..."
                  />
                  <Button size="sm" variant="outline" onClick={() => saveSetting(field.key)} className="shrink-0 h-10">
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
