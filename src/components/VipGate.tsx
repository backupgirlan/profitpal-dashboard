import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Lock, MessageCircle, UserPlus, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function VipGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isVip, setIsVip] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check VIP and admin status in parallel
    Promise.all([
      supabase.from('profiles').select('is_vip').eq('user_id', user.id).single(),
      supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
    ]).then(([profileRes, roleRes]) => {
      setIsVip(!!profileRes.data?.is_vip);
      setIsAdmin(!!roleRes.data);
    });
  }, [user]);

  // Loading
  if (isVip === null) return null;

  // Admins and VIP users pass through
  if (isVip || isAdmin) return <>{children}</>;

  // Blocked screen
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center box-glow">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-primary text-glow">
          Acesso Bloqueado
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Sua conta ainda não foi liberada.<br />
          Para agilizar o processo de liberação:<br />
          Crie seu cadastro na corretora e<br />
          entre em contato pelo Telegram para solicitar a liberação do VIP.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a href="http://t.me/technicalgirlan" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 gap-2 w-full">
              <MessageCircle className="w-4 h-4" /> Solicitar liberação no Telegram
            </Button>
          </a>
          <a href="https://broker-qx.pro/sign-up/?lid=2011722" target="_blank" rel="noopener noreferrer">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 gap-2 w-full">
                <UserPlus className="w-4 h-4" /> Cadastrar na Corretora
              </Button>
            </motion.div>
          </a>
        </div>
      </div>
    </div>
  );
}
