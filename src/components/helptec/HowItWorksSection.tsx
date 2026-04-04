import { MessageCircle, FileText, DollarSign, ThumbsUp, Code, Rocket, HeadphonesIcon } from "lucide-react";

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
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Como <span className="gradient-neon-text">Funciona</span>
          </h2>
          <p className="text-muted-foreground">Do primeiro contato à entrega do projeto</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-blue via-neon-purple to-neon-cyan" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`relative flex items-center gap-6 animate-fade-in-up ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                  <h3 className="font-display font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>

                {/* Circle node */}
                <div className="relative z-10 w-12 h-12 shrink-0 rounded-full gradient-neon flex items-center justify-center box-glow">
                  <step.icon className="w-5 h-5 text-primary-foreground" />
                </div>

                <div className="flex-1 md:hidden">
                  <h3 className="font-display font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>

                <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "pl-8" : "pr-8"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
