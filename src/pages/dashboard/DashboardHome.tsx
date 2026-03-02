import { BarChart3 } from 'lucide-react';

const DashboardHome = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
      <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center box-glow-strong animate-pulse-gold">
        <BarChart3 className="w-8 h-8 text-primary-foreground" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary text-glow">
        Estamos configurando nossa página
      </h1>
      <p className="text-muted-foreground max-w-md">
        Em breve você terá acesso a todas as ferramentas. Aguarde as novidades!
      </p>
    </div>
  );
};

export default DashboardHome;
