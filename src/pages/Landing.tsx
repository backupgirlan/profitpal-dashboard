import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Youtube, UserPlus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InstallAppDialog from '@/components/InstallAppDialog';
import heroBg from '@/assets/hero-bg.png';

const Landing = () => {
  const [installOpen, setInstallOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Hero background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Technical Girlan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen px-4 py-8">
        {/* Top spacer */}
        <div />

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center space-y-8 max-w-lg"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary text-glow-strong">
            TECHNICAL GIRLAN
          </h1>
          <p className="text-muted-foreground text-lg">
            Plataforma de gerenciamento para traders inteligentes
          </p>

          <div className="flex flex-col gap-4">
            <Link to="/login">
              <Button size="lg" className="w-full text-lg font-display gradient-gold text-primary-foreground hover:opacity-90 box-glow">
                Entrar na Plataforma
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full text-lg border-primary/30 text-primary hover:bg-primary/10">
                Criar Conta
              </Button>
            </Link>
            <a href="https://broker-qx.pro/sign-up/?lid=2011722" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full text-lg border-accent/50 text-accent hover:bg-accent/10">
                <UserPlus className="w-5 h-5 mr-2" />
                Cadastre na Corretora
              </Button>
            </a>
          </div>
        </motion.div>

        <InstallAppDialog open={installOpen} onOpenChange={setInstallOpen} />

        {/* Bottom links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 pb-4"
        >
          <a
            href="https://broker-qx.pro/sign-up/?lid=2011722"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 gap-2">
              <UserPlus className="w-4 h-4" />
              Cadastro Broker
            </Button>
          </a>
          <a
            href="https://t.me/girlananalyst"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 gap-2">
              <MessageCircle className="w-4 h-4" />
              Telegram
            </Button>
          </a>
          <a
            href="https://www.youtube.com/@technicalgirlan"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 gap-2">
              <Youtube className="w-4 h-4" />
              YouTube
            </Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
