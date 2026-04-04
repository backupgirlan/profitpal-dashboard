import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logomarca from "@/assets/helpgbtec-logo.png";

const links = [
  { label: "SERVIÇOS", href: "#servicos" },
  { label: "PROJETOS", href: "#projetos" },
  { label: "PLANOS", href: "#planos" },
  { label: "CONTATO", href: "#contato" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const openWhatsApp = () => {
    window.open("https://wa.me/5575999401616?text=Olá! Gostaria de solicitar um orçamento.", "_blank", "noopener,noreferrer");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong py-2 md:py-3 box-glow" : "py-3 md:py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <img src={logomarca} alt="HELP GB TEC" className="h-8 sm:h-10 md:h-12 w-auto drop-shadow-[0_0_10px_hsl(var(--neon-blue)/0.5)] group-hover:drop-shadow-[0_0_20px_hsl(var(--neon-cyan)/0.7)] transition-all duration-500" />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 gradient-neon group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          <button
            onClick={openWhatsApp}
            className="gradient-neon text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg hover:scale-105 transition-transform animate-pulse-neon"
          >
            Orçamento
          </button>
        </div>

        {/* Mobile */}
        <button className="md:hidden text-foreground p-1" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-strong mt-2 mx-3 rounded-xl p-3 space-y-1 animate-fade-in border border-border/30">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all py-2.5 px-3 rounded-lg"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={openWhatsApp}
            className="w-full gradient-neon text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg mt-2"
          >
            Orçamento
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
