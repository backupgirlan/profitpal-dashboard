import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, Shield, Zap, Brain, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type RiskZone = 'safe' | 'attention' | 'risk' | 'critical';

interface RiskData {
  zone: RiskZone;
  score: number;
  factors: { label: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[];
  recommendation: string;
}

const ZONE_CONFIG: Record<RiskZone, { label: string; color: string; bg: string; border: string; icon: typeof Shield }> = {
  safe: { label: 'Zona Segura', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: Shield },
  attention: { label: 'Zona de Atenção', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', icon: Activity },
  risk: { label: 'Zona de Risco', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', icon: AlertTriangle },
  critical: { label: 'Zona Crítica', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: Zap },
};

export default function EmotionalRiskMap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateRisk = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const [{ data: todayTrades }, { data: profile }, { data: checkin }, { data: recentLosses }] = await Promise.all([
        supabase.from('trades').select('*').eq('user_id', user.id).gte('trade_date', today),
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('emotional_checkins').select('*').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`).order('created_at', { ascending: false }).limit(1),
        supabase.from('trades').select('result').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ]);

      const factors: RiskData['factors'] = [];
      let riskScore = 50; // Base score

      // Factor 1: Today's checkin
      const todayCheckin = checkin?.[0];
      if (todayCheckin) {
        if (todayCheckin.is_risky) {
          factors.push({ label: 'Check-in indica risco emocional', impact: 'negative', weight: 20 });
          riskScore += 20;
        } else if (todayCheckin.slept_well && !todayCheckin.recovering_loss && !todayCheckin.had_argument) {
          factors.push({ label: 'Check-in indica estado saudável', impact: 'positive', weight: 15 });
          riskScore -= 15;
        } else {
          factors.push({ label: 'Check-in indica estado neutro', impact: 'neutral', weight: 0 });
        }
      } else {
        factors.push({ label: 'Sem check-in hoje', impact: 'negative', weight: 10 });
        riskScore += 10;
      }

      // Factor 2: Consecutive losses
      let consecutiveLosses = 0;
      if (recentLosses) {
        for (const t of recentLosses) {
          if (t.result === 'loss') consecutiveLosses++;
          else break;
        }
      }
      if (consecutiveLosses >= 3) {
        factors.push({ label: `${consecutiveLosses} losses consecutivos`, impact: 'negative', weight: 25 });
        riskScore += 25;
      } else if (consecutiveLosses >= 2) {
        factors.push({ label: `${consecutiveLosses} losses consecutivos`, impact: 'negative', weight: 15 });
        riskScore += 15;
      } else if (consecutiveLosses === 0 && recentLosses && recentLosses.length > 0) {
        factors.push({ label: 'Sequência positiva recente', impact: 'positive', weight: 10 });
        riskScore -= 10;
      }

      // Factor 3: Number of trades today (overtrading)
      const tradesCount = todayTrades?.length || 0;
      if (tradesCount >= 10) {
        factors.push({ label: `Overtrading detectado (${tradesCount} ops)`, impact: 'negative', weight: 20 });
        riskScore += 20;
      } else if (tradesCount >= 6) {
        factors.push({ label: `Volume alto hoje (${tradesCount} ops)`, impact: 'negative', weight: 10 });
        riskScore += 10;
      } else if (tradesCount > 0 && tradesCount <= 3) {
        factors.push({ label: 'Volume controlado', impact: 'positive', weight: 5 });
        riskScore -= 5;
      }

      // Factor 4: Today's P&L
      const todayProfit = todayTrades?.reduce((s, t) => s + (Number(t.profit) || 0), 0) || 0;
      if (todayProfit < -100) {
        factors.push({ label: `Prejuízo significativo hoje (R$ ${todayProfit.toFixed(0)})`, impact: 'negative', weight: 15 });
        riskScore += 15;
      } else if (todayProfit > 50) {
        factors.push({ label: `Lucro positivo hoje (R$ ${todayProfit.toFixed(0)})`, impact: 'positive', weight: 10 });
        riskScore -= 10;
      }

      // Factor 5: Discipline score
      const disciplineScore = profile?.discipline_score || 100;
      if (disciplineScore < 50) {
        factors.push({ label: `Score de disciplina baixo (${disciplineScore}%)`, impact: 'negative', weight: 10 });
        riskScore += 10;
      } else if (disciplineScore >= 80) {
        factors.push({ label: `Score de disciplina alto (${disciplineScore}%)`, impact: 'positive', weight: 10 });
        riskScore -= 10;
      }

      // Factor 6: Time of day (late night = risky)
      const hour = new Date().getHours();
      if (hour >= 23 || hour < 6) {
        factors.push({ label: 'Horário de risco (madrugada)', impact: 'negative', weight: 15 });
        riskScore += 15;
      }

      // Clamp score
      riskScore = Math.max(0, Math.min(100, riskScore));

      // Determine zone
      let zone: RiskZone = 'safe';
      if (riskScore >= 75) zone = 'critical';
      else if (riskScore >= 55) zone = 'risk';
      else if (riskScore >= 35) zone = 'attention';

      // Generate recommendation
      const recommendations: Record<RiskZone, string> = {
        safe: 'Você está em condições emocionais favoráveis para operar. Mantenha a disciplina.',
        attention: 'Alguns sinais de alerta foram detectados. Opere com cautela e respeite seu gerenciamento.',
        risk: 'Seu comportamento atual indica risco elevado. Considere reduzir o volume de operações.',
        critical: 'Seu estado atual indica alta chance de decisões impulsivas. Recomendamos encerrar as operações por hoje.',
      };

      setRiskData({
        zone,
        score: riskScore,
        factors: factors.sort((a, b) => b.weight - a.weight),
        recommendation: recommendations[zone],
      });
    } catch (err) {
      console.error('Error calculating risk:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRisk();
    const interval = setInterval(calculateRisk, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 h-48 flex items-center justify-center">
          <div className="animate-pulse-gold w-10 h-10 rounded-full bg-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!riskData) return null;

  const config = ZONE_CONFIG[riskData.zone];
  const ZoneIcon = config.icon;

  return (
    <Card className={`border-2 ${config.border} bg-gradient-to-br from-card via-card to-background overflow-hidden`}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
              <Activity className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
                Mapa de Risco Emocional
              </h3>
              <p className="text-[10px] text-muted-foreground">Monitoramento em tempo real</p>
            </div>
          </div>
        </div>

        {/* Main Zone Indicator */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative p-6 rounded-2xl ${config.bg} border ${config.border} mb-5`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-16 h-16 rounded-2xl ${config.bg} border-2 ${config.border} flex items-center justify-center`}
              >
                <ZoneIcon className={`w-8 h-8 ${config.color}`} />
              </motion.div>
              <div>
                <p className={`text-lg font-display font-bold ${config.color}`}>{config.label}</p>
                <p className="text-xs text-muted-foreground">Nível de risco: {riskData.score}%</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-mono font-bold ${config.color}`}>
                {riskData.score}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-background/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${riskData.score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                riskData.zone === 'safe' ? 'bg-success' :
                riskData.zone === 'attention' ? 'bg-yellow-400' :
                riskData.zone === 'risk' ? 'bg-orange-400' :
                'bg-destructive'
              }`}
            />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
            <span>Seguro</span>
            <span>Atenção</span>
            <span>Risco</span>
            <span>Crítico</span>
          </div>
        </motion.div>

        {/* Risk Factors */}
        <div className="space-y-2 mb-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Fatores Detectados</p>
          {riskData.factors.map((factor, i) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center justify-between p-2.5 rounded-lg ${
                factor.impact === 'positive' ? 'bg-success/5 border border-success/10' :
                factor.impact === 'negative' ? 'bg-destructive/5 border border-destructive/10' :
                'bg-secondary/30 border border-border/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  factor.impact === 'positive' ? 'bg-success' :
                  factor.impact === 'negative' ? 'bg-destructive' :
                  'bg-muted-foreground'
                }`} />
                <span className="text-xs text-foreground">{factor.label}</span>
              </div>
              <Badge variant="outline" className={`text-[9px] ${
                factor.impact === 'positive' ? 'border-success/30 text-success' :
                factor.impact === 'negative' ? 'border-destructive/30 text-destructive' :
                'border-border text-muted-foreground'
              }`}>
                {factor.impact === 'positive' ? '-' : factor.impact === 'negative' ? '+' : ''}{factor.weight}%
              </Badge>
            </motion.div>
          ))}
        </div>

        {/* Recommendation */}
        <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <Brain className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
            <div>
              <p className={`text-xs font-bold ${config.color} mb-1`}>Recomendação Horus IA</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{riskData.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Action Button for Critical Zone */}
        <AnimatePresence>
          {riskData.zone === 'critical' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <Button
                onClick={() => navigate('/dashboard/horus')}
                className="w-full gradient-gold text-primary-foreground gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Conversar com Horus IA
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
