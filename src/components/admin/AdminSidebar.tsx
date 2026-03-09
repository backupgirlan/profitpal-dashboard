import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, Eye, Key, Wallet, BarChart3,
  Activity, Settings, FileText, Shield, Zap
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'plans', label: 'Planos & Assinaturas', icon: CreditCard },
  { id: 'horus', label: 'Horus IA', icon: Eye },
  { id: 'horus-flows', label: 'Fluxos Inteligentes', icon: Zap, highlight: true },
  { id: 'integrations', label: 'Integrações API', icon: Key },
  { id: 'payments', label: 'Pagamentos', icon: Wallet },
  { id: 'analytics', label: 'Análises', icon: BarChart3 },
  { id: 'usage', label: 'Controle de Uso', icon: Activity },
  { id: 'content', label: 'Conteúdo', icon: FileText },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className="w-[220px] shrink-0 border-r border-border bg-card/50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xs font-display font-bold text-foreground tracking-wide">ADMIN</h2>
            <p className="text-[10px] text-muted-foreground">GB Trader Mind</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative group ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">Painel Administrativo v2.0</p>
      </div>
    </aside>
  );
}
