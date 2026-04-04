import { useEffect, useState, useRef } from "react";
import { ArrowRight, MessageCircle, Eye, Sparkles, Monitor, Smartphone, BarChart3, Brain, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const CountUp = ({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let current = 0;
          const step = target / 80;
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center glass rounded-xl p-5 hover-magnetic group relative overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 pointer-events-none" />
      <div className="text-3xl md:text-4xl font-bold gradient-neon-text font-display relative z-10">
        +{count}{suffix}
      </div>
      <p className="text-xs text-muted-foreground mt-1 relative z-10">{label}</p>
    </div>
  );
};

const TypeWriter = ({ words }: { words: string[] }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIndex < word.length) {
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setCharIndex(charIndex - 1);
        } else {
          setDeleting(false);
          setWordIndex((wordIndex + 1) % words.length);
        }
      }
    }, deleting ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words]);

  return (
    <span className="gradient-neon-text text-glow">
      {words[wordIndex].substring(0, charIndex)}
      <span className="animate-blink text-primary">|</span>
    </span>
  );
};

const FloatingIcon = ({ icon: Icon, className, delay = "0s" }: { icon: any; className: string; delay?: string }) => (
  <div className={`absolute ${className} animate-surreal-float opacity-20 hover:opacity-40 transition-opacity`} style={{ animationDelay: delay }}>
    <div className="glass rounded-xl p-3">
      <Icon className="w-5 h-5 text-primary" />
    </div>
  </div>
);

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const openWhatsApp = () => {
    window.open("https://wa.me/5575999401616?text=Olá! Gostaria de solicitar um orçamento.", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/10 rounded-full blur-[100px] animate-orb" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-orb" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/5 animate-morph blur-[150px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-neon-purple/3 to-neon-cyan/5 animate-aurora pointer-events-none" />

      {/* Ripples */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-neon-blue/10 animate-ripple" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-neon-purple/10 animate-ripple" style={{ animationDelay: "0.7s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-neon-cyan/10 animate-ripple" style={{ animationDelay: "1.4s" }} />

      {/* Floating decorative icons */}
      <FloatingIcon icon={Monitor} className="top-[15%] left-[8%] hidden lg:block" delay="0s" />
      <FloatingIcon icon={Brain} className="top-[20%] right-[10%] hidden lg:block" delay="1.5s" />
      <FloatingIcon icon={Zap} className="bottom-[30%] left-[5%] hidden lg:block" delay="3s" />
      <FloatingIcon icon={Shield} className="bottom-[25%] right-[8%] hidden lg:block" delay="4.5s" />
      <FloatingIcon icon={BarChart3} className="top-[45%] left-[3%] hidden xl:block" delay="2s" />
      <FloatingIcon icon={Smartphone} className="top-[40%] right-[5%] hidden xl:block" delay="3.5s" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className={`mb-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-4 animate-surreal-float">
            <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
            <span className="text-xs text-neon-cyan font-medium">🚀 Tecnologia que transforma negócios</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold gradient-neon-text tracking-wider text-glow">
            HELP GB TEC
          </h2>
          <div className="w-20 h-0.5 gradient-neon mx-auto mt-2 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 animate-glow-line bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>

        {/* Title with typewriter */}
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 transition-all duration-1000 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          Criamos{" "}
          <TypeWriter words={[
            "Sites Profissionais",
            "Sistemas Completos", 
            "Aplicativos Mobile",
            "Soluções com IA",
            "Landing Pages",
            "Lojas Virtuais",
          ]} />
          <br />
          <span className="text-foreground">para qualquer negócio.</span>
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
            className="gradient-neon text-primary-foreground font-semibold px-8 py-6 text-base rounded-xl box-glow hover:scale-105 transition-all duration-300 hover-magnetic animate-pulse-neon"
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

        {/* Mockup area with device frames */}
        <div className={`relative mb-16 transition-all duration-[1200ms] delay-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 [transform:perspective(800px)_rotateX(0deg)_translateY(0)]" : "opacity-0 [transform:perspective(800px)_rotateX(15deg)_translateY(40px)]"}`}>
          <div className="glass rounded-2xl p-1 max-w-5xl mx-auto box-glow relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl z-10" />
            <div className="bg-card rounded-xl p-6 md:p-8 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Notebook mockup */}
                <div className="glass rounded-xl p-4 text-center hover-3d animate-surreal-float group relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-full h-36 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    {/* Notebook frame */}
                    <div className="w-28 h-20 rounded-t border-2 border-neon-blue/30 bg-card relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-2 bg-muted/50 flex items-center gap-0.5 px-1">
                        <div className="w-1 h-1 rounded-full bg-destructive/50" />
                        <div className="w-1 h-1 rounded-full bg-[hsl(var(--success))]/50" />
                        <div className="w-1 h-1 rounded-full bg-primary/50" />
                      </div>
                      <div className="p-1.5 pt-3 space-y-1">
                        <div className="h-1 w-full bg-primary/30 rounded animate-pulse" />
                        <div className="h-1 w-3/4 bg-neon-purple/20 rounded animate-pulse" style={{ animationDelay: "0.5s" }} />
                        <div className="flex gap-0.5 mt-1">
                          <div className="h-3 flex-1 bg-neon-cyan/10 rounded animate-pulse" style={{ animationDelay: "1s" }} />
                          <div className="h-3 flex-1 bg-primary/10 rounded animate-pulse" style={{ animationDelay: "1.5s" }} />
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-muted/30 rounded" />
                  </div>
                  <p className="text-sm font-medium text-foreground mt-2">Sites Modernos</p>
                  <p className="text-[10px] text-muted-foreground">Responsivos e profissionais</p>
                </div>

                {/* Phone mockup */}
                <div className="glass rounded-xl p-4 text-center hover-3d animate-surreal-float group relative overflow-hidden" style={{ animationDelay: "1s" }}>
                  <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-full h-36 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="w-16 h-28 rounded-2xl border-2 border-neon-purple/30 bg-card relative overflow-hidden">
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-muted/30 rounded-full" />
                      <div className="p-1.5 pt-3 space-y-1">
                        <div className="h-1 w-full bg-neon-purple/30 rounded animate-pulse" />
                        <div className="h-6 w-full bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 rounded animate-pulse" style={{ animationDelay: "0.5s" }} />
                        <div className="flex gap-0.5">
                          <div className="h-3 flex-1 bg-neon-cyan/10 rounded animate-pulse" style={{ animationDelay: "1s" }} />
                          <div className="h-3 flex-1 bg-primary/10 rounded animate-pulse" style={{ animationDelay: "1.5s" }} />
                        </div>
                        <div className="h-2 w-full bg-[hsl(var(--success))]/10 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-2">Aplicativos</p>
                  <p className="text-[10px] text-muted-foreground">Android e iOS</p>
                </div>

                {/* Dashboard mockup */}
                <div className="glass rounded-xl p-4 text-center hover-3d animate-surreal-float group relative overflow-hidden" style={{ animationDelay: "2s" }}>
                  <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-full h-36 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="w-full mx-3 h-24 rounded border border-neon-cyan/20 bg-card p-2 relative overflow-hidden">
                      <div className="flex gap-1 mb-1.5">
                        <div className="h-6 flex-1 rounded bg-neon-cyan/10 flex items-center justify-center">
                          <div className="text-[6px] text-neon-cyan font-bold animate-pulse">R$ 12.5K</div>
                        </div>
                        <div className="h-6 flex-1 rounded bg-primary/10 flex items-center justify-center">
                          <div className="text-[6px] text-primary font-bold animate-pulse" style={{ animationDelay: "0.5s" }}>+24%</div>
                        </div>
                      </div>
                      <div className="flex items-end gap-0.5 h-10">
                        {[60, 35, 80, 45, 90, 55, 75, 40, 85, 65].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t transition-all duration-1000" style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, hsla(180,100%,50%,0.3), hsla(199,89%,48%,0.3))`,
                            animationDelay: `${i * 0.1}s`,
                          }}>
                            <div className="w-full h-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-2">Dashboards & IA</p>
                  <p className="text-[10px] text-muted-foreground">Dados em tempo real</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Counters */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto transition-all duration-1000 delay-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <CountUp target={100} label="Projetos Criados" />
          <CountUp target={50} label="Clientes Atendidos" />
          <CountUp target={10} label="Segmentos Diferentes" />
          <CountUp target={24} suffix="h" label="Atendimento Rápido" />
        </div>

        {/* Trust badges */}
        <div className={`mt-10 flex flex-wrap items-center justify-center gap-4 transition-all duration-1000 delay-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {["✅ Entrega Rápida", "🔒 100% Seguro", "💬 Suporte 24h", "⚡ Alta Performance"].map((badge) => (
            <div key={badge} className="glass rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:box-glow transition-all cursor-default">
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
