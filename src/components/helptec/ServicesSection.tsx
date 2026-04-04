import {
  Globe, Rocket, ShoppingCart, Settings, Brain, BarChart3,
  Calendar, MessageSquare, BookOpen, GraduationCap, Users,
  Heart, Scissors, UtensilsCrossed, Building2, Briefcase, Crown
} from "lucide-react";

const services = [
  { icon: Globe, title: "Sites Institucionais", desc: "Presença online profissional para sua empresa" },
  { icon: Rocket, title: "Landing Pages", desc: "Páginas de alta conversão para vender mais" },
  { icon: ShoppingCart, title: "Lojas Virtuais", desc: "E-commerce completo para vender online" },
  { icon: Settings, title: "Sistemas Web", desc: "Sistemas personalizados sob medida" },
  { icon: Brain, title: "Plataformas com IA", desc: "Inteligência artificial integrada" },
  { icon: BarChart3, title: "Dashboards", desc: "Painéis financeiros e administrativos" },
  { icon: Calendar, title: "Agendamentos Online", desc: "Sistema de agendamento automatizado" },
  { icon: MessageSquare, title: "Automação WhatsApp", desc: "Chatbots e automações inteligentes" },
  { icon: BookOpen, title: "Blogs e Portais", desc: "Conteúdo otimizado para SEO" },
  { icon: GraduationCap, title: "Plataformas de Cursos", desc: "EAD completo para vender conhecimento" },
  { icon: Users, title: "CRM & Gestão", desc: "Gestão de clientes integrada" },
  { icon: Heart, title: "Sistemas para Clínicas", desc: "Gestão completa de saúde" },
  { icon: Scissors, title: "Salões e Barbearias", desc: "Agendamento e gestão de salões" },
  { icon: UtensilsCrossed, title: "Restaurantes", desc: "Cardápio digital e pedidos online" },
  { icon: Building2, title: "Imobiliárias", desc: "Sistema de gestão imobiliária" },
  { icon: Briefcase, title: "Escritórios", desc: "Sistemas corporativos completos" },
  { icon: Crown, title: "Membros VIP", desc: "Áreas exclusivas e assinaturas" },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            O Que <span className="gradient-neon-text">Criamos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Soluções digitais completas para qualquer segmento de mercado
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <div
              key={service.title}
              className="group glass rounded-xl p-5 hover:box-glow transition-all duration-500 hover:-translate-y-1 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-3 group-hover:from-neon-blue/40 group-hover:to-neon-purple/40 transition-all duration-500">
                <service.icon className="w-5 h-5 text-primary group-hover:text-neon-cyan transition-colors duration-500" />
              </div>
              <h3 className="font-display font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-xs text-muted-foreground">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
