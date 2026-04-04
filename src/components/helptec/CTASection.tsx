import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-neon-purple/10 to-neon-cyan/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[150px]" />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
          Seu projeto merece algo{" "}
          <span className="gradient-neon-text">profissional, moderno</span> e pronto para vender.
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
          Solicite agora um orçamento personalizado e tenha um site, sistema ou aplicativo
          criado sob medida para o seu negócio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="gradient-neon text-primary-foreground font-bold px-10 py-7 text-lg rounded-xl box-glow hover:scale-105 transition-all duration-300"
            onClick={openWhatsApp}
          >
            <MessageCircle className="mr-2 w-5 h-5" /> Falar no WhatsApp
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary/30 px-10 py-7 text-lg rounded-xl hover:bg-primary/10 transition-all duration-300"
            onClick={openWhatsApp}
          >
            Solicitar Orçamento <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
