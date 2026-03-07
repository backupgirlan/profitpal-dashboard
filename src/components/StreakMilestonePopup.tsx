import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StreakMilestonePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streakDays: number;
}

const MILESTONE_MESSAGES: Record<number, { pt: string; en: string; emoji: string }> = {
  5: {
    pt: '🔥 5 dias seguidos! Você está construindo consistência. Continue assim, trader!',
    en: '🔥 5 days in a row! You\'re building consistency. Keep it up, trader!',
    emoji: '🔥'
  },
  10: {
    pt: '⚡ 10 dias de disciplina! Sua mentalidade está ficando mais forte. O mercado recompensa quem é constante!',
    en: '⚡ 10 days of discipline! Your mindset is getting stronger. The market rewards consistency!',
    emoji: '⚡'
  },
  15: {
    pt: '🚀 15 dias ininterruptos! Você faz parte dos traders de elite. O gerenciamento é o caminho da riqueza!',
    en: '🚀 15 uninterrupted days! You\'re part of the elite traders. Management is the path to wealth!',
    emoji: '🚀'
  },
  30: {
    pt: '👑 1 MÊS COMPLETO! Você é um verdadeiro guerreiro do mercado! Você ganhou um saldo bônus para novas funcionalidades que serão liberadas em breve!',
    en: '👑 1 FULL MONTH! You\'re a true market warrior! You earned a bonus balance for new features coming soon!',
    emoji: '👑'
  },
};

export default function StreakMilestonePopup({ open, onOpenChange, streakDays }: StreakMilestonePopupProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const milestone = MILESTONE_MESSAGES[streakDays];
  if (!milestone) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/50 max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-2xl flex items-center justify-center gap-2">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            {streakDays} {isEn ? 'Days Streak!' : 'Dias de Streak!'}
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          </DialogTitle>
          <DialogDescription className="sr-only">Streak milestone</DialogDescription>
        </DialogHeader>
        <div className="text-6xl my-4 animate-bounce">{milestone.emoji}</div>
        <p className="text-sm text-foreground leading-relaxed px-2">
          {isEn ? milestone.en : milestone.pt}
        </p>
        {streakDays === 30 && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-2">
            <p className="text-xs text-primary font-bold">🎁 {isEn ? 'Bonus balance credited!' : 'Saldo bônus creditado!'}</p>
          </div>
        )}
        <Button onClick={() => onOpenChange(false)} className="mt-4 gradient-gold text-primary-foreground font-display">
          {isEn ? 'Let\'s go! 💪' : 'Bora! 💪'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
