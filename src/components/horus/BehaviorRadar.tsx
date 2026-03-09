import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radar, AlertTriangle, Brain, RefreshCw, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface RadarCategory {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface RadarAnalysis {
  categories: RadarCategory[];
  insight: string;
  alerts: string[];
}

export default function BehaviorRadar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<RadarAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const calculateRadarData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [{ data: trades }, { data: profile }, { data: checkins }, { data: diary }] = await Promise.all([
        supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('emotional_checkins').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('trader_diary').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);

      const totalTrades = trades?.length || 0;
      const wins = trades?.filter(t => t.result === 'win').length || 0;
      const followedPlan = trades?.filter(t => t.followed_plan).length || 0;

      const disciplina = totalTrades > 0 ? Math.round((followedPlan / totalTrades) * 100) : 80;

      const riskyCheckins = checkins?.filter(c => c.is_risky).length || 0;
      const totalCheckins = checkins?.length || 1;
      const controleEmocional = Math.max(20, Math.round(100 - (riskyCheckins / totalCheckins) * 80));

      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 50;
      const consistencia = Math.min(100, Math.round(50 + (winRate - 50) * 0.8));

      const consecutiveLosses = profile?.consecutive_losses || 0;
      const gestaoRisco = Math.max(20, 100 - (consecutiveLosses * 15));

      const diaryFollowed = diary?.filter(d => d.followed_plan).length || 0;
      const totalDiary = diary?.length || 1;
      const respeitoPlano = totalTrades > 0 ? Math.round(((followedPlan / totalTrades) * 0.6 + (diaryFollowed / totalDiary) * 0.4) * 100) : 75;

      let postLossControl = 80;
      if (trades && trades.length > 2) {
        let badAfterLoss = 0;
        let lossCount = 0;
        for (let i = 1; i < trades.length; i++) {
          if (trades[i].result === 'loss') {
            lossCount++;
            if (i > 0 && trades[i - 1].result === 'loss') badAfterLoss++;
          }
        }
        postLossControl = lossCount > 0 ? Math.max(30, 100 - (badAfterLoss / lossCount) * 60) : 80;
      }

      const categories: RadarCategory[] = [
        { key: 'disciplina', label: t('horus.discipline'), value: disciplina, color: 'hsl(48, 96%, 53%)' },
        { key: 'controle_emocional', label: t('horus.emotionalControl'), value: controleEmocional, color: 'hsl(142, 71%, 45%)' },
        { key: 'consistencia', label: t('horus.consistency'), value: consistencia, color: 'hsl(221, 83%, 53%)' },
        { key: 'gestao_risco', label: t('horus.riskManagement'), value: gestaoRisco, color: 'hsl(280, 70%, 55%)' },
        { key: 'respeito_plano', label: t('horus.planRespect'), value: respeitoPlano, color: 'hsl(25, 95%, 53%)' },
        { key: 'controle_pos_loss', label: t('horus.postLossControl'), value: Math.round(postLossControl), color: 'hsl(0, 84%, 60%)' },
      ];

      const alerts: string[] = [];
      categories.forEach(cat => {
        if (cat.value < 40) {
          alerts.push(t('horus.criticalLevel', { label: cat.label, value: cat.value }));
        }
      });

      const weakestCategory = categories.reduce((min, cat) => cat.value < min.value ? cat : min);
      const strongestCategory = categories.reduce((max, cat) => cat.value > max.value ? cat : max);

      let insight = '';
      if (weakestCategory.value < 50) {
        insight = t('horus.weakestPoint', { label: weakestCategory.label.toLowerCase(), value: weakestCategory.value });
      } else if (strongestCategory.value > 80) {
        insight = t('horus.strongestPoint', { label: strongestCategory.label.toLowerCase(), value: strongestCategory.value });
      } else {
        insight = t('horus.balanced');
      }

      setAnalysis({ categories, insight, alerts });
      setLastUpdate(new Date());
    } catch (err: any) {
      toast.error(t('horus.radarError') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRadarData();
  }, [user]);

  const renderRadarChart = () => {
    if (!analysis) return null;
    const centerX = 160;
    const centerY = 160;
    const maxRadius = 90;
    const levels = 5;
    const categories = analysis.categories;
    const angleStep = (2 * Math.PI) / categories.length;
    const dataPoints = categories.map((cat, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const radius = (cat.value / 100) * maxRadius;
      return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
    });
    const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <svg width="320" height="320" className="mx-auto" viewBox="0 0 320 320">
        {Array.from({ length: levels }).map((_, i) => (
          <circle key={i} cx={centerX} cy={centerY} r={(maxRadius / levels) * (i + 1)} fill="none" stroke="hsl(var(--border))" strokeOpacity={0.3} strokeWidth={1} />
        ))}
        {categories.map((cat, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const endX = centerX + maxRadius * Math.cos(angle);
          const endY = centerY + maxRadius * Math.sin(angle);
          return <line key={i} x1={centerX} y1={centerY} x2={endX} y2={endY} stroke="hsl(var(--border))" strokeOpacity={0.4} strokeWidth={1} />;
        })}
        <motion.polygon initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} points={polygonPoints} fill="hsl(48, 96%, 53%)" fillOpacity={0.2} stroke="hsl(48, 96%, 53%)" strokeWidth={2} />
        {dataPoints.map((point, i) => (
          <motion.circle key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} cx={point.x} cy={point.y} r={5} fill={categories[i].color} stroke="hsl(var(--background))" strokeWidth={2} />
        ))}
        {categories.map((cat, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = maxRadius + 30;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          const isLeft = x < centerX;
          const isCenter = Math.abs(x - centerX) < 20;
          const anchor = isCenter ? 'middle' : isLeft ? 'end' : 'start';
          const words = cat.label.split(' ');
          return (
            <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize={9} fontWeight={500} fill="hsl(var(--muted-foreground))">
              {words.length > 1 ? (
                <>
                  <tspan x={x} dy="-0.4em">{words[0]}</tspan>
                  <tspan x={x} dy="1.1em">{words.slice(1).join(' ')}</tspan>
                </>
              ) : cat.label}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
              <Radar className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">{t('horus.behaviorRadar')}</h3>
              <p className="text-[10px] text-muted-foreground">{t('horus.behaviorRadarDesc')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={calculateRadarData} disabled={loading} className="text-xs gap-1.5">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {t('horus.update')}
          </Button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse-gold w-10 h-10 rounded-full bg-primary" />
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div className="flex justify-center">{renderRadarChart()}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {analysis.categories.map(cat => (
                <div key={cat.key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <span className="text-[10px] text-muted-foreground truncate">{cat.label}</span>
                  <Badge variant="outline" className={`text-[10px] font-mono ${cat.value >= 70 ? 'border-success/50 text-success' : cat.value >= 40 ? 'border-primary/50 text-primary' : 'border-destructive/50 text-destructive'}`}>{cat.value}</Badge>
                </div>
              ))}
            </div>
            <AnimatePresence>
              {analysis.alerts.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-destructive">{t('horus.behavioralAlert')}</p>
                      {analysis.alerts.map((alert, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground">{alert}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-primary mb-1">{t('horus.horusAnalysis')}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{analysis.insight}</p>
                </div>
              </div>
            </div>
            {lastUpdate && (
              <p className="text-[9px] text-muted-foreground text-right">
                {t('horus.lastUpdate')}: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">{t('horus.noData')}</div>
        )}
      </CardContent>
    </Card>
  );
}
