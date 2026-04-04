import { useEffect, useState, useRef } from "react";
import { ArrowRight, MessageCircle, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const openWhatsApp = () => {
    const link = document.createElement("a");
    link.href = "https://wa.me/5575999401616?text=Olá! Gostaria de solicitar um orçamento.";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
      {/* Animated orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/10 rounded-full blur-[100px] animate-orb" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-orb" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/5 animate-morph blur-[150px]" />
      
      {/* Aurora effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-neon-purple/3 to-neon-cyan/5 animate-aurora pointer-events-none" />

      {/* Ripple effect center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-neon-blue/10 animate-ripple" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-neon-purple/10 animate-ripple" style={{ animationDelay: "0.7s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-neon-cyan/10 animate-ripple" style={{ animationDelay: "1.4s" }} />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Logo */}
        <div className={`mb-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
            <span className="text-xs text-neon-cyan font-medium">Tecnologia que transforma negócios</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold gradient-neon-text tracking-wider text-glow">
            HELP GB TEC
          </h2>
          <div className="w-20 h-0.5 gradient-neon mx-auto mt-2 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 animate-glow-line bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 transition-all duration-1000 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          Criamos{" "}
          <span className="gradient-neon-text text-glow">Sites com ou sem Inteligência Artificial</span>
          , Sistemas para qualquer negócio.
        </h1>

        {/* Subtitle */}
        <p className={`text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          Transforme sua empresa com soluções modernas, profissionais e altamente tecnológicas.
          Desenvolvemos desde sites simples até plataformas completas com inteligência artificial,
          automações, aplicativos e sistemas personalizados.
        </p>

        {/* Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-1000 delay-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}`}>
          <Button
            size="lg"
            className="gradient-neon text-primary-foreground font-semibold px-8 py-6 text-base rounded-xl box-glow hover:scale-105 transition-all duration-300 hover-magnetic"
            onClick={openWhatsApp}
          >
            Solicitar Orçamento <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-neon-blue/30 text-foreground px-8 py-6 text-base rounded-xl hover:bg-neon-blue/10 transition-all duration-300 hover-magnetic"
            onClick={() => document.getElementById("projetos")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Eye className="mr-2 w-5 h-5" /> Ver Projetos
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[hsl(142,71%,45%)]/30 text-[hsl(142,71%,45%)] px-8 py-6 text-base rounded-xl hover:bg-[hsl(142,71%,45%)]/10 transition-all duration-300 hover-magnetic"
            onClick={openWhatsApp}
          >
            <MessageCircle className="mr-2 w-5 h-5" /> Falar no WhatsApp
          </Button>
        </div>

        {/* Mockup area */}
        <div className={`relative mb-16 transition-all duration-1200 delay-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 [transform:perspective(800px)_rotateX(0deg)_translateY(0)]" : "opacity-0 [transform:perspective(800px)_rotateX(15deg)_translateY(40px)]"}`}>
          <div className="glass rounded-2xl p-1 max-w-4xl mx-auto box-glow relative overflow-hidden">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl z-10" />
            <div className="bg-card rounded-xl p-8 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Notebook mockup */}
                <div className="glass rounded-xl p-4 text-center hover-3d animate-surreal-float">
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="w-20 h-14 rounded border border-neon-blue/30 bg-card flex items-center justify-center">
                      <div className="w-12 h-1 bg-neon-blue/50 rounded mb-1" />
                    </div>
                    <div className="absolute inset-0 animate-shimmer" />
                  </div>
                  <p className="text-xs text-muted-foreground">Sites Modernos</p>
                </div>
                {/* Phone mockup */}
                <div className="glass rounded-xl p-4 text-center hover-3d animate-surreal-float" style={{ animationDelay: "1s" }}>
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="w-12 h-20 rounded-lg border border-neon-purple/30 bg-card flex items-center justify-center">
                      <div className="w-6 h-1 bg-neon-purple/50 rounded" />
                    </div>
                    <div className="absolute inset-0 animate-shimmer" style={{ animationDelay: "1s" }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Aplicativos</p>
                </div>
                {/* Dashboard mockup */}
                <div className="glass rounded-xl p-4 text-center hover-3d animate-surreal-float" style={{ animationDelay: "2s" }}>
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="flex gap-1">
                      <div className="w-3 h-8 bg-neon-cyan/30 rounded animate-pulse" style={{ animationDelay: "0s" }} />
                      <div className="w-3 h-12 bg-neon-blue/30 rounded animate-pulse" style={{ animationDelay: "0.3s" }} />
                      <div className="w-3 h-6 bg-neon-purple/30 rounded animate-pulse" style={{ animationDelay: "0.6s" }} />
                      <div className="w-3 h-10 bg-neon-cyan/30 rounded animate-pulse" style={{ animationDelay: "0.9s" }} />
                    </div>
                    <div className="absolute inset-0 animate-shimmer" style={{ animationDelay: "2s" }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Dashboards & IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Counters */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto transition-all duration-1000 delay-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {[
            { target: 100, suffix: "", label: "Projetos Criados" },
            { target: 50, suffix: "", label: "Clientes Atendidos" },
            { target: 10, suffix: "", label: "Segmentos" },
            { target: 24, suffix: "h", label: "Atendimento Rápido" },
          ].map((item, i) => (
            <div key={item.label} className="glass rounded-xl p-4 hover-magnetic">
              <CountUp target={item.target} suffix={item.suffix} />
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
