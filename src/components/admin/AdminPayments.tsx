import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Wallet, DollarSign, CheckCircle, XCircle, Clock, QrCode, CreditCard,
  TrendingUp, AlertCircle
} from 'lucide-react';

export default function AdminPayments() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: s }, { data: subs }] = await Promise.all([
      supabase.from('horus_settings').select('*'),
      supabase.from('super_vip_subscriptions').select('*').order('created_at', { ascending: false }),
    ]);
    if (s) {
      const map: Record<string, string> = {};
      s.forEach((item: any) => { map[item.setting_key] = item.setting_value; });
      setSettings(map);
    }
    if (subs) setSubscriptions(subs);
  };

  const updateSetting = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await supabase.from('horus_settings').update({ setting_value: value, updated_at: new Date().toISOString() }).eq('setting_key', key);
  };

  const approved = subscriptions.filter(s => s.status === 'active');
  const pending = subscriptions.filter(s => s.status === 'pending');
  const rejected = subscriptions.filter(s => s.status === 'rejected' || s.status === 'cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Pagamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de pagamentos e checkout Pix</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Aprovados', value: approved.length, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pendentes', value: pending.length, icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Recusados', value: rejected.length, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map(s => (
          <Card key={s.label} className="border-border/50 bg-card/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mercado Pago Config */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-[20px] font-display flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Mercado Pago — Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Ambiente</Label>
              <Select value={settings['mercadopago_environment'] || 'sandbox'} onValueChange={v => updateSetting('mercadopago_environment', v)}>
                <SelectTrigger className="bg-secondary mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">🧪 Sandbox</SelectItem>
                  <SelectItem value="production">🚀 Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={settings['mercadopago_status'] || 'inactive'} onValueChange={v => updateSetting('mercadopago_status', v)}>
                <SelectTrigger className="bg-secondary mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">✅ Ativo</SelectItem>
                  <SelectItem value="inactive">❌ Inativo</SelectItem>
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
              { key: 'mercadopago_auto_upgrade', label: 'Upgrade automático para Super VIP após pagamento' },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <Label className="text-xs">{f.label}</Label>
                <Switch checked={settings[f.key] === 'true'} onCheckedChange={v => updateSetting(f.key, v ? 'true' : 'false')} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checkout Preview */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" /> Checkout Pix — Prévia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-40 h-40 bg-secondary/50 border-2 border-dashed border-border rounded-xl mx-auto flex items-center justify-center">
              <QrCode className="w-16 h-16 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground mt-3">QR Code será gerado aqui quando o Mercado Pago for integrado</p>
            <div className="mt-4">
              <p className="text-2xl font-display font-bold text-primary">R$ 29,90</p>
              <p className="text-xs text-muted-foreground">Plano Super VIP — Mensal</p>
            </div>
            <Button className="gradient-gold text-primary-foreground font-display mt-4 gap-2" disabled>
              <Wallet className="w-4 h-4" /> Gerar Cobrança Manual
              <Badge variant="outline" className="text-[10px] border-primary-foreground/30 text-primary-foreground">Em breve</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-success" /> Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum pagamento registrado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-[11px] font-display text-muted-foreground uppercase">Plano</th>
                    <th className="text-left py-2 px-3 text-[11px] font-display text-muted-foreground uppercase">Valor</th>
                    <th className="text-left py-2 px-3 text-[11px] font-display text-muted-foreground uppercase">Status</th>
                    <th className="text-left py-2 px-3 text-[11px] font-display text-muted-foreground uppercase">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(s => (
                    <tr key={s.id} className="border-b border-border/30">
                      <td className="py-2 px-3 text-foreground">{s.plan_name}</td>
                      <td className="py-2 px-3 text-foreground">R$ {Number(s.price).toFixed(2)}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={`text-[10px] ${s.status === 'active' ? 'border-success/50 text-success' : s.status === 'pending' ? 'border-primary/50 text-primary' : 'border-destructive/50 text-destructive'}`}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
