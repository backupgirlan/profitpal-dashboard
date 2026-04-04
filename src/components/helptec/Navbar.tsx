import { useState, useEffect } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const links = [
  { label: "Serviços", href: "#servicos" },
  { label: "Projetos", href: "#projetos" },
  { label: "Planos", href: "#planos" },
  { label: "Contato", href: "#contato" },
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
        scrolled ? "glass-strong py-3 box-glow" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <a href="#" className="font-display font-bold text-lg gradient-neon-text tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
          HELP GB TEC
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
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-strong mt-2 mx-4 rounded-xl p-4 space-y-3 animate-fade-in-up">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={openWhatsApp}
            className="w-full gradient-neon text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg"
          >
            Orçamento
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
