import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  open: boolean;
  resultado: 'win' | 'loss';
  onConfirm: (pairName: string, payout: number) => void;
  onCancel: () => void;
}

export default function TradeConfirmDialog({ open, resultado, onConfirm, onCancel }: Props) {
  const [pairName, setPairName] = useState('');
  const [payout, setPayout] = useState('80');

  const handleConfirm = () => {
    if (!pairName.trim()) return;
    onConfirm(pairName.trim(), Number(payout));
    setPairName('');
    setPayout('80');
  };

  const isWin = resultado === 'win';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 font-display ${isWin ? 'win-text' : 'text-destructive'}`}>
            {isWin ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            Confirmar {isWin ? 'WIN' : 'LOSS'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informe o par e o payout da operação
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Par (ex: EUR/USD)</Label>
            <Input
              value={pairName}
              onChange={e => setPairName(e.target.value)}
              placeholder="EUR/USD"
              className="bg-secondary"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-xs">Payout (%)</Label>
            <Input
              type="number"
              value={payout}
              onChange={e => setPayout(e.target.value)}
              placeholder="80"
              className="bg-secondary"
            />
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!pairName.trim()}
            className={`w-full font-display gap-2 ${isWin ? 'bg-success/20 text-success hover:bg-success/30 border border-success/30' : 'bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30'}`}
          >
            {isWin ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            Confirmar {isWin ? 'WIN' : 'LOSS'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
