import { Youtube, Send } from "lucide-react";
import heroBg from "@/assets/hero-bg-new.jpg";

const Landing = () => {
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
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-end pb-16 px-4">
        {/* CTA principal */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl sm:text-5xl font-black text-glow-strong tracking-wide text-primary mb-3">
            TECHNICAL GIRLAN
          </h1>
          <p className="text-foreground/80 text-base sm:text-lg max-w-md mx-auto mb-8">
            Operações ao vivo todos os dias. Entre para o time.
          </p>

          {/* Broker CTA button - link hidden */}
          <button
            onClick={handleBrokerClick}
            className="group relative cursor-pointer rounded-xl px-8 py-4 sm:px-12 sm:py-5 font-display text-sm sm:text-lg font-bold uppercase tracking-widest text-primary-foreground gradient-gold box-glow-strong transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsla(45,100%,50%,0.5)] active:scale-95 mb-10"
          >
            <span className="relative z-10">🚀 Crie sua conta e opere comigo</span>
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>

        {/* Social links */}
        <div className="flex gap-5">
          <a
            href="https://www.youtube.com/@TechnicalGirlan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 backdrop-blur-sm transition-all hover:bg-red-500/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <Youtube className="h-5 w-5" />
            YouTube
          </a>
          <a
            href="https://t.me/girlananalyst"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-400 backdrop-blur-sm transition-all hover:bg-blue-500/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
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
