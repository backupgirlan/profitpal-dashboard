import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Lock, MessageCircle, UserPlus, Award } from 'lucide-react';
import brokerSignup from '@/assets/broker-signup.png';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function VipGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVip, setIsVip] = useState<boolean | null>(null);
  const [isSuperVip, setIsSuperVip] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('is_vip, is_super_vip').eq('user_id', user.id).single(),
      supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
    ]).then(([profileRes, roleRes]) => {
      setIsVip(!!profileRes.data?.is_vip);
      setIsSuperVip(!!(profileRes.data as any)?.is_super_vip);
      setIsAdmin(!!roleRes.data);
    });
  }, [user]);

  if (isVip === null) return null;
  if (isVip || isSuperVip || isAdmin) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center box-glow">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-primary text-glow">{t('vip.blocked')}</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {t('vip.notApproved')}<br />{t('vip.instructions')}
        </p>

        {/* CTA Super VIP */}
        <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <Button
            size="lg"
            onClick={() => navigate('/dashboard/super-vip')}
            className="w-full gradient-gold text-primary-foreground font-display text-base gap-2 h-12 box-glow"
          >
            <Award className="w-5 h-5" />
            Desbloqueie tudo com Super VIP — R$ 29,90/mês
          </Button>
        </motion.div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">ou acesso VIP gratuito</span></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="http://t.me/technicalgirlan" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 gap-2 w-full">
              <MessageCircle className="w-4 h-4" /> {t('vip.requestTelegram')}
            </Button>
          </a>
          <a href="https://broker-qx.pro/sign-up/?lid=2011722" target="_blank" rel="noopener noreferrer">
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 gap-2 w-full">
                <UserPlus className="w-4 h-4" /> {t('vip.registerBroker')}
              </Button>
            </motion.div>
          </a>
        </div>
        <a href="https://broker-qx.pro/sign-up/?lid=2011722" target="_blank" rel="noopener noreferrer" className="block mt-4">
          <img src={brokerSignup} alt="Broker Signup" className="mx-auto rounded-lg border border-primary/20 w-56 hover:opacity-80 transition-opacity" />
        </a>
      </div>
    </div>
  );
}
