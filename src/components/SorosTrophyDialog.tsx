import { useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, MessageCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lucro: number;
  tentativasGanhas: number;
}

function generateTrophyCanvas(lucro: number, tentativasGanhas: number): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1280);
    grad.addColorStop(0, '#0a0a0a');
    grad.addColorStop(0.5, '#1a1205');
    grad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 1280);

    // Gold border
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 660, 1220);

    // Trophy emoji
    ctx.font = '120px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', 360, 380);

    // Title
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#d4a017';
    ctx.fillText('SOROS x4', 360, 480);

    // Subtitle
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Ciclo Concluído!', 360, 530);

    // Profit
    ctx.font = 'bold 56px sans-serif';
    const isPositive = lucro >= 0;
    ctx.fillStyle = isPositive ? '#22c55e' : '#ef4444';
    ctx.fillText(`R$ ${lucro.toFixed(2)}`, 360, 660);

    // Label
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('Lucro acumulado', 360, 710);

    // Stats
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#d4a017';
    ctx.fillText(`${tentativasGanhas} ciclos ganhos`, 360, 820);

    // Divider
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(160, 900);
    ctx.lineTo(560, 900);
    ctx.stroke();

    // Branding
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#d4a017';
    ctx.fillText('TECHNICAL GIRLAN', 360, 960);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText('www.girlanbarreto.com.br', 360, 990);

    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export default function SorosTrophyDialog({ open, onOpenChange, lucro, tentativasGanhas }: Props) {
  const handleSave = useCallback(async () => {
    const blob = await generateTrophyCanvas(lucro, tentativasGanhas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soros-trophy-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lucro, tentativasGanhas]);

  const handleShare = useCallback(async () => {
    try {
      const blob = await generateTrophyCanvas(lucro, tentativasGanhas);
      const file = new File([blob], 'soros-trophy.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Soros x4 - Ciclo Concluído!',
          text: `🏆 Completei mais um ciclo Soros x4! Lucro: R$ ${lucro.toFixed(2)} | Technical Girlan`,
          files: [file],
        });
        return;
      }
    } catch {}
    // Fallback to download
    handleSave();
  }, [lucro, tentativasGanhas, handleSave]);

  const handleWhatsApp = useCallback(async () => {
    const text = encodeURIComponent(
      `🏆 *Soros x4 Concluído!*\n\nLucro: R$ ${lucro.toFixed(2)}\nCiclos ganhos: ${tentativasGanhas}\n\n📈 Technical Girlan\nhttps://girlanbarreto.lovable.app`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [lucro, tentativasGanhas]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-primary text-xl">
            🏆 Parabéns!
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <div className="text-6xl">🏆</div>

          <div>
            <p className="text-sm text-muted-foreground">Soros x4 — Ciclo Concluído</p>
            <p className={`text-3xl font-display font-bold mt-2 ${lucro >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {lucro.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{tentativasGanhas} ciclos ganhos</p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-primary/30 text-primary hover:bg-primary/10 gap-1 text-[10px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              Story
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsApp}
              className="border-primary/30 text-primary hover:bg-primary/10 gap-1 text-[10px]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="border-primary/30 text-primary hover:bg-primary/10 gap-1 text-[10px]"
            >
              <Download className="w-3.5 h-3.5" />
              Salvar
            </Button>
          </div>

          <p className="text-[9px] text-muted-foreground/50">www.girlanbarreto.com.br</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
