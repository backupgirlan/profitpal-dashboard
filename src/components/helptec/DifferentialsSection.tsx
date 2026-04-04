import {
  Palette, Zap, Smartphone, MessageCircle, Brain, Settings,
  Search, Gauge, Shield, Cloud, RefreshCw, Sliders
} from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const items = [
  { icon: Palette, title: "Design moderno e profissional" },
  { icon: Zap, title: "Desenvolvimento rápido" },
  { icon: Smartphone, title: "Responsivo para celular e tablet" },
  { icon: MessageCircle, title: "Integração com WhatsApp" },
  { icon: Brain, title: "Integração com inteligência artificial" },
  { icon: Settings, title: "Painel administrativo completo" },
  { icon: Search, title: "SEO otimizado" },
  { icon: Gauge, title: "Velocidade e performance" },
  { icon: Shield, title: "Segurança avançada" },
  { icon: Cloud, title: "Hospedagem e suporte" },
  { icon: RefreshCw, title: "Atualizações constantes" },
  { icon: Sliders, title: "Personalização total" },
];

const DifferentialsSection = () => {
  return (
    <section className="relative py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-neon-purple/5 rounded-full blur-[120px] animate-orb" style={{ animationDelay: "3s" }} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal variant="blur-in">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Por que escolher a <span className="gradient-neon-text text-glow">Help Tec</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Diferenciais que fazem a diferença no resultado do seu projeto
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Timeline line with glow */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px hidden md:block overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-neon-blue/40 via-neon-purple/40 to-neon-cyan/40" />
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-neon-cyan via-neon-blue to-transparent animate-scan opacity-60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <ScrollReveal
                key={item.title}
                variant={i % 2 === 0 ? "fade-right" : "fade-left"}
                delay={i * 80}
              >
                <div
                  className={`flex items-center gap-4 glass rounded-xl p-5 hover-magnetic relative overflow-hidden ${
                    i % 2 === 0 ? "md:pr-12" : "md:pl-12"
                  }`}
                >
                  <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                  <div className="w-10 h-10 shrink-0 rounded-lg gradient-neon flex items-center justify-center relative">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-sm relative z-10">{item.title}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DifferentialsSection;
