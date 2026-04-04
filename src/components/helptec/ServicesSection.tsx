import { useState } from "react";
import {
  Globe, Rocket, ShoppingCart, Settings, Brain, BarChart3,
  Calendar, MessageSquare, BookOpen, GraduationCap, Users,
  Heart, Scissors, UtensilsCrossed, Building2, Briefcase, Crown,
  Smartphone, ChevronDown, ChevronUp
} from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const services = [
  { icon: Globe, title: "Sites Institucionais", desc: "Presença online profissional para sua empresa", color: "from-neon-blue/20 to-neon-blue/5" },
  { icon: Rocket, title: "Landing Pages", desc: "Páginas de alta conversão para vender mais", color: "from-neon-purple/20 to-neon-purple/5" },
  { icon: ShoppingCart, title: "Lojas Virtuais", desc: "E-commerce completo para vender online", color: "from-neon-cyan/20 to-neon-cyan/5" },
  { icon: Settings, title: "Sistemas Web", desc: "Sistemas personalizados sob medida", color: "from-neon-blue/20 to-neon-purple/5" },
  { icon: Smartphone, title: "Aplicativos Mobile", desc: "Apps Android e iOS profissionais", color: "from-neon-purple/20 to-neon-cyan/5" },
  { icon: Brain, title: "Plataformas com IA", desc: "Inteligência artificial integrada", color: "from-neon-cyan/20 to-neon-blue/5" },
  { icon: BarChart3, title: "Dashboards", desc: "Painéis financeiros e administrativos", color: "from-neon-blue/20 to-neon-cyan/5" },
  { icon: Calendar, title: "Agendamentos Online", desc: "Sistema de agendamento automatizado", color: "from-neon-purple/20 to-neon-blue/5" },
  { icon: MessageSquare, title: "Automação WhatsApp", desc: "Chatbots e automações inteligentes", color: "from-neon-cyan/20 to-neon-purple/5" },
  { icon: BookOpen, title: "Blogs e Portais", desc: "Conteúdo otimizado para SEO", color: "from-neon-blue/20 to-neon-purple/5" },
  { icon: GraduationCap, title: "Plataformas de Cursos", desc: "EAD completo para vender conhecimento", color: "from-neon-purple/20 to-neon-cyan/5" },
  { icon: Users, title: "CRM & Gestão", desc: "Gestão de clientes integrada", color: "from-neon-cyan/20 to-neon-blue/5" },
  { icon: Heart, title: "Sistemas para Clínicas", desc: "Gestão completa de saúde", color: "from-neon-blue/20 to-neon-cyan/5" },
  { icon: Scissors, title: "Salões e Barbearias", desc: "Agendamento e gestão de salões", color: "from-neon-purple/20 to-neon-blue/5" },
  { icon: UtensilsCrossed, title: "Restaurantes", desc: "Cardápio digital e pedidos online", color: "from-neon-cyan/20 to-neon-purple/5" },
  { icon: Building2, title: "Imobiliárias", desc: "Sistema de gestão imobiliária", color: "from-neon-blue/20 to-neon-purple/5" },
  { icon: Briefcase, title: "Escritórios", desc: "Sistemas corporativos completos", color: "from-neon-purple/20 to-neon-cyan/5" },
  { icon: Crown, title: "Membros VIP", desc: "Áreas exclusivas e assinaturas", color: "from-neon-cyan/20 to-neon-blue/5" },
];

const INITIAL_VISIBLE = 6;

const ServicesSection = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleServices = showAll ? services : services.slice(0, INITIAL_VISIBLE);

  return (
    <section id="servicos" className="relative py-16 sm:py-24 px-3 sm:px-4">
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-neon-blue/5 rounded-full blur-[120px] sm:blur-[150px] animate-orb" />
      <div className="absolute bottom-0 left-0 w-56 sm:w-80 h-56 sm:h-80 bg-neon-purple/5 rounded-full blur-[100px] sm:blur-[120px] animate-orb" style={{ animationDelay: "2s" }} />
      
      <div className="max-w-7xl mx-auto">
        <ScrollReveal variant="fade-up">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <span className="text-xs text-neon-cyan font-medium">🎯 Soluções Completas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
              O Que <span className="gradient-neon-text text-glow">Criamos</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Soluções digitais completas para qualquer segmento de mercado. 
              Do conceito à entrega, tudo pensado para o seu negócio crescer.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {visibleServices.map((service, i) => (
            <ScrollReveal
              key={service.title}
              variant={i % 4 === 0 ? "fade-up" : i % 4 === 1 ? "zoom-in" : i % 4 === 2 ? "fade-left" : "flip-up"}
              delay={i * 50}
            >
              <div className="group glass rounded-xl p-3 sm:p-4 hover-magnetic cursor-pointer h-full relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-all duration-700`} />
                <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-all duration-500 group-hover:animate-pulse`}>
                    <service.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-neon-cyan transition-colors duration-500" />
                  </div>
                  <h3 className="font-display font-semibold text-[11px] sm:text-xs mb-1 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-relaxed">{service.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {services.length > INITIAL_VISIBLE && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative px-6 sm:px-8 py-2.5 sm:py-3 rounded-full glass text-xs sm:text-sm font-semibold text-foreground overflow-hidden transition-all duration-500 hover:scale-105 hover:box-glow flex items-center gap-2"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">
                {showAll ? "Ver menos" : `Ver mais (${services.length - INITIAL_VISIBLE}+)`}
              </span>
              {showAll ? (
                <ChevronUp className="w-4 h-4 relative z-10" />
              ) : (
                <ChevronDown className="w-4 h-4 relative z-10 animate-bounce" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;