import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp } from 'lucide-react';

interface CandleData {
  index: number;
  open: number;
  close: number;
  color: string;
  label: string;
}

const CandlestickChart = ({ candles }: { candles: CandleData[] }) => {
  if (candles.length === 0) return null;

  const allValues = candles.flatMap(c => [c.open, c.close]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 10;

  const padding = 30;
  const candleWidth = 12;
  const gap = 6;
  const chartWidth = Math.max(candles.length * (candleWidth + gap) + padding * 2, 300);
  const chartHeight = 280;
  const plotHeight = chartHeight - padding * 2;

  const priceToY = (price: number) => {
    return padding + plotHeight - ((price - minVal) / range) * plotHeight;
  };

  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines }, (_, i) => minVal + (range / (gridLines - 1)) * i);

  return (
    <div className="w-full h-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="min-w-full">
        {gridValues.map((val, i) => (
          <g key={i}>
            <line x1={padding} y1={priceToY(val)} x2={chartWidth - 10} y2={priceToY(val)} stroke="hsl(0, 0%, 16%)" strokeDasharray="3 3" />
            <text x={5} y={priceToY(val) + 4} fill="hsl(0, 0%, 55%)" fontSize={9}>{val.toFixed(0)}</text>
          </g>
        ))}
        {minVal <= 0 && maxVal >= 0 && (
          <line x1={padding} y1={priceToY(0)} x2={chartWidth - 10} y2={priceToY(0)} stroke="hsl(0, 0%, 30%)" strokeWidth={1} />
        )}
        {candles.map((c, i) => {
          const x = padding + i * (candleWidth + gap);
          const yOpen = priceToY(c.open);
          const yClose = priceToY(c.close);
          const yTop = Math.min(yOpen, yClose);
          const yBottom = Math.max(yOpen, yClose);
          const bodyHeight = Math.max(yBottom - yTop, 2);
          const fillColor = c.color === 'green' ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)';
          const wickColor = c.color === 'green' ? 'hsl(142, 76%, 46%)' : 'hsl(0, 84%, 70%)';
          const cx = x + candleWidth / 2;
          return (
            <g key={i}>
              <line x1={cx} y1={yTop - 3} x2={cx} y2={yBottom + 3} stroke={wickColor} strokeWidth={1.5} />
              <rect x={x} y={yTop} width={candleWidth} height={bodyHeight} fill={fillColor} rx={1} stroke={wickColor} strokeWidth={0.5} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Evolution = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<CandleData[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        const CANDLE_VALUE = 10;
        let cumPrice = 0;
        const candleData: CandleData[] = [];
        data.forEach((t) => {
          const profit = Number(t.profit);
          const numCandles = Math.max(1, Math.round(Math.abs(profit) / CANDLE_VALUE));
          const direction = profit >= 0 ? 1 : -1;
          const color = profit >= 0 ? 'green' : 'red';
          for (let i = 0; i < numCandles; i++) {
            const open = cumPrice;
            cumPrice += direction * CANDLE_VALUE;
            candleData.push({
              index: candleData.length,
              open,
              close: cumPrice,
              color,
              label: `${t.pair_name} (${t.trade_date})`,
            });
          }
        });
        setChartData(candleData);
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Evolução
        </h1>
        <p className="text-muted-foreground">Acompanhe seu progresso ao longo do tempo</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-sm font-bold text-foreground mb-4">Evolução — Candles (R$10 cada)</h3>
        <div className="h-72">
          {chartData.length > 0 ? (
            <CandlestickChart candles={chartData} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Registre operações para ver sua evolução
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} /> Win (Verde)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} /> Loss (Vermelho)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5" style={{ backgroundColor: 'hsl(0, 0%, 30%)' }} /> Cada candle = R$10
          </span>
        </div>
      </div>
    </div>
  );
};

export default Evolution;
