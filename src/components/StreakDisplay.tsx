import { Flame, Snowflake, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useStreak, getNextMilestone, getMilestoneProgress, getUnlockedMilestones } from '@/hooks/useStreak';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

export default function StreakDisplay() {
  const { streak, loading, atRisk } = useStreak();
  const { t } = useTranslation();

  if (loading || !streak) return null;

  const next = getNextMilestone(streak.streak_atual);
  const progress = getMilestoneProgress(streak.streak_atual);
  const unlocked = getUnlockedMilestones(streak.streak_atual);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-display font-bold ${streak.streak_atual > 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
              <Flame className="w-3.5 h-3.5" />
              {streak.streak_atual} {t('streak.days')}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-card border-border max-w-xs p-3 space-y-2">
            <p className="text-xs font-display font-bold text-primary">{t('streak.dailyStreak')}</p>
            <p className="text-[10px] text-muted-foreground">{t('streak.longestStreak', { count: streak.maior_streak })}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Snowflake className="w-3 h-3" /> {t('streak.freezes')}: {streak.streak_freeze_disponivel}
            </div>
            {next && (
              <div>
                <p className="text-[10px] text-muted-foreground">{t('streak.next', { icon: next.icon, label: next.label, days: next.days })}</p>
                <Progress value={progress} className="h-1.5 mt-1" />
              </div>
            )}
            {unlocked.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {unlocked.map(m => <span key={m.days} className="text-[10px] bg-primary/10 rounded px-1 py-0.5">{m.icon}</span>)}
              </div>
            )}
          </TooltipContent>
        </Tooltip>
        {streak.streak_freeze_disponivel > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-blue-400"><Snowflake className="w-3 h-3" /> {streak.streak_freeze_disponivel}</span>
        )}
        {unlocked.length > 0 && <span className="flex items-center gap-0.5 text-[10px] text-primary"><Trophy className="w-3 h-3" /></span>}
      </div>
      {atRisk && (
        <div className="text-[10px] text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-1">
          {t('streak.atRisk', { count: streak.streak_atual })}
        </div>
      )}
    </div>
  );
}
