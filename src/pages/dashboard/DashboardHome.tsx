import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Wallet, TrendingUp, CheckCircle, XCircle, Trophy, Shield, ChevronRight } from 'lucide-react';
import { getRankForProfit, getNextRankForProfit, PROFIT_TROPHIES } from '@/lib/traderRanks';

interface CandleData { index: number; open: number; close: number; color: string; }

const MiniCandlestickChart = ({ candles }: { candles: CandleData[] }) => {
  if (candles.length === 0) return null;
  const allValues = candles.flatMap(c => [c.open, c.close]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 10;
  const padding = 25; const candleWidth = 8; const gap = 3;
  const chartWidth = Math.max(candles.length * (candleWidth + gap) + padding * 2, 280);
  const chartHeight = 180; const plotHeight = chartHeight - padding * 2;
  const priceToY = (price: number) => padding + plotHeight - ((price - minVal) / range) * plotHeight;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="min-w-full">
        {minVal <= 0 && maxVal >= 0 && (
          <line x1={padding} y1={priceToY(0)} x2={chartWidth - 5} y2={priceToY(0)} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} strokeDasharray="4 4" />
        )}
        {candles.map((c, i) => {
          const x = padding + i * (candleWidth + gap);
          const yOpen = priceToY(c.open); const yClose = priceToY(c.close);
          const yTop = Math.min(yOpen, yClose); const yBottom = Math.max(yOpen, yClose);
          const bodyHeight = Math.max(yBottom - yTop, 2);
          const fillColor = c.color === 'green' ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
          const cx = x + candleWidth / 2;
          return (
            <g key={i}>
              <line x1={cx} y1={yTop - 2} x2={cx} y2={yBottom + 2} stroke={fillColor} strokeWidth={1} />
              <rect x={x} y={yTop} width={candleWidth} height={bodyHeight} fill={fillColor} rx={1} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const DashboardHome = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isEn = i18n.language === 'en';

  const [balance, setBalance] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [chartData, setChartData] = useState<CandleData[]>([]);

  // Trade form
  const [pair, setPair] = useState('');
  const [payout, setPayout] = useState('80');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [profileRes, tradesRes] = await Promise.all([
      supabase.from('profiles').select('balance, total_profit').eq('user_id', user.id).single(),
      supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    ]);
    if (profileRes.data) {
      setBalance(Number(profileRes.data.balance) || 0);
      setTotalProfit(Number(profileRes.data.total_profit) || 0);
    }
    if (tradesRes.data) {
      let w = 0, l = 0;
      tradesRes.data.forEach(t => { if (t.result === 'win') w++; else l++; });
      setWins(w); setLosses(l);

      // Build candles
      const CANDLE_VALUE = 30;
      let cumPrice = 0;
      const cd: CandleData[] = [];
      tradesRes.data.forEach(t => {
        const profit = Number(t.profit);
        const numCandles = Math.max(1, Math.round(Math.abs(profit) / CANDLE_VALUE));
        const dir = profit >= 0 ? 1 : -1;
        for (let i = 0; i < numCandles; i++) {
          const open = cumPrice;
          cumPrice += dir * CANDLE_VALUE;
          cd.push({ index: cd.length, open, close: cumPrice, color: profit >= 0 ? 'green' : 'red' });
        }
      });
      setChartData(cd);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Listen for balance updates from management
  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener('balance-updated', handler);
    return () => window.removeEventListener('balance-updated', handler);
  }, [loadData]);

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const lossRate = totalTrades > 0 ? ((losses / totalTrades) * 100).toFixed(1) : '0.0';

  const handleTrade = async (result: 'win' | 'loss') => {
    if (!pair.trim() || !amount || !user) return;
    const amtNum = Number(amount);
    const payNum = Number(payout) / 100;
    if (amtNum <= 0 || amtNum > balance) {
      toast.error(t('home.invalidAmount'));
      return;
    }
    setSubmitting(true);
    const profit = result === 'win' ? +(amtNum * payNum).toFixed(2) : -amtNum;
    const newBalance = +(balance + profit).toFixed(2);
    const newTotalProfit = +(totalProfit + profit).toFixed(2);

    const [tradeRes, profileRes] = await Promise.all([
      supabase.from('trades').insert({
        user_id: user.id, pair_name: pair.trim(), payout: Number(payout),
        result, amount: amtNum, profit, management_mode: 'quick',
      }),
      supabase.from('profiles').update({ balance: newBalance, total_profit: newTotalProfit }).eq('user_id', user.id),
    ]);

    if (tradeRes.error || profileRes.error) {
      toast.error(t('common.error'));
    } else {
      setBalance(newBalance);
      setTotalProfit(newTotalProfit);
      if (result === 'win') setWins(w => w + 1); else setLosses(l => l + 1);
      toast.success(result === 'win' ? `✅ WIN +R$ ${(amtNum * payNum).toFixed(2)}` : `❌ LOSS -R$ ${amtNum.toFixed(2)}`);
      setPair(''); setAmount('');
      window.dispatchEvent(new Event('balance-updated'));
      loadData(); // refresh chart
    }
    setSubmitting(false);
  };

  const rank = getRankForProfit(totalProfit);
  const nextRank = getNextRankForProfit(totalProfit);
  const rankProgress = nextRank ? Math.min(100, (totalProfit / nextRank.minProfit) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{t('home.balance')}</span>
            </div>
            <p className="text-lg sm:text-xl font-display font-bold text-foreground">
              R$ {balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{t('home.profit')}</span>
            </div>
            <p className={`text-lg sm:text-xl font-display font-bold ${totalProfit >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {totalProfit.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 win-text" />
              <span className="text-xs text-muted-foreground font-medium">Win %</span>
            </div>
            <p className="text-lg sm:text-xl font-display font-bold win-text">{winRate}%</p>
            <p className="text-xs text-muted-foreground">{wins} wins</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 loss-text" />
              <span className="text-xs text-muted-foreground font-medium">Loss %</span>
            </div>
            <p className="text-lg sm:text-xl font-display font-bold loss-text">{lossRate}%</p>
            <p className="text-xs text-muted-foreground">{losses} losses</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Trade Form */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-display text-sm font-bold text-primary mb-4">{t('home.quickTrade')}</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <Label className="text-xs">{t('home.pair')}</Label>
              <Input value={pair} onChange={e => setPair(e.target.value)} placeholder="EUR/USD" className="bg-secondary" />
            </div>
            <div>
              <Label className="text-xs">Payout (%)</Label>
              <Input type="number" value={payout} onChange={e => setPayout(e.target.value)} placeholder="80" className="bg-secondary" />
            </div>
            <div>
              <Label className="text-xs">{t('home.entryValue')}</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10.00" className="bg-secondary" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => handleTrade('win')}
              disabled={!pair.trim() || !amount || submitting}
              className="flex-1 font-display gap-2 bg-success/20 text-success hover:bg-success/30 border border-success/30"
            >
              <CheckCircle className="w-4 h-4" /> WIN
            </Button>
            <Button
              onClick={() => handleTrade('loss')}
              disabled={!pair.trim() || !amount || submitting}
              className="flex-1 font-display gap-2 bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30"
            >
              <XCircle className="w-4 h-4" /> LOSS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Evolution Chart */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> {t('home.evolution')}
          </h3>
          <div className="h-48">
            {chartData.length > 0 ? <MiniCandlestickChart candles={chartData} /> : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">{t('home.noTrades')}</div>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-success" /> Win</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-destructive" /> Loss</span>
          </div>
        </CardContent>
      </Card>

      {/* Patent System */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> {t('home.patent')}
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: rank.color + '22', border: `2px solid ${rank.color}` }}>
              {rank.emoji}
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-foreground" style={{ color: rank.color }}>
                {isEn ? rank.nameEn : rank.name}
              </p>
              {nextRank && (
                <>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {t('home.nextRank')}: {isEn ? nextRank.nameEn : nextRank.name} {nextRank.emoji}
                    <ChevronRight className="w-3 h-3" />
                    R$ {nextRank.minProfit.toLocaleString()}
                  </p>
                  <Progress value={rankProgress} className="h-2 mt-2" />
                </>
              )}
              {!nextRank && <p className="text-xs text-primary font-bold">{t('home.maxRank')}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trophies */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> {t('home.trophies')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROFIT_TROPHIES.map((trophy) => {
              const unlocked = totalProfit >= trophy.minProfit;
              return (
                <div
                  key={trophy.minProfit}
                  className={`rounded-lg border p-4 text-center transition-all ${unlocked ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/30 opacity-50'}`}
                >
                  <div className="text-3xl mb-2">{trophy.emoji}</div>
                  <p className="font-display text-xs font-bold text-foreground">
                    {isEn ? trophy.nameEn : trophy.name}
                  </p>
                  <p className="text-xs text-muted-foreground">R$ {trophy.minProfit.toLocaleString()}</p>
                  {unlocked && <span className="text-xs win-text font-bold">✓ {t('home.unlocked')}</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
