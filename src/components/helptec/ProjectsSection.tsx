import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import RealPreview from "./previews/RealPreview";

const categories = [
  { key: "site", label: "🌐 Site", count: 0 },
  { key: "sistema", label: "⚙️ Sistema", count: 0 },
  { key: "aplicativo", label: "📱 Aplicativo", count: 0 },
  { key: "ia", label: "🤖 Inteligência Artificial", count: 0 },
  { key: "landing", label: "🚀 Landing Page", count: 0 },
  { key: "loja", label: "🛒 Loja Virtual", count: 0 },
];

const categoryColors: Record<string, string> = {
  site: "from-neon-blue/20 to-neon-blue/5",
  sistema: "from-neon-purple/20 to-neon-purple/5",
  aplicativo: "from-neon-cyan/20 to-neon-cyan/5",
  ia: "from-neon-purple/20 to-neon-cyan/5",
  landing: "from-neon-blue/20 to-neon-purple/5",
  loja: "from-neon-cyan/20 to-neon-blue/5",
};

  const [activeCategory, setActiveCategory] = useState("site");
  const [demos, setDemos] = useState<any[]>([]);
  const [autoPlay, setAutoPlay] = useState(true);
  const autoRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchDemos = async () => {
      const { data } = await supabase
        .from("project_demos")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false });
      if (data) setDemos(data);
    };
    fetchDemos();
  }, []);

  // Auto-rotate categories
  useEffect(() => {
    if (!autoPlay) return;
    autoRef.current = setInterval(() => {
      setActiveCategory(prev => {
        const idx = categories.findIndex(c => c.key === prev);
        return categories[(idx + 1) % categories.length].key;
      });
    }, 6000);
    return () => clearInterval(autoRef.current);
  }, [autoPlay]);

  const filtered = demos.filter((d) => d.category === activeCategory);

  const openWhatsApp = (name: string) => {
    window.open(
      `https://wa.me/5575999401616?text=Olá! Gostaria de um projeto igual ao "${name}".`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 15000);
  };

  return (
    <section id="projetos" className="relative py-24 px-4">
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[120px] animate-orb" />
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-neon-purple/5 rounded-full blur-[120px] animate-orb" style={{ animationDelay: "3s" }} />

      <div className="max-w-7xl mx-auto">
        <ScrollReveal variant="flip-up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <span className="text-xs text-neon-cyan font-medium">✨ Portfólio Completo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Modelos de <span className="gradient-neon-text text-glow">Projetos</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça nossos projetos reais e solicite algo semelhante para o seu negócio.
              <span className="text-primary font-medium"> Mais de 130 modelos disponíveis!</span>
            </p>
          </div>
        </ScrollReveal>

        {/* Category filters */}
        <ScrollReveal variant="fade-up" delay={200}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => {
              const count = demos.filter(d => d.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-500 relative overflow-hidden ${
                    activeCategory === cat.key
                      ? "gradient-neon text-primary-foreground box-glow scale-105"
                      : "glass text-muted-foreground hover:text-foreground hover:box-glow hover:scale-105"
                  }`}
                >
                  {activeCategory === cat.key && (
                    <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                  )}
                  <span className="relative z-10">{cat.label} ({count})</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Auto-play indicator */}
        {autoPlay && (
          <div className="flex justify-center mb-6">
            <div className="glass rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
              <span className="text-[10px] text-muted-foreground">Rotação automática ativa</span>
            </div>
          </div>
        )}

        {/* Projects grid */}
        <div className="min-h-[400px]">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in-up" key={activeCategory}>
              {filtered.map((demo, i) => (
                <ScrollReveal
                  key={demo.id}
                  variant={i % 5 === 0 ? "zoom-in" : i % 5 === 1 ? "fade-up" : i % 5 === 2 ? "flip-up" : i % 5 === 3 ? "fade-left" : "scale-rotate"}
                  delay={i * 80}
                >
                  <div className="group glass rounded-2xl overflow-hidden hover-3d h-full relative">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 pointer-events-none" />
                    
                    {/* Preview area with animated content */}
                    <div className={`aspect-[4/3] bg-gradient-to-br ${categoryColors[demo.category] || "from-neon-blue/10 to-neon-purple/10"} relative overflow-hidden`}>
                      {/* Rich animated preview */}
                      <RealPreview category={demo.category} segment={demo.segment} name={demo.name} />

                      {/* Browser chrome */}
                      <div className="absolute top-0 left-0 right-0 h-6 bg-background/90 backdrop-blur-sm flex items-center gap-1.5 px-2.5 z-20 border-b border-border/30">
                        <span className="w-2 h-2 rounded-full bg-destructive/60" />
                        <span className="w-2 h-2 rounded-full bg-[hsl(40,100%,60%)]/60" />
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))]/60" />
                        <span className="ml-2 text-[8px] text-muted-foreground truncate">
                          {demo.name?.toLowerCase().replace(/\s+/g, "-")}.com.br
                        </span>
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500 z-10" />
                    </div>

                    <div className="p-4 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        {demo.is_featured && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full gradient-neon text-primary-foreground font-medium animate-pulse">
                            ⭐ Destaque
                          </span>
                        )}
                        {demo.segment && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple font-medium">
                            {demo.segment}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-sm mb-1">{demo.name}</h3>
                      <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{demo.description}</p>
                      <div className="flex gap-2">
                        {demo.demo_link && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[10px] h-7 border-neon-blue/30 hover:bg-neon-blue/10"
                            onClick={() => window.open(demo.demo_link, "_blank")}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Demo
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="text-[10px] h-7 gradient-neon text-primary-foreground flex-1"
                          onClick={() => openWhatsApp(demo.name)}
                        >
                          Solicitar Igual <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal variant="zoom-in">
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">Carregando projetos...</p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
};


export default ProjectsSection;
