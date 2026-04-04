import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const categories = [
  { key: "site", label: "Site" },
  { key: "sistema", label: "Sistema" },
  { key: "aplicativo", label: "Aplicativo" },
  { key: "ia", label: "Inteligência Artificial" },
  { key: "landing", label: "Landing Page" },
  { key: "loja", label: "Loja Virtual" },
];

const ProjectsSection = () => {
  const [activeCategory, setActiveCategory] = useState("site");
  const [demos, setDemos] = useState<any[]>([]);

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

  const filtered = demos.filter((d) => d.category === activeCategory);

  const openWhatsApp = (name: string) => {
    const link = document.createElement("a");
    link.href = `https://wa.me/5575999401616?text=Olá! Gostaria de um projeto igual ao "${name}".`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <section id="projetos" className="relative py-20 px-4">
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[120px] animate-orb" />
      
      <div className="max-w-7xl mx-auto">
        <ScrollReveal variant="flip-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Modelos de <span className="gradient-neon-text text-glow">Projetos</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça alguns dos nossos projetos e solicite algo semelhante
            </p>
          </div>
        </ScrollReveal>

        {/* Category filters */}
        <ScrollReveal variant="fade-up" delay={200}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                  activeCategory === cat.key
                    ? "gradient-neon text-primary-foreground box-glow scale-105"
                    : "glass text-muted-foreground hover:text-foreground hover:box-glow hover:scale-105"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Projects grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((demo, i) => (
              <ScrollReveal key={demo.id} variant="zoom-in" delay={i * 120}>
                <div className="group glass rounded-2xl overflow-hidden hover-3d h-full relative">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 pointer-events-none" />
                  <div className="aspect-video bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 relative overflow-hidden">
                    {demo.cover_image ? (
                      <img src={demo.cover_image} alt={demo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Preview</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-5 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      {demo.is_featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full gradient-neon text-primary-foreground font-medium animate-pulse">
                          Destaque
                        </span>
                      )}
                      {demo.segment && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple font-medium">
                          {demo.segment}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold mb-1">{demo.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{demo.description}</p>
                    <div className="flex gap-2">
                      {demo.demo_link && (
                        <Button size="sm" variant="outline" className="text-xs border-neon-blue/30 hover:bg-neon-blue/10" onClick={() => window.open(demo.demo_link, "_blank")}>
                          <ExternalLink className="w-3 h-3 mr-1" /> Ver Demo
                        </Button>
                      )}
                      <Button size="sm" className="text-xs gradient-neon text-primary-foreground" onClick={() => openWhatsApp(demo.name)}>
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
              <p className="text-muted-foreground">Novos projetos em breve nesta categoria.</p>
              <Button
                className="mt-4 gradient-neon text-primary-foreground hover-magnetic"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = "https://wa.me/5575999401616?text=Olá! Quero solicitar um orçamento.";
                  link.target = "_blank";
                  link.click();
                }}
              >
                Solicitar Orçamento
              </Button>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
