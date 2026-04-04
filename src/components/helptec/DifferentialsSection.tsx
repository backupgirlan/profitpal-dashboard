import {
  Palette, Zap, Smartphone, MessageCircle, Brain, Settings,
  Search, Gauge, Shield, Cloud, RefreshCw, Sliders
} from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const items = [
  {
    icon: Palette,
    title: "Design moderno e profissional",
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-background to-muted/50 rounded p-1.5 space-y-1 overflow-hidden">
        <div className="h-2 w-3/4 rounded-full bg-primary/30 animate-[preview-type_3s_ease-in-out_infinite]" />
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/15" />
        <div className="h-1.5 w-5/6 rounded-full bg-muted-foreground/10" />
        <div className="flex gap-1 mt-1">
          <div className="h-6 w-1/2 rounded bg-primary/20 animate-pulse" />
          <div className="h-6 w-1/2 rounded bg-neon-cyan/15 animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Desenvolvimento rápido",
    preview: (
      <div className="w-full h-full flex items-end gap-0.5 p-1.5">
        {[80, 45, 95, 60, 100, 70, 90].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-primary/30 animate-[preview-bar_2s_ease-in-out_infinite]" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    ),
  },
  {
    icon: Smartphone,
    title: "Responsivo para celular e tablet",
    preview: (
      <div className="w-full h-full flex items-center justify-center gap-2 p-1">
        <div className="w-3 h-10 rounded border border-muted-foreground/20 bg-muted/30 animate-[preview-device_4s_ease-in-out_infinite] flex flex-col p-0.5 gap-0.5">
          <div className="h-1 w-full rounded-sm bg-primary/30" />
          <div className="flex-1 rounded-sm bg-neon-cyan/10" />
        </div>
        <div className="w-5 h-8 rounded border border-muted-foreground/20 bg-muted/30 animate-[preview-device_4s_ease-in-out_infinite] flex flex-col p-0.5 gap-0.5" style={{ animationDelay: "0.5s" }}>
          <div className="h-1 w-full rounded-sm bg-primary/30" />
          <div className="flex-1 rounded-sm bg-neon-cyan/10" />
        </div>
        <div className="w-8 h-6 rounded border border-muted-foreground/20 bg-muted/30 animate-[preview-device_4s_ease-in-out_infinite] flex flex-col p-0.5 gap-0.5" style={{ animationDelay: "1s" }}>
          <div className="h-1 w-full rounded-sm bg-primary/30" />
          <div className="flex-1 rounded-sm bg-neon-cyan/10" />
        </div>
      </div>
    ),
  },
  {
    icon: MessageCircle,
    title: "Integração com WhatsApp",
    preview: (
      <div className="w-full h-full flex flex-col justify-end p-1.5 gap-1">
        <div className="self-start max-w-[70%] bg-muted/40 rounded-lg rounded-bl-none px-2 py-1 text-[6px] text-muted-foreground animate-[preview-chat_5s_ease-in-out_infinite]">Olá! Como posso ajudar?</div>
        <div className="self-end max-w-[60%] bg-green-500/20 rounded-lg rounded-br-none px-2 py-1 text-[6px] text-muted-foreground animate-[preview-chat_5s_ease-in-out_infinite]" style={{ animationDelay: "1.5s" }}>Quero um orçamento</div>
        <div className="self-start max-w-[75%] bg-muted/40 rounded-lg rounded-bl-none px-2 py-1 text-[6px] text-muted-foreground animate-[preview-chat_5s_ease-in-out_infinite]" style={{ animationDelay: "3s" }}>Claro! Qual seu projeto?</div>
      </div>
    ),
  },
  {
    icon: Brain,
    title: "Integração com inteligência artificial",
    preview: (
      <div className="w-full h-full flex items-center justify-center p-1.5">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-400/30 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-1.5 rounded-full border border-neon-cyan/20 animate-[spin_5s_linear_infinite_reverse]" />
          <div className="absolute inset-3 rounded-full bg-primary/20 animate-pulse" />
        </div>
      </div>
    ),
  },
  {
    icon: Settings,
    title: "Painel administrativo completo",
    preview: (
      <div className="w-full h-full flex gap-1 p-1">
        <div className="w-1/4 bg-muted/30 rounded flex flex-col gap-0.5 p-0.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-1.5 w-full rounded-sm bg-primary/20 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-3 rounded bg-muted/20 animate-[preview-slide_3s_ease-in-out_infinite]" />
          <div className="flex-1 grid grid-cols-2 gap-0.5">
            <div className="rounded bg-neon-cyan/10 animate-pulse" />
            <div className="rounded bg-primary/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Search,
    title: "SEO otimizado",
    preview: (
      <div className="w-full h-full flex flex-col p-1.5 gap-1">
        <div className="h-3 rounded-full bg-muted/30 border border-muted-foreground/10 flex items-center px-1.5 gap-1">
          <Search className="w-1.5 h-1.5 text-muted-foreground/40" />
          <div className="h-1 flex-1 rounded-full bg-primary/20 animate-[preview-type_4s_steps(20)_infinite]" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-1 animate-[preview-slide_3s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.4}s` }}>
            <div className="w-1 h-1 rounded-full bg-primary/30 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <div className="h-1 w-3/4 rounded-full bg-primary/25" />
              <div className="h-0.5 w-full rounded-full bg-muted-foreground/10" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Gauge,
    title: "Velocidade e performance",
    preview: (
      <div className="w-full h-full flex items-center justify-center p-2">
        <div className="relative w-12 h-6">
          <svg viewBox="0 0 48 24" className="w-full h-full">
            <path d="M4 22 A 20 20 0 0 1 44 22" fill="none" stroke="hsl(var(--muted-foreground)/0.15)" strokeWidth="3" strokeLinecap="round" />
            <path d="M4 22 A 20 20 0 0 1 44 22" fill="none" stroke="hsl(var(--primary)/0.5)" strokeWidth="3" strokeLinecap="round" strokeDasharray="63" className="animate-[preview-gauge_3s_ease-in-out_infinite]" />
          </svg>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[5px] font-bold text-primary/60 animate-[preview-counter_3s_ease-in-out_infinite]">100</div>
        </div>
      </div>
    ),
  },
  {
    icon: Shield,
    title: "Segurança avançada",
    preview: (
      <div className="w-full h-full flex items-center justify-center p-1.5">
        <div className="relative">
          <Shield className="w-8 h-8 text-primary/20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-400/50 animate-ping" />
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Cloud,
    title: "Hospedagem e suporte",
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1.5">
        <Cloud className="w-6 h-6 text-primary/20 animate-[preview-float_4s_ease-in-out_infinite]" />
        <div className="flex gap-0.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-1 h-1 rounded-full bg-neon-cyan/30 animate-[preview-dot_2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
        <div className="text-[5px] text-green-400/50 font-medium">99.9% uptime</div>
      </div>
    ),
  },
  {
    icon: RefreshCw,
    title: "Atualizações constantes",
    preview: (
      <div className="w-full h-full flex items-center justify-center p-1.5">
        <RefreshCw className="w-6 h-6 text-primary/20 animate-[spin_4s_linear_infinite]" />
      </div>
    ),
  },
  {
    icon: Sliders,
    title: "Personalização total",
    preview: (
      <div className="w-full h-full flex flex-col justify-center gap-1.5 p-2">
        {["bg-primary/30", "bg-neon-cyan/30", "bg-neon-purple/30"].map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="h-1 flex-1 rounded-full bg-muted/20">
              <div className={`h-full rounded-full ${c} animate-[preview-slider_${3 + i}s_ease-in-out_infinite]`} style={{ width: `${50 + i * 15}%`, animationDuration: `${3 + i}s` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

const DifferentialsSection = () => {
  return (
    <section className="relative py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-neon-purple/5 rounded-full blur-[120px] animate-orb" style={{ animationDelay: "3s" }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal variant="blur-in">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Por que escolher a <span className="gradient-neon-text text-glow">Help Tec</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Diferenciais que fazem a diferença no resultado do seu projeto
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Timeline line with glow */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px hidden md:block overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-neon-blue/40 via-neon-purple/40 to-neon-cyan/40" />
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-neon-cyan via-neon-blue to-transparent animate-scan opacity-60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <ScrollReveal
                key={item.title}
                variant={i % 2 === 0 ? "fade-right" : "fade-left"}
                delay={i * 80}
              >
                <div
                  className={`group flex items-center gap-4 glass rounded-xl p-5 hover-magnetic relative overflow-hidden ${
                    i % 2 === 0 ? "md:pr-12" : "md:pl-12"
                  }`}
                >
                  <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                  <div className="w-10 h-10 shrink-0 rounded-lg gradient-neon flex items-center justify-center relative z-10">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-sm relative z-10 flex-1">{item.title}</span>

                  {/* Mini animated preview */}
                  <div className="w-16 h-12 shrink-0 rounded-md border border-border/30 bg-background/50 overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity duration-500 relative z-10">
                    {item.preview}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DifferentialsSection;
