import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings, Globe, Shield, FileText, Bell, Eye, Swords, Trophy,
  Save, Lock, Activity, AlertTriangle, Clock
} from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-display font-bold text-foreground">Configurações Gerais</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurações da plataforma, módulos e segurança</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-secondary w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="text-xs gap-1"><Globe className="w-3 h-3" /> Geral</TabsTrigger>
          <TabsTrigger value="modules" className="text-xs gap-1"><Settings className="w-3 h-3" /> Módulos</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1"><Shield className="w-3 h-3" /> Segurança</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs gap-1"><FileText className="w-3 h-3" /> Logs</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Informações da Plataforma
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome da Plataforma</Label>
                  <Input defaultValue="GB Trader Mind" className="bg-secondary mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">URL do Logo</Label>
                  <Input placeholder="https://..." className="bg-secondary mt-1.5" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Texto da Landing Page</Label>
                <Input defaultValue="Domine sua mente. Domine o mercado." className="bg-secondary mt-1.5" />
              </div>
              <Button className="gradient-gold text-primary-foreground font-display gap-2">
                <Save className="w-4 h-4" /> Salvar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Mensagens Automáticas
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Mensagem de boas-vindas', placeholder: 'Bem-vindo ao GB Trader Mind!' },
                  { label: 'Mensagem de upgrade VIP', placeholder: 'Parabéns! Seu acesso VIP foi liberado.' },
                  { label: 'Mensagem de upgrade Super VIP', placeholder: 'Bem-vindo à Horus IA!' },
                ].map(m => (
                  <div key={m.label}>
                    <Label className="text-xs text-muted-foreground">{m.label}</Label>
                    <Input placeholder={m.placeholder} className="bg-secondary mt-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules */}
        <TabsContent value="modules" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" /> Ativar / Desativar Módulos
              </h3>
              {[
                { label: 'Módulo Horus IA', icon: Eye, enabled: true },
                { label: 'Modo Disciplina', icon: Shield, enabled: true },
                { label: 'Diário Emocional', icon: FileText, enabled: true },
                { label: 'Desafios Prop Firm', icon: Trophy, enabled: false },
                { label: 'Respiração Guiada', icon: Activity, enabled: true },
                { label: 'Rankings', icon: Swords, enabled: true },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <m.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{m.label}</span>
                  </div>
                  <Switch defaultChecked={m.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Configurações de Segurança
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Autenticação obrigatória', enabled: true },
                  { label: 'Proteção contra spam', enabled: true },
                  { label: 'Limite de requisições da IA', enabled: true },
                  { label: 'Logs de atividades administrativas', enabled: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{s.label}</span>
                    </div>
                    <Switch defaultChecked={s.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Logs do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { action: 'Painel administrativo acessado', time: 'Agora', type: 'info' },
                  { action: 'Dados do sistema carregados', time: 'Agora', type: 'info' },
                  { action: 'Sistema inicializado com sucesso', time: 'Agora', type: 'success' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/20">
                    <div className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-success' : log.type === 'warning' ? 'bg-primary' : 'bg-blue-400'}`} />
                    <span className="text-sm text-foreground flex-1">{log.action}</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" /> {log.time}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                Logs detalhados serão registrados quando ações administrativas forem realizadas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
