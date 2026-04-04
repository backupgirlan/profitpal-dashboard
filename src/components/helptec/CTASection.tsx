import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const CTASection = () => {
  const openWhatsApp = () => {
    const link = document.createElement("a");
    link.href = "https://wa.me/5575999401616?text=Olá! Gostaria de solicitar um orçamento.";
    link.target = "_blank";
    link.click();
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-neon-purple/10 to-neon-cyan/10 animate-aurora" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 animate-morph blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 animate-morph blur-[150px]" style={{ animationDelay: "4s" }} />

      {/* Ripples */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-neon-blue/10 animate-ripple" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-neon-purple/10 animate-ripple" style={{ animationDelay: "1s" }} />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <ScrollReveal variant="scale-rotate">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">Comece agora mesmo</span>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="blur-in" delay={100}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
            Seu projeto merece algo{" "}
            <span className="gradient-neon-text text-glow">profissional, moderno</span> e pronto para vender.
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200}>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Solicite agora um orçamento personalizado e tenha um site, sistema ou aplicativo
            criado sob medida para o seu negócio.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="zoom-in" delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="gradient-neon text-primary-foreground font-bold px-10 py-7 text-lg rounded-xl box-glow hover:scale-105 transition-all duration-300 hover-magnetic"
              onClick={openWhatsApp}
            >
              <MessageCircle className="mr-2 w-5 h-5" /> Falar no WhatsApp
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 px-10 py-7 text-lg rounded-xl hover:bg-primary/10 transition-all duration-300 hover-magnetic"
              onClick={openWhatsApp}
            >
              Solicitar Orçamento <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
