import { Youtube, Send, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg-new.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const handleBrokerClick = () => {
    window.open("https://broker-qx.pro/sign-up/?lid=2011722", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

      {/* Login button top-right */}
      <div className="relative z-20 flex justify-end p-4 sm:p-6">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 rounded-lg border border-primary/30 bg-background/40 px-5 py-2.5 font-display text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary backdrop-blur-md transition-all hover:bg-primary/20 hover:border-primary/60 hover:scale-105 hover:shadow-[0_0_20px_hsla(45,100%,50%,0.2)]"
        >
          <LogIn className="h-4 w-4" />
          Entrar
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center justify-end pb-16 px-4">
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
            <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "hsla(0,0%,100%,0.1)" }} />
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
