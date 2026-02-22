import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp } from 'lucide-react';

const TraderCalculator = () => {
  const [balance, setBalance] = useState(100);
  const [entryPercentage, setEntryPercentage] = useState(2);
  const [payout, setPayout] = useState(80);
  const [martingaleLevel, setMartingaleLevel] = useState(1);

  const entryValue = balance * (entryPercentage / 100);

  // Soros: reinveste o lucro
  const sorosLevels = [entryValue];
  for (let i = 1; i <= 2; i++) {
    const prev = sorosLevels[i - 1];
    sorosLevels.push(prev + prev * (payout / 100));
  }

  // Martingale: dobra a entrada para cobrir perdas anteriores
  const martingaleLevels: { entry: number; totalInvested: number; profit: number }[] = [];
  let totalInvested = 0;
  let currentEntry = entryValue;
  for (let i = 0; i <= martingaleLevel; i++) {
    totalInvested += currentEntry;
    const profit = currentEntry * (payout / 100) - totalInvested + currentEntry;
    martingaleLevels.push({ entry: currentEntry, totalInvested, profit });
    currentEntry = (totalInvested + entryValue * (payout / 100)) / (payout / 100);
  }

  // Profit calculation
  const profitWin = entryValue * (payout / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <Calculator className="w-6 h-6" /> Calculadora do Trader
        </h1>
        <p className="text-muted-foreground">Calcule Soros, Martingale, entradas e lucros</p>
      </div>

      {/* Inputs */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Parâmetros</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Banca (R$)</Label>
            <Input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} className="bg-secondary" />
          </div>
          <div>
            <Label>Entrada (%)</Label>
            <Input type="number" value={entryPercentage} onChange={(e) => setEntryPercentage(Number(e.target.value))} min={0.1} max={100} step={0.5} className="bg-secondary" />
          </div>
          <div>
            <Label>Payout (%)</Label>
            <Input type="number" value={payout} onChange={(e) => setPayout(Number(e.target.value))} className="bg-secondary" />
          </div>
          <div>
            <Label>Níveis Martingale</Label>
            <Input type="number" value={martingaleLevel} onChange={(e) => setMartingaleLevel(Math.min(5, Math.max(1, Number(e.target.value))))} min={1} max={5} className="bg-secondary" />
          </div>
        </div>
      </div>

      {/* Entry & Profit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Valor de Entrada</p>
          <p className="text-2xl font-display font-bold text-primary text-glow">R$ {entryValue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{entryPercentage}% de R$ {balance.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Payout</p>
          <p className="text-2xl font-display font-bold text-foreground">{payout}%</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Lucro por Win</p>
          <p className="text-2xl font-display font-bold win-text">+ R$ {profitWin.toFixed(2)}</p>
        </div>
      </div>

      {/* Soros */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" /> Sistema Soros (até nível 2)
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          {sorosLevels.map((val, i) => (
            <div key={i} className="bg-secondary rounded-lg p-4">
              <p className="text-muted-foreground text-xs mb-1">Nível {i}</p>
              <p className="font-display font-bold text-foreground">R$ {val.toFixed(2)}</p>
              {i > 0 && <p className="text-xs win-text mt-1">Lucro: R$ {(val * payout / 100).toFixed(2)}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Martingale */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-sm font-bold text-destructive flex items-center gap-2 mb-4">
          ⚠️ Martingale (até nível {martingaleLevel})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left p-2">Nível</th>
                <th className="text-right p-2">Entrada</th>
                <th className="text-right p-2">Total Investido</th>
                <th className="text-right p-2">Lucro se Win</th>
              </tr>
            </thead>
            <tbody>
              {martingaleLevels.map((m, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="p-2 font-display font-bold text-foreground">Nível {i}</td>
                  <td className="p-2 text-right text-foreground">R$ {m.entry.toFixed(2)}</td>
                  <td className="p-2 text-right text-muted-foreground">R$ {m.totalInvested.toFixed(2)}</td>
                  <td className={`p-2 text-right font-bold ${m.profit >= 0 ? 'win-text' : 'loss-text'}`}>R$ {m.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TraderCalculator;
