import {
  Globe, Rocket, ShoppingCart, Settings, Brain, BarChart3,
  Calendar, MessageSquare, BookOpen, GraduationCap, Users,
  Heart, Scissors, UtensilsCrossed, Building2, Briefcase, Crown
} from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

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
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px] animate-orb" />
      
      <div className="max-w-7xl mx-auto">
        <ScrollReveal variant="fade-up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              O Que <span className="gradient-neon-text text-glow">Criamos</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Soluções digitais completas para qualquer segmento de mercado
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <ScrollReveal
              key={service.title}
              variant={i % 3 === 0 ? "fade-up" : i % 3 === 1 ? "zoom-in" : "fade-left"}
              delay={i * 60}
            >
              <div className="group glass rounded-xl p-5 hover-magnetic cursor-pointer h-full relative overflow-hidden">
                {/* Hover glow background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/0 to-neon-purple/0 group-hover:from-neon-blue/5 group-hover:to-neon-purple/5 transition-all duration-700" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-3 group-hover:from-neon-blue/40 group-hover:to-neon-purple/40 transition-all duration-500 group-hover:animate-pulse">
                    <service.icon className="w-5 h-5 text-primary group-hover:text-neon-cyan transition-colors duration-500" />
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{service.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
