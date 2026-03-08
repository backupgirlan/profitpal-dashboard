import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMentalProtection, EmotionalCheckin } from '@/hooks/useMentalProtection';
import { useAuth } from '@/hooks/useAuth';
import {
  Brain, Shield, AlertTriangle, BookOpen, Award, Heart,
  Clock, TrendingDown, Eye, Flame, Lock, Smile, Frown,
  Meh, Zap, Moon, MessageCircle, Save, RefreshCw, Ban,
  CheckCircle, XCircle, Target, BarChart3, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOTIONAL_STATES = [
  { value: 'tranquilo', label: '😌 Tranquilo', color: 'text-success', risky: false },
  { value: 'neutro', label: '😐 Neutro', color: 'text-muted-foreground', risky: false },
  { value: 'irritado', label: '😠 Irritado', color: 'text-destructive', risky: true },
  { value: 'ansioso', label: '😰 Ansioso', color: 'text-warning', risky: true },
  { value: 'frustrado', label: '😤 Frustrado', color: 'text-destructive', risky: true },
];

export default function MentalProtection() {
  const mp = useMentalProtection();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('checkin');
  const [quote, setQuote] = useState(mp.getRandomQuote());

  // Check-in state
  const [checkinState, setCheckinState] = useState('neutro');
  const [hadArgument, setHadArgument] = useState(false);
  const [recoveringLoss, setRecoveringLoss] = useState(false);
  const [sleptWell, setSleptWell] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);

  // Stop config
  const [stopDaily, setStopDaily] = useState('');
  const [stopWeekly, setStopWeekly] = useState('');

  // Diary state
  const [diaryEmotion, setDiaryEmotion] = useState('');
  const [diaryMistakes, setDiaryMistakes] = useState('');
  const [diaryLessons, setDiaryLessons] = useState('');

  // Pause dialog
  const [showPauseDialog, setShowPauseDialog] = useState(false);

  useEffect(() => {
    if (mp.stats.stopDaily > 0) setStopDaily(String(mp.stats.stopDaily));
    if (mp.stats.stopWeekly > 0) setStopWeekly(String(mp.stats.stopWeekly));
  }, [mp.stats.stopDaily, mp.stats.stopWeekly]);

  useEffect(() => {
    if (mp.todayCheckin) setCheckinDone(true);
  }, [mp.todayCheckin]);

  useEffect(() => {
    const interval = setInterval(() => setQuote(mp.getRandomQuote()), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckin = async () => {
    const isRisky = await mp.submitCheckin({
      emotional_state: checkinState,
      had_argument: hadArgument,
      recovering_loss: recoveringLoss,
      slept_well: sleptWell,
    });
    if (isRisky) {
      setShowAlert(true);
    }
    setCheckinDone(true);
  };

  const handleSaveStops = () => {
    mp.updateStops(Number(stopDaily) || 0, Number(stopWeekly) || 0);
  };

  const handleSaveDiary = async () => {
    await mp.saveDiaryEntry({
      emotional_state: diaryEmotion,
      mistakes: diaryMistakes,
      lessons: diaryLessons,
    });
    setDiaryEmotion('');
    setDiaryMistakes('');
    setDiaryLessons('');
  };

  const stopStatus = mp.isStopReached();
  const paused = mp.isPaused();
  const pauseTime = mp.getPauseTimeRemaining();
  const patents = mp.getDisciplinePatents();
  const scoreColor = mp.stats.disciplineScore >= 80 ? 'text-success' : mp.stats.disciplineScore >= 50 ? 'text-warning' : 'text-destructive';

  if (mp.loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse w-8 h-8 rounded-full bg-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <Brain className="w-6 h-6" /> Proteção Mental do Trader
        </h1>
        <p className="text-muted-foreground text-sm">Sistema inteligente anti-impulso para proteger sua banca e sua mente.</p>
      </div>

      {/* Rotating Quote */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3"
        >
          <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground italic font-medium">{quote}</p>
        </motion.div>
      </AnimatePresence>

      {/* Alerts Banner */}
      {(stopStatus.reached || paused || mp.stats.consecutiveLosses >= 3) && (
        <div className="space-y-2">
          {stopStatus.reached && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Ban className="w-8 h-8 text-destructive" />
                <div>
                  <p className="font-display font-bold text-destructive">🚫 STOP {stopStatus.type.toUpperCase()} ATINGIDO</p>
                  <p className="text-xs text-muted-foreground">Hoje seu trabalho não é recuperar perdas. Seu trabalho é proteger sua banca.</p>
                </div>
              </CardContent>
            </Card>
          )}
          {paused && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Lock className="w-8 h-8 text-destructive" />
                <div>
                  <p className="font-display font-bold text-destructive">⛔ PAUSA OBRIGATÓRIA</p>
                  <p className="text-xs text-muted-foreground">Seu cérebro pode estar operando em modo recuperação. O mercado ainda estará aqui amanhã.</p>
                  <p className="text-xs text-primary font-bold mt-1">⏱️ Tempo restante: {pauseTime}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {mp.stats.consecutiveLosses >= 3 && !paused && (
            <Card className="border-warning bg-warning/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-warning" />
                <div>
                  <p className="font-display font-bold text-warning">⚠️ {mp.stats.consecutiveLosses} LOSSES CONSECUTIVOS</p>
                  <p className="text-xs text-muted-foreground">Grandes perdas geralmente acontecem quando o trader tenta resolver tudo rapidamente. Respire, pare e reavalie.</p>
                  <Button size="sm" variant="destructive" className="mt-2 gap-1" onClick={() => setShowPauseDialog(true)}>
                    <Lock className="w-3 h-3" /> Ativar Pausa
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Discipline Score Card */}
      <Card className="border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Score de Disciplina
            </h3>
            <span className={`text-3xl font-display font-bold ${scoreColor}`}>{mp.stats.disciplineScore}</span>
          </div>
          <Progress value={mp.stats.disciplineScore} className={`h-3 ${mp.stats.disciplineScore >= 80 ? '[&>div]:bg-success' : mp.stats.disciplineScore >= 50 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'}`} />
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Total Trades</p>
              <p className="text-sm font-bold text-foreground">{mp.stats.totalTrades}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Seguiu Plano</p>
              <p className="text-sm font-bold text-success">{mp.stats.followedPlanCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Emocionais</p>
              <p className="text-sm font-bold text-destructive">{mp.stats.emotionalTrades}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-5 bg-card border border-border">
          <TabsTrigger value="checkin" className="text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Heart className="w-3 h-3" /> <span className="hidden sm:inline">Check-in</span>
          </TabsTrigger>
          <TabsTrigger value="stops" className="text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Shield className="w-3 h-3" /> <span className="hidden sm:inline">Stops</span>
          </TabsTrigger>
          <TabsTrigger value="diary" className="text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <BookOpen className="w-3 h-3" /> <span className="hidden sm:inline">Diário</span>
          </TabsTrigger>
          <TabsTrigger value="discipline" className="text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <BarChart3 className="w-3 h-3" /> <span className="hidden sm:inline">Relatório</span>
          </TabsTrigger>
          <TabsTrigger value="patents" className="text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Award className="w-3 h-3" /> <span className="hidden sm:inline">Patentes</span>
          </TabsTrigger>
        </TabsList>

        {/* CHECK-IN TAB */}
        <TabsContent value="checkin" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" /> Check-in Emocional
              </h3>
              <p className="text-xs text-muted-foreground">Responda antes de operar. Avalie honestamente seu estado emocional.</p>

              {checkinDone ? (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-sm font-bold text-success">Check-in de hoje já realizado!</p>
                  <p className="text-xs text-muted-foreground mt-1">Volte amanhã para um novo check-in.</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-xs font-bold">Como está seu estado emocional agora?</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {EMOTIONAL_STATES.map(es => (
                        <button
                          key={es.value}
                          onClick={() => setCheckinState(es.value)}
                          className={`p-2 rounded-lg border text-center text-xs transition-all ${
                            checkinState === es.value
                              ? es.risky ? 'border-destructive bg-destructive/10' : 'border-primary bg-primary/10'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <span className="text-lg block">{es.label.split(' ')[0]}</span>
                          <span className="text-[10px]">{es.label.split(' ')[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                      <input type="checkbox" checked={hadArgument} onChange={e => setHadArgument(e.target.checked)} className="rounded border-border" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Você discutiu com alguém hoje?</p>
                        <p className="text-[10px] text-muted-foreground">Conflitos afetam sua tomada de decisão</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                      <input type="checkbox" checked={recoveringLoss} onChange={e => setRecoveringLoss(e.target.checked)} className="rounded border-border" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Está tentando recuperar uma perda anterior?</p>
                        <p className="text-[10px] text-destructive">⚠️ Este é o principal motivo de quebra de banca</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                      <input type="checkbox" checked={sleptWell} onChange={e => setSleptWell(e.target.checked)} className="rounded border-border" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Dormiu bem nas últimas 24h?</p>
                        <p className="text-[10px] text-muted-foreground">Sono impacta diretamente no foco e disciplina</p>
                      </div>
                    </label>
                  </div>

                  <Button onClick={handleCheckin} className="w-full gradient-gold text-primary-foreground font-display gap-2">
                    <CheckCircle className="w-4 h-4" /> Finalizar Check-in
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STOPS TAB */}
        <TabsContent value="stops" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Configurar Stop Automático
              </h3>
              <p className="text-xs text-muted-foreground">Defina seus limites de perda. O sistema bloqueará operações quando atingir.</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Stop Diário (R$)</Label>
                  <Input type="number" value={stopDaily} onChange={e => setStopDaily(e.target.value)} placeholder="Ex: 50" className="bg-secondary" />
                  <p className="text-[10px] text-muted-foreground mt-1">Perda hoje: <span className="text-destructive font-bold">R$ {mp.stats.dailyLoss.toFixed(2)}</span></p>
                </div>
                <div>
                  <Label className="text-xs">Stop Semanal (R$)</Label>
                  <Input type="number" value={stopWeekly} onChange={e => setStopWeekly(e.target.value)} placeholder="Ex: 200" className="bg-secondary" />
                  <p className="text-[10px] text-muted-foreground mt-1">Perda semanal: <span className="text-destructive font-bold">R$ {mp.stats.weeklyLoss.toFixed(2)}</span></p>
                </div>
              </div>

              <Button onClick={handleSaveStops} className="w-full gradient-gold text-primary-foreground font-display gap-2">
                <Save className="w-4 h-4" /> Salvar Configuração
              </Button>

              {stopStatus.reached && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-3">
                  <p className="text-sm font-bold text-destructive flex items-center gap-2">
                    <Ban className="w-4 h-4" /> Stop {stopStatus.type} atingido!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Tempo restante até liberar: <span className="text-primary font-bold">24h</span></p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Forced Pause Section */}
          <Card className="border-border">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-destructive" /> Pausa Obrigatória
              </h3>
              <p className="text-xs text-muted-foreground">
                Ativada automaticamente com 3+ losses consecutivos, ou ative manualmente.
              </p>
              {paused ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                  <Lock className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm font-bold text-destructive">Pausa ativa</p>
                  <p className="text-xs text-primary font-bold">⏱️ Restante: {pauseTime}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => mp.activateForcedPause(30)} className="text-xs gap-1">
                    <Clock className="w-3 h-3" /> 30 min
                  </Button>
                  <Button variant="outline" onClick={() => mp.activateForcedPause(60)} className="text-xs gap-1">
                    <Clock className="w-3 h-3" /> 1 hora
                  </Button>
                  <Button variant="outline" onClick={() => mp.activateForcedPause(1440)} className="text-xs gap-1">
                    <Moon className="w-3 h-3" /> Até amanhã
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIARY TAB */}
        <TabsContent value="diary" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Diário Psicológico
              </h3>
              <p className="text-xs text-muted-foreground">Registre como se sentiu hoje, erros cometidos e lições aprendidas.</p>

              <div>
                <Label className="text-xs">Como estava emocionalmente hoje?</Label>
                <Textarea value={diaryEmotion} onChange={e => setDiaryEmotion(e.target.value)} placeholder="Ex: Estava ansioso após a primeira perda..." className="bg-secondary min-h-[60px]" />
              </div>
              <div>
                <Label className="text-xs">Erros cometidos</Label>
                <Textarea value={diaryMistakes} onChange={e => setDiaryMistakes(e.target.value)} placeholder="Ex: Aumentei o valor da entrada após loss..." className="bg-secondary min-h-[60px]" />
              </div>
              <div>
                <Label className="text-xs">Lições aprendidas</Label>
                <Textarea value={diaryLessons} onChange={e => setDiaryLessons(e.target.value)} placeholder="Ex: Devo respeitar o stop e não operar emocional..." className="bg-secondary min-h-[60px]" />
              </div>

              <Button onClick={handleSaveDiary} disabled={!diaryEmotion && !diaryMistakes && !diaryLessons} className="w-full gradient-gold text-primary-foreground font-display gap-2">
                <Save className="w-4 h-4" /> Salvar no Diário
              </Button>
            </CardContent>
          </Card>

          {/* Diary History */}
          {mp.diaryEntries.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <h3 className="font-display text-sm font-bold text-foreground mb-3">📖 Entradas Recentes</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {mp.diaryEntries.map(entry => (
                    <div key={entry.id} className="bg-secondary/50 rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{new Date(entry.entry_date).toLocaleDateString('pt-BR')}</Badge>
                      </div>
                      {entry.emotional_state && (
                        <div className="mb-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Emocional:</span>
                          <p className="text-xs text-foreground">{entry.emotional_state}</p>
                        </div>
                      )}
                      {entry.mistakes && (
                        <div className="mb-1">
                          <span className="text-[10px] text-destructive uppercase tracking-wider">Erros:</span>
                          <p className="text-xs text-foreground">{entry.mistakes}</p>
                        </div>
                      )}
                      {entry.lessons && (
                        <div>
                          <span className="text-[10px] text-success uppercase tracking-wider">Lições:</span>
                          <p className="text-xs text-foreground">{entry.lessons}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DISCIPLINE REPORT TAB */}
        <TabsContent value="discipline" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Relatório de Disciplina
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3 text-center border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Taxa de Plano</p>
                  <p className="text-2xl font-display font-bold text-success">
                    {mp.stats.totalTrades > 0 ? Math.round((mp.stats.followedPlanCount / mp.stats.totalTrades) * 100) : 100}%
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ops. Emocionais</p>
                  <p className="text-2xl font-display font-bold text-destructive">{mp.stats.emotionalTrades}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Losses Seguidos</p>
                  <p className="text-2xl font-display font-bold text-warning">{mp.stats.consecutiveLosses}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
                  <p className={`text-2xl font-display font-bold ${scoreColor}`}>{mp.stats.disciplineScore}</p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Perda Diária</p>
                <div className="flex items-center gap-2">
                  <Progress value={mp.stats.stopDaily > 0 ? Math.min((mp.stats.dailyLoss / mp.stats.stopDaily) * 100, 100) : 0} className="flex-1 h-2 [&>div]:bg-destructive" />
                  <span className="text-xs text-destructive font-bold">R$ {mp.stats.dailyLoss.toFixed(2)}</span>
                  {mp.stats.stopDaily > 0 && <span className="text-xs text-muted-foreground">/ R$ {mp.stats.stopDaily.toFixed(2)}</span>}
                </div>

                <p className="text-xs text-muted-foreground mb-2 mt-3">Perda Semanal</p>
                <div className="flex items-center gap-2">
                  <Progress value={mp.stats.stopWeekly > 0 ? Math.min((mp.stats.weeklyLoss / mp.stats.stopWeekly) * 100, 100) : 0} className="flex-1 h-2 [&>div]:bg-destructive" />
                  <span className="text-xs text-destructive font-bold">R$ {mp.stats.weeklyLoss.toFixed(2)}</span>
                  {mp.stats.stopWeekly > 0 && <span className="text-xs text-muted-foreground">/ R$ {mp.stats.stopWeekly.toFixed(2)}</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Protection */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2">
                💡 Proteção de Lucro
              </h3>
              <p className="text-xs text-muted-foreground mt-2">
                Quando sua banca crescer acima de uma meta significativa, considere sacar parte do lucro ou reduzir o risco por operação. Proteger o que conquistou é tão importante quanto lucrar.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PATENTS TAB */}
        <TabsContent value="patents" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Patentes de Disciplina
              </h3>
              <p className="text-xs text-muted-foreground">Conquiste patentes baseadas em disciplina, não apenas lucro.</p>

              <div className="space-y-3">
                {patents.map(p => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      p.unlocked
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-secondary/30 opacity-60'
                    }`}
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <div className="flex-1">
                      <p className="font-display font-bold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    {p.unlocked ? (
                      <Badge className="bg-success/20 text-success border-success/30">✅ Conquistado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">🔒 Bloqueado</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Emotional Alert Dialog */}
      <Dialog open={showAlert} onOpenChange={setShowAlert}>
        <DialogContent className="bg-card border-destructive/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> ALERTA EMOCIONAL
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Seu estado emocional atual pode comprometer sua tomada de decisão.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-foreground font-medium">
              Considere pausar e voltar ao mercado mais tarde. Operar emocionalmente é o principal motivo de quebra de banca.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAlert(false)} className="flex-1">
              Vou operar mesmo assim
            </Button>
            <Button variant="destructive" onClick={() => { setShowAlert(false); mp.activateForcedPause(60); }} className="flex-1 gap-1">
              <Lock className="w-3 h-3" /> Pausar 1h
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Ativar Pausa Obrigatória</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Escolha quanto tempo deseja pausar suas operações:</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => { mp.activateForcedPause(30); setShowPauseDialog(false); }} className="gap-1">
              <Clock className="w-3 h-3" /> 30 min
            </Button>
            <Button variant="outline" onClick={() => { mp.activateForcedPause(60); setShowPauseDialog(false); }} className="gap-1">
              <Clock className="w-3 h-3" /> 1 hora
            </Button>
            <Button variant="outline" onClick={() => { mp.activateForcedPause(1440); setShowPauseDialog(false); }} className="gap-1">
              <Moon className="w-3 h-3" /> Amanhã
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
