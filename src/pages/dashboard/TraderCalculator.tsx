import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TraderCalculator = () => {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(100);
  const [entryPercentage, setEntryPercentage] = useState(2);
  const [payout, setPayout] = useState(80);
  const [martingaleLevel, setMartingaleLevel] = useState(1);

  const entryValue = balance * (entryPercentage / 100);
  const sorosLevels = [entryValue];
  for (let i = 1; i <= 2; i++) {
    const prev = sorosLevels[i - 1];
    sorosLevels.push(prev + prev * (payout / 100));
  }

  const martingaleLevels: { entry: number; totalInvested: number; profit: number }[] = [];
  let totalInvested = 0;
  let currentEntry = entryValue;
  for (let i = 0; i <= martingaleLevel; i++) {
    totalInvested += currentEntry;
    const profit = currentEntry * (payout / 100) - totalInvested + currentEntry;
    martingaleLevels.push({ entry: currentEntry, totalInvested, profit });
    currentEntry = (totalInvested + entryValue * (payout / 100)) / (payout / 100);
  }

  const profitWin = entryValue * (payout / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <Calculator className="w-6 h-6" /> {t('calculator.title')}
        </h1>
        <p className="text-muted-foreground">{t('calculator.subtitle')}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">{t('calculator.parameters')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label>{t('calculator.balance')}</Label><Input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} className="bg-secondary" /></div>
          <div><Label>{t('calculator.entry')}</Label><Input type="number" value={entryPercentage} onChange={(e) => setEntryPercentage(Number(e.target.value))} min={0.1} max={100} step={0.5} className="bg-secondary" /></div>
          <div><Label>{t('calculator.payout')}</Label><Input type="number" value={payout} onChange={(e) => setPayout(Number(e.target.value))} className="bg-secondary" /></div>
          <div><Label>{t('calculator.martingaleLevels')}</Label><Input type="number" value={martingaleLevel} onChange={(e) => setMartingaleLevel(Math.min(5, Math.max(1, Number(e.target.value))))} min={1} max={5} className="bg-secondary" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">{t('calculator.entryValue')}</p>
          <p className="text-2xl font-display font-bold text-primary text-glow">R$ {entryValue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{entryPercentage}% de R$ {balance.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">{t('calculator.payout')}</p>
          <p className="text-2xl font-display font-bold text-foreground">{payout}%</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">{t('calculator.profitPerWin')}</p>
          <p className="text-2xl font-display font-bold win-text">+ R$ {profitWin.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" /> {t('calculator.sorosSystem')}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          {sorosLevels.map((val, i) => (
            <div key={i} className="bg-secondary rounded-lg p-4">
              <p className="text-muted-foreground text-xs mb-1">{t('calculator.level')} {i}</p>
              <p className="font-display font-bold text-foreground">R$ {val.toFixed(2)}</p>
              {i > 0 && <p className="text-xs win-text mt-1">{t('calculator.profit')}: R$ {(val * payout / 100).toFixed(2)}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-sm font-bold text-destructive flex items-center gap-2 mb-4">
          ⚠️ {t('calculator.martingaleTitle', { level: martingaleLevel })}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left p-2">{t('calculator.level')}</th>
                <th className="text-right p-2">{t('calculator.entryCol')}</th>
                <th className="text-right p-2">{t('calculator.totalInvested')}</th>
                <th className="text-right p-2">{t('calculator.profitIfWin')}</th>
              </tr>
            </thead>
            <tbody>
              {martingaleLevels.map((m, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="p-2 font-display font-bold text-foreground">{t('calculator.level')} {i}</td>
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
