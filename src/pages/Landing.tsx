import { useState, useEffect } from "react";
import { Youtube, Send, LogIn, BarChart3, GraduationCap, Brain, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroBg from "@/assets/hero-bg-new.jpg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";

const DAY_LABELS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface LiveScore { day_of_week: number; wins: number; losses: number; }

const Landing = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [scores, setScores] = useState<LiveScore[]>([]);
  const isEn = i18n.language === 'en';
  const dayLabels = isEn ? DAY_LABELS_EN : DAY_LABELS_PT;

  useEffect(() => {
    const getMonday = () => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.setDate(diff)).toISOString().split('T')[0];
    };
    supabase.from('live_scores').select('day_of_week, wins, losses').eq('week_start', getMonday())
      .then(({ data }) => { if (data) setScores(data as LiveScore[]); });
  }, []);

  const handleBrokerClick = () => {
    window.open("https://broker-qx.pro/sign-up/?lid=2011722", "_blank", "noopener,noreferrer");
  };

  const navItems = [
    { icon: BarChart3, label: t('nav.management') },
    { icon: GraduationCap, label: t('nav.classes') },
    { icon: Brain, label: t('nav.emotionalControl') },
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-foreground gradient-gold box-glow transition-all hover:scale-105 hover:shadow-[0_0_25px_hsla(45,100%,50%,0.4)]"
          >
            <LogIn className="h-4 w-4" />
            {t('nav.enter')}
          </button>
        </div>
      </nav>

      {/* Live schedule - bottom left */}
      <div className="absolute z-20 bottom-[140px] sm:bottom-6 left-4 sm:left-8 backdrop-blur-md bg-background/40 border border-border/30 rounded-lg px-4 py-3 max-w-[220px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
          </span>
          <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">{t('landing.liveOnYoutube')}</span>
        </div>
        <div className="space-y-0.5 text-xs text-foreground/80">
          <p>{t('landing.monFri')} <span className="font-semibold text-foreground">20h</span></p>
          <p>{t('landing.saturday')} <span className="font-semibold text-foreground">19h</span></p>
          <p>{t('landing.sunday')} <span className="font-semibold text-foreground">10h</span></p>
        </div>
      </div>

      {/* Weekly Scoreboard */}
      <div className="absolute z-20 bottom-[140px] sm:bottom-6 right-4 sm:right-8 backdrop-blur-md bg-background/40 border border-border/30 rounded-lg px-4 py-3 max-w-[260px]">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-primary mb-2">
          {t('landing.weeklyScore')}
        </h3>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
            const score = scores.find(s => s.day_of_week === dayIdx);
            return (
              <div key={dayIdx} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-foreground/80 font-medium w-8">{dayLabels[dayIdx]}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-success font-bold">
                    <CheckCircle className="w-3 h-3" /> {score?.wins ?? 0}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="flex items-center gap-1 text-destructive font-bold">
                    <XCircle className="w-3 h-3" /> {score?.losses ?? 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-72px)] flex-col items-center justify-end pb-16 px-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl sm:text-4xl font-black text-glow-strong tracking-wide text-primary mb-2">
            {t('landing.liveTitle')}
          </h1>
          <p className="text-lg sm:text-2xl font-semibold text-foreground mb-8">
            {t('landing.joinTeam')}
          </p>

          <button
            onClick={handleBrokerClick}
            className="group relative cursor-pointer rounded-xl px-8 py-4 sm:px-12 sm:py-5 font-display text-sm sm:text-lg font-bold uppercase tracking-widest text-primary-foreground gradient-gold box-glow-strong transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsla(45,100%,50%,0.5)] active:scale-95 mb-10"
          >
            <span className="relative z-10">{t('landing.createAccount')}</span>
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
