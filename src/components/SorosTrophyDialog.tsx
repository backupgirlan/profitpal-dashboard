import { useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, MessageCircle } from 'lucide-react';
import { getRankForCycles, getNextRank } from '@/lib/sorosRanks';

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

    const rank = getRankForCycles(tentativasGanhas);
    const nextRank = getNextRank(tentativasGanhas);

    // Background gradient with rank colors
    const grad = ctx.createLinearGradient(0, 0, 0, 1280);
    grad.addColorStop(0, rank.bgGradient[0]);
    grad.addColorStop(0.3, rank.bgGradient[1]);
    grad.addColorStop(0.7, rank.bgGradient[0]);
    grad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 1280);

    // Decorative diagonal lines
    ctx.strokeStyle = rank.color + '15';
    ctx.lineWidth = 2;
    for (let i = -1280; i < 720; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 1280, 1280);
      ctx.stroke();
    }

    // Gold border with glow effect
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = rank.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 660, 1220);
    ctx.shadowBlur = 0;

    // Inner border
    ctx.strokeStyle = rank.color + '40';
    ctx.lineWidth = 1;
    ctx.strokeRect(45, 45, 630, 1190);

    // Top badge area
    ctx.fillStyle = rank.color + '20';
    ctx.beginPath();
    ctx.moveTo(260, 80);
    ctx.lineTo(460, 80);
    ctx.lineTo(480, 110);
    ctx.lineTo(240, 110);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = rank.color;
    ctx.textAlign = 'center';
    ctx.fillText('SOROS x4', 360, 102);

    // Large rank emoji
    ctx.font = '140px serif';
    ctx.fillText(rank.emoji, 360, 320);

    // Trophy emoji below
    ctx.font = '60px serif';
    ctx.fillText('🏆', 360, 400);

    // Rank name with glow
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 30;
    ctx.font = 'bold 52px sans-serif';
    ctx.fillStyle = rank.color;
    ctx.fillText(rank.name.toUpperCase(), 360, 490);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Patente Conquistada!', 360, 530);

    // Decorative line
    ctx.strokeStyle = rank.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 570);
    ctx.lineTo(520, 570);
    ctx.stroke();

    // Profit section
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('Lucro do Ciclo', 360, 620);

    ctx.font = 'bold 60px sans-serif';
    ctx.shadowColor = lucro >= 0 ? '#22c55e' : '#ef4444';
    ctx.shadowBlur = 15;
    ctx.fillStyle = lucro >= 0 ? '#22c55e' : '#ef4444';
    ctx.fillText(`R$ ${lucro.toFixed(2)}`, 360, 690);
    ctx.shadowBlur = 0;

    // Stats box
    ctx.fillStyle = '#ffffff08';
    ctx.fillRect(120, 730, 480, 100);
    ctx.strokeStyle = rank.color + '30';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 730, 480, 100);

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('CICLOS CONCLUÍDOS', 360, 770);

    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = rank.color;
    ctx.fillText(`${tentativasGanhas}`, 360, 815);

    // Next rank info
    if (nextRank) {
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(`Próxima patente: ${nextRank.emoji} ${nextRank.name} (${nextRank.minCycles} ciclos)`, 360, 880);
    }

    // Decorative line
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(160, 930);
    ctx.lineTo(560, 930);
    ctx.stroke();

    // Branding
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = rank.color;
    ctx.fillText('TECHNICAL GIRLAN', 360, 980);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText('www.girlanbarreto.com.br', 360, 1010);

    // Bottom decorative skulls for high ranks
    if (tentativasGanhas >= 50) {
      ctx.font = '30px serif';
      ctx.fillText('⚔️💀⚔️', 360, 1080);
    } else if (tentativasGanhas >= 20) {
      ctx.font = '30px serif';
      ctx.fillText('⭐⭐⭐', 360, 1080);
    } else if (tentativasGanhas >= 5) {
      ctx.font = '30px serif';
      ctx.fillText('🔥🔥🔥', 360, 1080);
    }

    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export default function SorosTrophyDialog({ open, onOpenChange, lucro, tentativasGanhas }: Props) {
  const rank = getRankForCycles(tentativasGanhas);
  const nextRank = getNextRank(tentativasGanhas);

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
          title: `Soros x4 — ${rank.name}!`,
          text: `${rank.emoji} Patente: ${rank.name}! Lucro: R$ ${lucro.toFixed(2)} | ${tentativasGanhas} ciclos | Technical Girlan`,
          files: [file],
        });
        return;
      }
    } catch {}
    handleSave();
  }, [lucro, tentativasGanhas, handleSave, rank]);

  const handleWhatsApp = useCallback(async () => {
    const text = encodeURIComponent(
      `${rank.emoji} *Soros x4 — Patente: ${rank.name}!*\n\nLucro: R$ ${lucro.toFixed(2)}\nCiclos concluídos: ${tentativasGanhas}\n\n📈 Technical Girlan\nhttps://girlanbarreto.lovable.app`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [lucro, tentativasGanhas, rank]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-primary text-xl">
            {rank.emoji} Patente Conquistada!
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <div className="text-7xl">{rank.emoji}</div>

          <div
            className="rounded-lg p-4 border"
            style={{
              background: `linear-gradient(135deg, ${rank.bgGradient[0]}, ${rank.bgGradient[1]})`,
              borderColor: rank.color + '40',
            }}
          >
            <p className="text-2xl font-display font-bold" style={{ color: rank.color }}>
              {rank.name.toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Soros x4 — Ciclo Concluído</p>
          </div>

          <div>
            <p className={`text-3xl font-display font-bold ${lucro >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {lucro.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{tentativasGanhas} ciclos concluídos</p>
          </div>

          {nextRank && (
            <p className="text-[10px] text-muted-foreground">
              Próxima patente: {nextRank.emoji} {nextRank.name} ({nextRank.minCycles} ciclos)
            </p>
          )}

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
