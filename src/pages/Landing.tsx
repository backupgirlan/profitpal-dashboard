import { Youtube, Send, LogIn, BarChart3, GraduationCap, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg-new.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const handleBrokerClick = () => {
    window.open("https://broker-qx.pro/sign-up/?lid=2011722", "_blank", "noopener,noreferrer");
  };

  const navItems = [
    { icon: BarChart3, label: "Gerenciamento" },
    { icon: GraduationCap, label: "Aulas" },
    { icon: Brain, label: "Controle Emocional" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

      {/* Top navbar */}
      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 backdrop-blur-md bg-background/30 border-b border-border/30">
        <span className="font-display text-sm sm:text-lg font-bold text-primary tracking-wider">
          TECHNICAL GIRLAN
        </span>

        <div className="hidden sm:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-foreground/70 hover:text-primary transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-foreground gradient-gold box-glow transition-all hover:scale-105 hover:shadow-[0_0_25px_hsla(45,100%,50%,0.4)]"
        >
          <LogIn className="h-4 w-4" />
          Entrar
        </button>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-72px)] flex-col items-center justify-end pb-16 px-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl sm:text-5xl font-black text-glow-strong tracking-wide text-primary mb-3">
            TECHNICAL GIRLAN
          </h1>
          <p className="text-foreground/80 text-base sm:text-lg max-w-md mx-auto mb-8">
            Operações ao vivo todos os dias. Entre para o time.
          </p>

          <button
            onClick={handleBrokerClick}
            className="group relative cursor-pointer rounded-xl px-8 py-4 sm:px-12 sm:py-5 font-display text-sm sm:text-lg font-bold uppercase tracking-widest text-primary-foreground gradient-gold box-glow-strong transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsla(45,100%,50%,0.5)] active:scale-95 mb-10"
          >
            <span className="relative z-10">🚀 Crie sua conta e opere comigo</span>
          </button>
        </div>

        <div className="flex gap-5">
          <a
            href="https://www.youtube.com/@TechnicalGirlan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm font-semibold text-destructive backdrop-blur-sm transition-all hover:bg-destructive/20 hover:scale-105"
          >
            <Youtube className="h-5 w-5" />
            YouTube
          </a>
          <a
            href="https://t.me/girlananalyst"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-ring/40 bg-ring/10 px-5 py-3 text-sm font-semibold text-ring backdrop-blur-sm transition-all hover:bg-ring/20 hover:scale-105"
          >
            <Send className="h-5 w-5" />
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
};

export default Landing;
