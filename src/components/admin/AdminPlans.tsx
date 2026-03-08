import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Star, CheckCircle, Crown, Zap, Edit, Save } from 'lucide-react';

export default function AdminPlans() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Planos & Assinaturas</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os planos da plataforma</p>
      </div>

      {/* Current Plan */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[20px] font-display flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" /> SUPER VIP
            </CardTitle>
            <Badge className="gradient-gold text-primary-foreground border-0 font-display">Ativo</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nome do Plano</Label>
              <Input value="Super VIP" className="bg-secondary mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valor</Label>
              <Input value="R$ 29,90" className="bg-secondary mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div className="flex items-center gap-3 mt-2.5">
                <Switch defaultChecked />
                <span className="text-sm text-foreground">Ativo</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs text-muted-foreground block mb-3">Benefícios Inclusos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Acesso à Horus IA',
                'Análise comportamental inteligente',
                'Leitura de prints do gráfico',
                'Insights inteligentes baseados nos dados',
                'Histórico completo de análises',
              ].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-foreground bg-success/5 border border-success/10 rounded-lg p-2.5">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Limite de Análises/dia</Label>
              <Input type="number" defaultValue="5" className="bg-secondary mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Limite de Prints/dia</Label>
              <Input type="number" defaultValue="10" className="bg-secondary mt-1.5" />
            </div>
          </div>

          <Button className="gradient-gold text-primary-foreground font-display gap-2">
            <Save className="w-4 h-4" /> Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display">Comparativo de Planos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-[11px] font-display text-muted-foreground uppercase">Recurso</th>
                  <th className="text-center py-3 px-4 text-[11px] font-display text-muted-foreground uppercase">Gratuito</th>
                  <th className="text-center py-3 px-4 text-[11px] font-display text-muted-foreground uppercase">VIP</th>
                  <th className="text-center py-3 px-4 text-[11px] font-display text-primary uppercase">Super VIP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Dashboard', free: true, vip: true, svip: true },
                  { feature: 'Gestão de Banca', free: false, vip: true, svip: true },
                  { feature: 'Relatórios', free: false, vip: true, svip: true },
                  { feature: 'Diário Emocional', free: false, vip: true, svip: true },
                  { feature: 'Horus IA', free: false, vip: false, svip: true },
                  { feature: 'Leitura de Prints', free: false, vip: false, svip: true },
                  { feature: 'Análise Comportamental', free: false, vip: false, svip: true },
                ].map(row => (
                  <tr key={row.feature} className="border-b border-border/30">
                    <td className="py-2.5 px-4 text-foreground">{row.feature}</td>
                    <td className="py-2.5 px-4 text-center">{row.free ? <CheckCircle className="w-4 h-4 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2.5 px-4 text-center">{row.vip ? <CheckCircle className="w-4 h-4 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2.5 px-4 text-center">{row.svip ? <CheckCircle className="w-4 h-4 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
