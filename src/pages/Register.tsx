import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Register = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t('common.error'), description: t('register.passwordMismatch'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLoading(false);
    if (error) {
      toast({ title: t('register.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('register.success'), description: t('register.welcome') });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> {t('register.back')}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="bg-card border border-border rounded-lg p-8 box-glow">
          <h1 className="text-2xl font-display font-bold text-primary text-glow mb-2">{t('register.title')}</h1>
          <p className="text-muted-foreground mb-6">{t('register.subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('register.name')}</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('register.namePlaceholder')} required className="bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="email">{t('register.email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('register.emailPlaceholder')} required className="bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="password">{t('register.password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required className="bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" minLength={6} required className="bg-secondary border-border" />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-gold text-primary-foreground font-display gap-2">
              <UserPlus className="w-4 h-4" />
              {loading ? t('register.submitting') : t('register.submit')}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-4 text-sm">
            {t('register.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline">{t('register.login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
