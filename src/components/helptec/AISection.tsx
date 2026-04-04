import { Bot, MessageSquare, TrendingUp, Phone, HeadphonesIcon, BarChart3, Users, Globe } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const aiItems = [
  { icon: Bot, title: "Chatbots Inteligentes", desc: "Atendimento automático 24/7" },
  { icon: MessageSquare, title: "Atendimento Automático", desc: "Respostas instantâneas para clientes" },
  { icon: TrendingUp, title: "IA para Vendas", desc: "Aumente conversões com IA" },
  { icon: Phone, title: "IA para WhatsApp", desc: "Automação inteligente no WhatsApp" },
  { icon: HeadphonesIcon, title: "IA para Suporte", desc: "Suporte técnico automatizado" },
  { icon: BarChart3, title: "Análise de Dados", desc: "Insights inteligentes em tempo real" },
  { icon: Users, title: "Gestão de Clientes", desc: "CRM inteligente com IA" },
  { icon: Globe, title: "IA Integrada", desc: "IA em sites e sistemas sob medida" },
];

const AISection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 via-neon-cyan/5 to-transparent pointer-events-none animate-aurora" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-purple/8 animate-morph blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-neon-cyan/8 animate-morph blur-[100px]" style={{ animationDelay: "4s" }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal variant="scale-rotate">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-surreal-float">
              <Bot className="w-4 h-4 text-neon-cyan animate-pulse" />
              <span className="text-xs text-neon-cyan font-medium">Inteligência Artificial</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Soluções com <span className="gradient-neon-text text-glow">Inteligência Artificial</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Implantamos IA no seu negócio para automatizar, vender mais e atender melhor
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiItems.map((item, i) => (
            <ScrollReveal key={item.title} variant="flip-up" delay={i * 100}>
              <div className="group glass rounded-xl p-6 text-center hover-3d h-full relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mx-auto mb-4 group-hover:from-neon-purple/40 group-hover:to-neon-cyan/40 transition-all group-hover:animate-pulse">
                    <item.icon className="w-6 h-6 text-neon-cyan group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA within AI section */}
        <ScrollReveal variant="zoom-in" delay={400}>
          <div className="mt-12 text-center">
            <div className="glass-strong rounded-2xl p-8 max-w-2xl mx-auto box-glow-purple relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              <div className="relative z-10">
                <h3 className="font-display font-bold text-xl mb-3">
                  Quer IA no seu negócio?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Fale com nossa equipe e descubra como a inteligência artificial pode transformar sua empresa.
                </p>
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "https://wa.me/5575999401616?text=Olá! Tenho interesse em soluções com IA.";
                    link.target = "_blank";
                    link.click();
                  }}
                  className="gradient-neon text-primary-foreground font-semibold px-8 py-3 rounded-xl text-sm hover:scale-105 transition-transform hover-magnetic"
                >
                  Falar com Especialista
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AISection;
