import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const plans = [
  {
    name: "Básico",
    desc: "Ideal para começar online",
    features: [
      "Site simples e elegante",
      "Até 5 páginas",
      "Responsivo para celular",
      "WhatsApp integrado",
      "Hospedagem inclusa",
    ],
    highlight: false,
  },
  {
    name: "Profissional",
    desc: "Para negócios que querem crescer",
    features: [
      "Site completo e otimizado",
      "Painel administrativo",
      "SEO avançado",
      "Blog integrado",
      "Formulários inteligentes",
      "Animações e efeitos",
      "Suporte prioritário",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    desc: "Solução completa com IA",
    features: [
      "Sistema completo personalizado",
      "Inteligência artificial integrada",
      "Aplicativo mobile",
      "Dashboard administrativo",
      "Integrações avançadas",
      "Automações com WhatsApp",
      "Suporte VIP dedicado",
    ],
    highlight: false,
  },
];

const PlansSection = () => {
  const openWhatsApp = (plan: string) => {
    const link = document.createElement("a");
    link.href = `https://wa.me/5575999401616?text=Olá! Tenho interesse no plano ${plan}.`;
    link.target = "_blank";
    link.click();
  };

  return (
    <section id="planos" className="relative py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent pointer-events-none animate-aurora" style={{ animationDuration: "20s" }} />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-neon-blue/5 rounded-full blur-[120px] animate-orb" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <ScrollReveal variant="fade-up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Nossos <span className="gradient-neon-text text-glow">Planos</span>
            </h2>
            <p className="text-muted-foreground">Escolha o plano ideal para o seu negócio</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} variant="flip-up" delay={i * 150}>
              <div
                className={`glass rounded-2xl p-6 relative hover-3d h-full flex flex-col ${
                  plan.highlight
                    ? "box-glow border border-primary/30 scale-[1.02]"
                    : "hover:box-glow"
                }`}
              >
                {plan.highlight && (
                  <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-neon text-primary-foreground text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Mais Popular
                    </div>
                    <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl" />
                  </>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full py-5 font-semibold hover-magnetic ${
                    plan.highlight
                      ? "gradient-neon text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  onClick={() => openWhatsApp(plan.name)}
                >
                  Solicitar Orçamento <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
