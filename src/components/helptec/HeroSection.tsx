import { useEffect, useState, useRef } from "react";
import { ArrowRight, MessageCircle, Eye, Sparkles, Monitor, Smartphone, BarChart3, Brain, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import logomarca from "@/assets/logomarca.png";

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

const codeLines = [
  { lang: "php", code: '<?php echo "Conectando banco de dados..."; ?>' },
  { lang: "html", code: '<div class="app-container" id="root">' },
  { lang: "php", code: '$api = new HelpGBTec\\AI\\Engine();' },
  { lang: "html", code: '<section class="hero" data-animate="true">' },
  { lang: "php", code: '$result = $api->analyze($userData);' },
  { lang: "html", code: '<script src="/assets/js/app.min.js"></script>' },
  { lang: "php", code: 'return Response::json(["status" => "online"]);' },
  { lang: "html", code: '<meta name="ai-powered" content="true" />' },
  { lang: "php", code: '$site = Site::deploy($config)->publish();' },
  { lang: "html", code: '</div><!-- Build complete ✓ -->' },
];

const CodeStream = () => {
  const [lines, setLines] = useState<{ text: string; lang: string; id: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const line = codeLines[idRef.current % codeLines.length];
      const id = idRef.current;
      idRef.current += 1;
      setLines((prev) => [...prev.slice(-4), { text: line.code, lang: line.lang, id }]);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-start gap-1 min-h-[100px] font-mono text-[11px] md:text-xs">
      {lines.map((l, i) => (
        <div
          key={l.id}
          className="flex items-center gap-2 animate-fade-in w-full"
          style={{ animationDuration: "0.4s" }}
        >
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${l.lang === "php" ? "bg-neon-purple/20 text-neon-purple" : "bg-neon-cyan/20 text-neon-cyan"}`}>
            {l.lang}
          </span>
          <span className={`${i === lines.length - 1 ? "text-[hsl(142,71%,45%)]" : "text-muted-foreground/50"} transition-colors duration-300 truncate`}>
            {l.text}
          </span>
          {i === lines.length - 1 && <span className="animate-blink text-[hsl(142,71%,45%)]">▌</span>}
        </div>
      ))}
    </div>
  );
};

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const openWhatsApp = () => {
    window.open("https://wa.me/5575999401616?text=Olá! Gostaria de solicitar um orçamento.", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-3 sm:px-4 pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-neon-blue/10 rounded-full blur-[80px] sm:blur-[100px] animate-orb" />
      <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-neon-purple/10 rounded-full blur-[100px] sm:blur-[120px] animate-orb" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-cyan/5 animate-morph blur-[100px] sm:blur-[150px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-neon-purple/3 to-neon-cyan/5 animate-aurora pointer-events-none" />

      {/* Ripples */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-40 h-32 sm:h-40 rounded-full border border-neon-blue/10 animate-ripple" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-40 h-32 sm:h-40 rounded-full border border-neon-purple/10 animate-ripple" style={{ animationDelay: "0.7s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-40 h-32 sm:h-40 rounded-full border border-neon-cyan/10 animate-ripple" style={{ animationDelay: "1.4s" }} />

      {/* Floating decorative icons */}
      <FloatingIcon icon={Monitor} className="top-[15%] left-[8%] hidden lg:block" delay="0s" />
      <FloatingIcon icon={Brain} className="top-[20%] right-[10%] hidden lg:block" delay="1.5s" />
      <FloatingIcon icon={Zap} className="bottom-[30%] left-[5%] hidden lg:block" delay="3s" />
      <FloatingIcon icon={Shield} className="bottom-[25%] right-[8%] hidden lg:block" delay="4.5s" />
      <FloatingIcon icon={BarChart3} className="top-[45%] left-[3%] hidden xl:block" delay="2s" />
      <FloatingIcon icon={Smartphone} className="top-[40%] right-[5%] hidden xl:block" delay="3.5s" />

      <div className="relative z-10 max-w-6xl mx-auto text-center w-full">
        {/* Logo centralizada com terminal IA */}
        <div className={`mb-8 sm:mb-12 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-90"}`}>
          {/* Container glass com logo + mensagens IA */}
          <div className="relative glass rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 md:py-4 max-w-3xl w-full box-glow">
            {/* Borda animada */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 rounded-2xl border border-neon-cyan/20" />
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-neon-blue/0 via-neon-cyan/30 to-neon-blue/0 animate-[shimmer-sweep_4s_ease-in-out_infinite] opacity-50" />
            </div>
            
            {/* Header do terminal */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-border/50">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-destructive/70" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[hsl(45,93%,47%)]/70" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[hsl(142,71%,45%)]/70" />
              <span className="text-[8px] sm:text-[10px] text-muted-foreground/50 font-mono ml-1 sm:ml-2 truncate">help-gb-tec-ai — terminal</span>
              <div className="ml-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_6px_hsl(var(--neon-cyan)/0.6)]" />
                <span className="text-[8px] sm:text-[9px] text-neon-cyan font-mono">ONLINE</span>
              </div>
            </div>

            {/* Logo GRANDE centralizada com efeitos de choque */}
            <div className="flex justify-center mb-2 relative">
              {/* Ondas de choque saindo da logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full border border-neon-cyan/15 animate-[shock-wave_3s_ease-out_infinite]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full border border-neon-blue/15 animate-[shock-wave_3s_ease-out_infinite_0.6s]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full border border-neon-purple/10 animate-[shock-wave_3s_ease-out_infinite_1.2s]" />
              </div>
              {/* Raios de energia */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <div key={deg} className="absolute w-full h-full" style={{ transform: `rotate(${deg}deg)` }}>
                    <div className="absolute top-1/2 left-1/2 w-20 md:w-32 h-[1px] origin-left bg-gradient-to-r from-neon-cyan/40 to-transparent animate-[energy-ray_2.5s_ease-in-out_infinite]" style={{ animationDelay: `${deg * 0.01}s` }} />
                  </div>
                ))}
              </div>
              <img 
                src={logomarca} 
                alt="HELP GB TEC" 
                className="relative z-10 h-32 sm:h-44 md:h-56 lg:h-64 w-auto drop-shadow-[0_0_30px_hsl(var(--neon-blue)/0.5)]"
              />
            </div>

            {/* Linha separadora com glow */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent mb-1.5" />

            {/* Código PHP/HTML saindo da logo */}
            <div className="pl-2">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-neon-purple animate-pulse" />
                <span className="text-[10px] text-neon-purple font-mono font-semibold tracking-wider">HELP GB TEC — BUILDING</span>
              </div>
              <CodeStream />
            </div>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass animate-surreal-float">
            <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
            <span className="text-xs text-neon-cyan font-medium">🚀 Tecnologia que transforma negócios</span>
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
                {/* Notebook mockup - Sites Modernos */}
                <div className="glass rounded-xl p-4 text-center hover-3d group relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_hsl(var(--neon-blue)/0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/0 to-neon-purple/0 group-hover:from-neon-blue/10 group-hover:to-neon-purple/10 transition-all duration-700" />
                  <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-neon-blue/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
                  <div className="w-full h-36 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--neon-blue)/0.1),transparent_70%)] animate-pulse" />
                    {/* Notebook frame */}
                    <div className="w-28 h-20 rounded-t border-2 border-neon-blue/30 bg-card relative overflow-hidden group-hover:border-neon-blue/60 transition-colors duration-500 group-hover:shadow-[0_0_15px_hsl(var(--neon-blue)/0.2)]">
                      <div className="absolute top-0 left-0 right-0 h-2 bg-muted/50 flex items-center gap-0.5 px-1">
                        <div className="w-1 h-1 rounded-full bg-destructive/70 group-hover:animate-pulse" />
                        <div className="w-1 h-1 rounded-full bg-[hsl(142,71%,45%)]/70 group-hover:animate-pulse" style={{ animationDelay: "0.2s" }} />
                        <div className="w-1 h-1 rounded-full bg-primary/70 group-hover:animate-pulse" style={{ animationDelay: "0.4s" }} />
                      </div>
                      <div className="p-1.5 pt-3 space-y-1">
                        <div className="h-1 w-full bg-primary/30 rounded animate-[pulse_2s_ease-in-out_infinite]" />
                        <div className="h-1 w-3/4 bg-neon-purple/20 rounded animate-[pulse_2s_ease-in-out_infinite_0.5s]" />
                        <div className="flex gap-0.5 mt-1">
                          <div className="h-3 flex-1 bg-neon-cyan/15 rounded animate-[pulse_3s_ease-in-out_infinite_1s]" />
                          <div className="h-3 flex-1 bg-primary/15 rounded animate-[pulse_3s_ease-in-out_infinite_1.5s]" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-muted/30 rounded" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-2 group-hover:gradient-neon-text transition-all duration-300 relative z-10">Sites Modernos</p>
                  <p className="text-[10px] text-muted-foreground relative z-10">Responsivos e profissionais</p>
                </div>

                {/* Sites Inteligentes com IA */}
                <div className="glass rounded-xl p-4 text-center hover-3d group relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_hsl(var(--neon-purple)/0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/0 to-neon-cyan/0 group-hover:from-neon-purple/10 group-hover:to-neon-cyan/10 transition-all duration-700" />
                  <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-neon-purple/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
                  <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-neon-cyan/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{ animationDelay: "1s" }} />
                  <div className="w-full h-36 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--neon-purple)/0.15),transparent_60%)] animate-pulse" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--neon-cyan)/0.1),transparent_60%)] animate-pulse" style={{ animationDelay: "1.5s" }} />
                    {/* AI Brain visualization */}
                    <div className="relative w-28 h-24 flex items-center justify-center">
                      {/* Central brain icon */}
                      <div className="relative z-10 w-14 h-14 rounded-2xl border-2 border-neon-purple/40 bg-card flex items-center justify-center group-hover:border-neon-purple/70 transition-all duration-500 group-hover:shadow-[0_0_20px_hsl(var(--neon-purple)/0.3)]">
                        <Brain className="w-7 h-7 text-neon-purple animate-[pulse_3s_ease-in-out_infinite]" />
                      </div>
                      {/* Orbiting particles */}
                      <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neon-cyan/60 shadow-[0_0_8px_hsl(var(--neon-cyan)/0.5)]" />
                      </div>
                      <div className="absolute inset-0 animate-[spin_6s_linear_infinite_reverse]">
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-neon-purple/60 shadow-[0_0_6px_hsl(var(--neon-purple)/0.5)]" />
                      </div>
                      <div className="absolute inset-0 animate-[spin_10s_linear_infinite]" style={{ animationDelay: "2s" }}>
                        <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-primary/60 shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
                      </div>
                      {/* Connection lines */}
                      <div className="absolute top-1 left-3 w-5 h-[1px] bg-gradient-to-r from-transparent to-neon-cyan/30 animate-[pulse_2s_ease-in-out_infinite]" style={{ transform: "rotate(-30deg)" }} />
                      <div className="absolute bottom-2 right-2 w-5 h-[1px] bg-gradient-to-r from-transparent to-neon-purple/30 animate-[pulse_2s_ease-in-out_infinite_0.5s]" style={{ transform: "rotate(45deg)" }} />
                      <div className="absolute top-3 right-1 w-4 h-[1px] bg-gradient-to-r from-transparent to-primary/30 animate-[pulse_2s_ease-in-out_infinite_1s]" style={{ transform: "rotate(20deg)" }} />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-2 group-hover:gradient-neon-text transition-all duration-300 relative z-10">Sites Inteligentes com IA</p>
                  <p className="text-[10px] text-muted-foreground relative z-10">Automação e inteligência</p>
                </div>

                {/* Dashboard mockup */}
                <div className="glass rounded-xl p-4 text-center hover-3d group relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/0 to-neon-blue/0 group-hover:from-neon-cyan/10 group-hover:to-neon-blue/10 transition-all duration-700" />
                  <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-neon-cyan/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
                  <div className="w-full h-36 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--neon-cyan)/0.1),transparent_70%)] animate-pulse" />
                    <div className="w-full mx-3 h-24 rounded border border-neon-cyan/20 bg-card p-2 relative overflow-hidden group-hover:border-neon-cyan/50 transition-all duration-500 group-hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.15)]">
                      <div className="flex gap-1 mb-1.5">
                        <div className="h-6 flex-1 rounded bg-neon-cyan/10 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-colors duration-500">
                          <div className="text-[6px] text-neon-cyan font-bold animate-[pulse_2s_ease-in-out_infinite]">R$ 12.5K</div>
                        </div>
                        <div className="h-6 flex-1 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                          <div className="text-[6px] text-primary font-bold animate-[pulse_2s_ease-in-out_infinite_0.5s]">+24%</div>
                        </div>
                      </div>
                      <div className="flex items-end gap-0.5 h-10">
                        {[60, 35, 80, 45, 90, 55, 75, 40, 85, 65].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t transition-all duration-700 group-hover:shadow-[0_0_4px_hsl(var(--neon-cyan)/0.3)]" style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, hsla(180,100%,50%,0.3), hsla(199,89%,48%,0.3))`,
                          }}>
                            <div className="w-full h-full animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-2 group-hover:gradient-neon-text transition-all duration-300 relative z-10">Dashboards & IA</p>
                  <p className="text-[10px] text-muted-foreground relative z-10">Dados em tempo real</p>
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
