import { useEffect, useState, useRef } from "react";
import { ArrowRight, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const CountUp = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let current = 0;
          const step = target / 60;
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, 20);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-bold gradient-neon-text font-display">
        +{count}{suffix}
      </div>
    </div>
  );
};

const HeroSection = () => {
  const openWhatsApp = () => {
    const link = document.createElement("a");
    link.href = "https://wa.me/5575999401616?text=Olá! Gostaria de solicitar um orçamento.";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl md:text-3xl font-display font-bold gradient-neon-text tracking-wider">
            HELP TEC
          </h2>
          <div className="w-20 h-0.5 gradient-neon mx-auto mt-2 rounded-full" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Criamos{" "}
          <span className="gradient-neon-text">Sites com ou sem Inteligência Artificial</span>
          , Sistemas para qualquer negócio.
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
          Transforme sua empresa com soluções modernas, profissionais e altamente tecnológicas.
          Desenvolvemos desde sites simples até plataformas completas com inteligência artificial,
          automações, aplicativos e sistemas personalizados.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button
            size="lg"
            className="gradient-neon text-primary-foreground font-semibold px-8 py-6 text-base rounded-xl box-glow hover:scale-105 transition-all duration-300"
            onClick={openWhatsApp}
          >
            Solicitar Orçamento <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-neon-blue/30 text-foreground px-8 py-6 text-base rounded-xl hover:bg-neon-blue/10 transition-all duration-300"
            onClick={() => document.getElementById("projetos")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Eye className="mr-2 w-5 h-5" /> Ver Projetos
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[hsl(142,71%,45%)]/30 text-[hsl(142,71%,45%)] px-8 py-6 text-base rounded-xl hover:bg-[hsl(142,71%,45%)]/10 transition-all duration-300"
            onClick={openWhatsApp}
          >
            <MessageCircle className="mr-2 w-5 h-5" /> Falar no WhatsApp
          </Button>
        </div>

        {/* Mockup area */}
        <div className="relative mb-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="glass rounded-2xl p-1 max-w-4xl mx-auto box-glow">
            <div className="bg-card rounded-xl p-8 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Notebook mockup */}
                <div className="glass rounded-xl p-4 text-center">
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-3">
                    <div className="w-20 h-14 rounded border border-neon-blue/30 bg-card flex items-center justify-center">
                      <div className="w-12 h-1 bg-neon-blue/50 rounded mb-1" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Sites Modernos</p>
                </div>
                {/* Phone mockup */}
                <div className="glass rounded-xl p-4 text-center">
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mb-3">
                    <div className="w-12 h-20 rounded-lg border border-neon-purple/30 bg-card flex items-center justify-center">
                      <div className="w-6 h-1 bg-neon-purple/50 rounded" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Aplicativos</p>
                </div>
                {/* Dashboard mockup */}
                <div className="glass rounded-xl p-4 text-center">
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center mb-3">
                    <div className="flex gap-1">
                      <div className="w-3 h-8 bg-neon-cyan/30 rounded" />
                      <div className="w-3 h-12 bg-neon-blue/30 rounded" />
                      <div className="w-3 h-6 bg-neon-purple/30 rounded" />
                      <div className="w-3 h-10 bg-neon-cyan/30 rounded" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Dashboards & IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="glass rounded-xl p-4">
            <CountUp target={100} />
            <p className="text-xs text-muted-foreground mt-1">Projetos Criados</p>
          </div>
          <div className="glass rounded-xl p-4">
            <CountUp target={50} />
            <p className="text-xs text-muted-foreground mt-1">Clientes Atendidos</p>
          </div>
          <div className="glass rounded-xl p-4">
            <CountUp target={10} />
            <p className="text-xs text-muted-foreground mt-1">Segmentos</p>
          </div>
          <div className="glass rounded-xl p-4">
            <CountUp target={24} suffix="h" />
            <p className="text-xs text-muted-foreground mt-1">Atendimento Rápido</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
