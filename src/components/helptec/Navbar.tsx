import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong py-3" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <a href="#" className="font-display font-bold text-lg gradient-neon-text tracking-wider">
          HELP TEC
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = "https://wa.me/5575999401616?text=Olá! Gostaria de solicitar um orçamento.";
              link.target = "_blank";
              link.click();
            }}
            className="gradient-neon text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg hover:scale-105 transition-transform"
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
        <div className="md:hidden glass-strong mt-2 mx-4 rounded-xl p-4 space-y-3">
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
            onClick={() => {
              const link = document.createElement("a");
              link.href = "https://wa.me/5575999401616";
              link.target = "_blank";
              link.click();
            }}
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
