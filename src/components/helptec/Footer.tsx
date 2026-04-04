import { MessageCircle, Instagram, Globe } from "lucide-react";

const Footer = () => {
  const openWhatsApp = () => {
    const link = document.createElement("a");
    link.href = "https://wa.me/5575999401616";
    link.target = "_blank";
    link.click();
  };

  return (
    <footer className="relative border-t border-border/50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-display font-bold text-xl gradient-neon-text mb-3">HELP GB TEC</h3>
            <p className="text-sm text-muted-foreground">
              Criando soluções digitais para transformar negócios.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Menu Rápido</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#servicos" className="hover:text-primary transition-colors">Serviços</a></li>
              <li><a href="#projetos" className="hover:text-primary transition-colors">Projetos</a></li>
              <li><a href="#planos" className="hover:text-primary transition-colors">Planos</a></li>
              <li><a href="#contato" className="hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" onClick={openWhatsApp}>
                <MessageCircle className="w-4 h-4" /> +55 75 99940-1616
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <button className="w-9 h-9 rounded-full glass flex items-center justify-center hover:box-glow transition-all">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full glass flex items-center justify-center hover:box-glow transition-all">
                <Globe className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Help GB Tec — Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Help GB Tec — Criando soluções digitais para transformar negócios.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
