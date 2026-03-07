import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { TraderRank } from '@/lib/traderRanks';

interface PatentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rank: TraderRank;
  totalProfit: number;
  displayName: string;
  daysTrading: number;
  isEn: boolean;
}

function generatePatentCanvas(rank: TraderRank, totalProfit: number, displayName: string, daysTrading: number, isEn: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d')!;

  // Rich gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, '#0a0014');
  bgGrad.addColorStop(0.25, '#0d1b2a');
  bgGrad.addColorStop(0.5, '#1b0a2e');
  bgGrad.addColorStop(0.75, '#0d1b2a');
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Particle-like dots
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 1080;
    const y = Math.random() * 1920;
    const r = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = rank.color + '22';
    ctx.fill();
  }

  // Ornate double border
  ctx.strokeStyle = rank.color + '88';
  ctx.lineWidth = 3;
  ctx.strokeRect(25, 25, 1030, 1870);
  ctx.strokeStyle = rank.color + '33';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 1000, 1840);

  // Corner decorations
  const cornerSize = 40;
  [
    [45, 45], [1035, 45], [45, 1875], [1035, 1875]
  ].forEach(([cx, cy], i) => {
    ctx.strokeStyle = rank.color + '66';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const dx = i % 2 === 0 ? 1 : -1;
    const dy = i < 2 ? 1 : -1;
    ctx.moveTo(cx, cy + dy * cornerSize);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * cornerSize, cy);
    ctx.stroke();
  });

  // Top: "TECHNICAL" brand with glow
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TECHNICAL', 540, 140);
  ctx.shadowBlur = 0;

  // Gradient separator line
  const lineGrad = ctx.createLinearGradient(150, 0, 930, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.2, rank.color + '88');
  lineGrad.addColorStop(0.5, rank.color);
  lineGrad.addColorStop(0.8, rank.color + '88');
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 170);
  ctx.lineTo(930, 170);
  ctx.stroke();

  // User name
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 15;
  ctx.fillText(displayName.toUpperCase(), 540, 230);
  ctx.shadowBlur = 0;

  // Large hexagon-like circle with multi-layer glow
  const centerY = 560;

  // Outer glow rings
  for (let i = 3; i >= 0; i--) {
    ctx.beginPath();
    ctx.arc(540, centerY, 180 + i * 15, 0, Math.PI * 2);
    ctx.strokeStyle = rank.color + (10 + i * 5).toString(16).padStart(2, '0');
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Main circle with gradient fill
  const circGrad = ctx.createRadialGradient(540, centerY, 0, 540, centerY, 170);
  circGrad.addColorStop(0, rank.color + '30');
  circGrad.addColorStop(0.7, rank.color + '10');
  circGrad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(540, centerY, 170, 0, Math.PI * 2);
  ctx.fillStyle = circGrad;
  ctx.fill();
  ctx.strokeStyle = rank.color;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.arc(540, centerY, 145, 0, Math.PI * 2);
  ctx.fillStyle = rank.color + '15';
  ctx.fill();
  ctx.strokeStyle = rank.color + '66';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Emoji with shadow
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 40;
  ctx.font = '150px Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(rank.emoji, 540, centerY);
  ctx.textBaseline = 'alphabetic';
  ctx.shadowBlur = 0;

  // Rank name with heavy glow
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 30;
  ctx.fillText((isEn ? rank.nameEn : rank.name).toUpperCase(), 540, 800);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = '#9ca3af';
  ctx.font = '30px Arial, sans-serif';
  ctx.fillText(isEn ? '★ PATENT ACHIEVED ★' : '★ PATENTE CONQUISTADA ★', 540, 860);

  // Stats section with gradient backgrounds
  const statsY = 960;

  // Helper for rounded rects
  const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Profit box
  const boxGrad1 = ctx.createLinearGradient(100, statsY, 980, statsY);
  boxGrad1.addColorStop(0, '#0a1628');
  boxGrad1.addColorStop(1, '#0d1f3c');
  drawRoundRect(100, statsY, 880, 130, 20);
  ctx.fillStyle = boxGrad1;
  ctx.fill();
  ctx.strokeStyle = '#22c55e44';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText(isEn ? '💰 TOTAL PROFIT' : '💰 LUCRO TOTAL', 540, statsY + 45);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 20;
  ctx.fillText(`R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 540, statsY + 105);
  ctx.shadowBlur = 0;

  // Days box
  const boxGrad2 = ctx.createLinearGradient(100, statsY + 160, 980, statsY + 160);
  boxGrad2.addColorStop(0, '#1a0f28');
  boxGrad2.addColorStop(1, '#0d1f3c');
  drawRoundRect(100, statsY + 160, 880, 130, 20);
  ctx.fillStyle = boxGrad2;
  ctx.fill();
  ctx.strokeStyle = '#f59e0b44';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText(isEn ? '📅 DAYS TRADING' : '📅 DIAS OPERANDO', 540, statsY + 205);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 20;
  ctx.fillText(`${daysTrading} ${isEn ? 'days' : 'dias'}`, 540, statsY + 265);
  ctx.shadowBlur = 0;

  // Rank requirement box
  drawRoundRect(100, statsY + 320, 880, 110, 20);
  ctx.fillStyle = '#0d1528';
  ctx.fill();
  ctx.strokeStyle = rank.color + '44';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText(isEn ? 'RANK REQUIREMENT' : 'REQUISITO DA PATENTE', 540, statsY + 365);

  ctx.fillStyle = rank.color;
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.fillText(`R$ ${rank.minProfit.toLocaleString('pt-BR')}+`, 540, statsY + 410);

  // Decorative stars row
  ctx.fillStyle = rank.color + '66';
  ctx.font = '36px Arial, sans-serif';
  ctx.fillText('★  ★  ★  ★  ★', 540, statsY + 490);

  // Footer separator with gold gradient
  const footGrad = ctx.createLinearGradient(150, 0, 930, 0);
  footGrad.addColorStop(0, 'transparent');
  footGrad.addColorStop(0.2, '#ffd70088');
  footGrad.addColorStop(0.5, '#ffd700');
  footGrad.addColorStop(0.8, '#ffd70088');
  footGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = footGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 1700);
  ctx.lineTo(930, 1700);
  ctx.stroke();

  // "ACESSE NOSSO SITE"
  ctx.fillStyle = '#d4d4d4';
  ctx.font = '28px Arial, sans-serif';
  ctx.fillText(isEn ? 'VISIT OUR WEBSITE' : 'ACESSE NOSSO SITE', 540, 1760);

  // Website URL with glow
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 38px Arial, sans-serif';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 25;
  ctx.fillText('WWW.GIRLANBARRETO.COM.BR', 540, 1815);
  ctx.shadowBlur = 0;

  return canvas;
}

export default function PatentPreviewDialog({ open, onOpenChange, rank, totalProfit, displayName, daysTrading, isEn }: PatentPreviewDialogProps) {
  const [imageUrl, setImageUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (open) {
      const canvas = generatePatentCanvas(rank, totalProfit, displayName, daysTrading, isEn);
      canvasRef.current = canvas;
      setImageUrl(canvas.toDataURL('image/png'));
    }
  }, [open, rank, totalProfit, displayName, daysTrading, isEn]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `patente-${rank.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle className="font-display text-primary flex items-center gap-2">
            {rank.emoji} {isEn ? rank.nameEn : rank.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isEn ? '🎉 Congratulations! Share on your Instagram Story!' : '🎉 Parabéns! Poste no seu Story do Instagram!'}
          </DialogDescription>
        </DialogHeader>
        {imageUrl && (
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={imageUrl} alt={rank.name} className="w-full h-auto" />
          </div>
        )}
        <Button onClick={handleDownload} className="w-full gradient-gold text-primary-foreground font-display gap-2">
          <Download className="w-4 h-4" />
          {isEn ? 'Download Image' : 'Baixar Imagem'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
