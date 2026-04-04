import { MessageCircle, FileText, DollarSign, ThumbsUp, Code, Rocket, HeadphonesIcon } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const steps = [
  { icon: MessageCircle, title: "Entre em Contato", desc: "Fale conosco pelo WhatsApp ou formulário" },
  { icon: FileText, title: "Defina o Projeto", desc: "Detalhamos o tipo de solução ideal" },
  { icon: DollarSign, title: "Receba o Orçamento", desc: "Orçamento personalizado e transparente" },
  { icon: ThumbsUp, title: "Aprove a Proposta", desc: "Sem burocracia, rápido e seguro" },
  { icon: Code, title: "Desenvolvimento", desc: "Desenvolvimento ágil com atualizações" },
  { icon: Rocket, title: "Projeto Entregue", desc: "Entrega no prazo com qualidade" },
  { icon: HeadphonesIcon, title: "Suporte Contínuo", desc: "Manutenção e suporte pós-entrega" },
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-20 px-4">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px] animate-orb" style={{ animationDelay: "1s" }} />

      <div className="max-w-5xl mx-auto">
        <ScrollReveal variant="blur-in">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Como <span className="gradient-neon-text text-glow">Funciona</span>
            </h2>
            <p className="text-muted-foreground">Do primeiro contato à entrega do projeto</p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-neon-blue via-neon-purple to-neon-cyan" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/40 via-neon-cyan to-transparent animate-scan opacity-50" />
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <ScrollReveal
                key={step.title}
                variant={i % 2 === 0 ? "fade-right" : "fade-left"}
                delay={i * 100}
              >
                <div
                  className={`relative flex items-center gap-6 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                    <h3 className="font-display font-semibold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>

                  {/* Circle node */}
                  <div className="relative z-10 w-12 h-12 shrink-0 rounded-full gradient-neon flex items-center justify-center box-glow animate-pulse-neon">
                    <step.icon className="w-5 h-5 text-primary-foreground" />
                  </div>

                  <div className="flex-1 md:hidden">
                    <h3 className="font-display font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>

                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "pl-8" : "pr-8"}`} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
