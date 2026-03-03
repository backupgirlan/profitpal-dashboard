import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import loginBg from '@/assets/login-bg.png';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: t('login.error'), description: error.message, variant: 'destructive' });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <img src={loginBg} alt="Technical Girlan" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background/90" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end px-4 pb-8 pt-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" /> {t('login.back')}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="bg-card/80 backdrop-blur-md border border-border rounded-lg p-8 box-glow">
            <h1 className="text-2xl font-display font-bold text-primary text-glow mb-2">{t('login.title')}</h1>
            <p className="text-muted-foreground mb-6">{t('login.subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('login.emailPlaceholder')} required className="bg-secondary border-border" />
              </div>
              <div>
                <Label htmlFor="password">{t('login.password')}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="bg-secondary border-border" />
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-gold text-primary-foreground font-display gap-2">
                <LogIn className="w-4 h-4" />
                {loading ? t('login.submitting') : t('login.submit')}
              </Button>
            </form>

            <p className="text-center text-muted-foreground mt-4 text-sm">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline">{t('login.createAccount')}</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
