import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { TraderRank } from '@/lib/traderRanks';
import { toast } from 'sonner';

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
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Rich background ───────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#050c18');
  bg.addColorStop(0.3, '#080f1f');
  bg.addColorStop(0.6, '#0b1428');
  bg.addColorStop(1, '#030810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 500);
  glow.addColorStop(0, rank.color + '1a');
  glow.addColorStop(0.6, rank.color + '06');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Candlestick background
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 20; i++) {
    const x = 40 + i * 52;
    const open = 1600 + Math.random() * 500;
    const close = 1600 + Math.random() * 500;
    const color = close < open ? '#22c55e' : '#ef4444';
    ctx.fillStyle = color;
    ctx.fillRect(x - 1, Math.min(open, close) - 50, 2, Math.abs(close - open) + 100);
    ctx.fillRect(x - 10, Math.min(open, close), 20, Math.abs(close - open) || 4);
  }
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = rank.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  [0.92, 0.89, 0.91, 0.86, 0.83, 0.79, 0.76, 0.73, 0.69, 0.65].forEach((p, i, arr) => {
    const x = (i / (arr.length - 1)) * W;
    i === 0 ? ctx.moveTo(x, H * p) : ctx.lineTo(x, H * p);
  });
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Stars/particles
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.1})`;
    ctx.fill();
  }

  // Helper: rounded rect
  const drawRoundRect = (x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, lw = 2) => {
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
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };

  // Borders
  drawRoundRect(20, 20, W - 40, H - 40, 28, undefined, rank.color + '55', 3);
  drawRoundRect(34, 34, W - 68, H - 68, 20, undefined, rank.color + '1a', 1);

  // Corner accents
  [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]].forEach(([cx, cy], i) => {
    const dx = i % 2 === 0 ? 1 : -1, dy = i < 2 ? 1 : -1;
    ctx.strokeStyle = rank.color + '77';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * 45);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * 45, cy);
    ctx.stroke();
    ctx.fillStyle = rank.color;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── TECHNICAL header ──────────────────────────────
  ctx.textAlign = 'center';
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 35;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.fillText('TECHNICAL', W / 2, 135);
  ctx.shadowBlur = 0;

  // Separator
  const sep = ctx.createLinearGradient(100, 0, W - 100, 0);
  sep.addColorStop(0, 'transparent');
  sep.addColorStop(0.2, rank.color + '66');
  sep.addColorStop(0.5, rank.color);
  sep.addColorStop(0.8, rank.color + '66');
  sep.addColorStop(1, 'transparent');
  ctx.strokeStyle = sep;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 165);
  ctx.lineTo(W - 100, 165);
  ctx.stroke();

  // User name
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 46px Arial, sans-serif';
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 18;
  ctx.fillText(displayName.toUpperCase(), W / 2, 225);
  ctx.shadowBlur = 0;

  // ── Badge circle ──────────────────────────────────
  const cY = 560;
  for (let i = 4; i >= 0; i--) {
    ctx.beginPath();
    ctx.arc(W / 2, cY, 190 + i * 16, 0, Math.PI * 2);
    ctx.strokeStyle = rank.color + ((5 - i) * 5).toString(16).padStart(2, '0');
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  const cGrad = ctx.createRadialGradient(W / 2, cY, 0, W / 2, cY, 185);
  cGrad.addColorStop(0, rank.color + '35');
  cGrad.addColorStop(0.7, rank.color + '10');
  cGrad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(W / 2, cY, 185, 0, Math.PI * 2);
  ctx.fillStyle = cGrad;
  ctx.fill();
  ctx.strokeStyle = rank.color;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, cY, 155, 0, Math.PI * 2);
  ctx.strokeStyle = rank.color + '44';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Tick marks
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const r1 = 170, r2 = i % 6 === 0 ? 150 : 162;
    ctx.strokeStyle = rank.color + (i % 6 === 0 ? 'bb' : '33');
    ctx.lineWidth = i % 6 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 + r1 * Math.cos(a), cY + r1 * Math.sin(a));
    ctx.lineTo(W / 2 + r2 * Math.cos(a), cY + r2 * Math.sin(a));
    ctx.stroke();
  }
  // Emoji
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 55;
  ctx.font = '170px Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(rank.emoji, W / 2, cY);
  ctx.textBaseline = 'alphabetic';
  ctx.shadowBlur = 0;

  // Rank name
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 72px Arial, sans-serif';
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 35;
  ctx.fillText((isEn ? rank.nameEn : rank.name).toUpperCase(), W / 2, 840);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#9ca3af';
  ctx.font = '30px Arial, sans-serif';
  ctx.fillText(isEn ? '★ PATENT ACHIEVED ★' : '★ PATENTE CONQUISTADA ★', W / 2, 895);

  // ── Stats ─────────────────────────────────────────
  const sY = 960;
  // Profit
  drawRoundRect(80, sY, W - 160, 130, 20, '#051a0a', '#22c55e33', 2);
  ctx.fillStyle = '#6b7280';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText(isEn ? '💰 TOTAL PROFIT' : '💰 LUCRO TOTAL', W / 2, sY + 48);
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 56px Arial, sans-serif';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 22;
  ctx.fillText(`R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, W / 2, sY + 108);
  ctx.shadowBlur = 0;

  // Days
  drawRoundRect(80, sY + 155, W - 160, 130, 20, '#100a00', '#f59e0b33', 2);
  ctx.fillStyle = '#6b7280';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText(isEn ? '📅 DAYS TRADING' : '📅 DIAS OPERANDO', W / 2, sY + 203);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 56px Arial, sans-serif';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 22;
  ctx.fillText(`${daysTrading} ${isEn ? 'days' : 'dias'}`, W / 2, sY + 263);
  ctx.shadowBlur = 0;

  // Requirement
  drawRoundRect(80, sY + 310, W - 160, 110, 20, '#0d0520', rank.color + '44', 2);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText(isEn ? 'RANK REQUIREMENT' : 'REQUISITO DA PATENTE', W / 2, sY + 355);
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText(`R$ ${rank.minProfit.toLocaleString('pt-BR')}+`, W / 2, sY + 400);

  // Stars
  ctx.fillStyle = rank.color + '66';
  ctx.font = '34px Arial, sans-serif';
  ctx.fillText('★  ★  ★  ★  ★', W / 2, sY + 468);

  // ── Quote ──────────────────────────────────────────
  const quotes = [
    isEn ? '"Discipline builds consistency."' : '"Disciplina constrói consistência."',
    isEn ? '"Every achievement is the result of control."' : '"Cada conquista é resultado de controle."',
    isEn ? '"The disciplined trader always evolves."' : '"O trader disciplinado sempre evolui."',
  ];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  drawRoundRect(80, sY + 500, W - 160, 90, 16, rank.color + '0d', rank.color + '33', 1);
  ctx.fillStyle = '#d1d5db';
  ctx.font = 'italic 28px Arial, sans-serif';
  ctx.fillText(q, W / 2, sY + 552);

  // ── Footer ────────────────────────────────────────
  const fY = H - 195;
  const fg = ctx.createLinearGradient(100, 0, W - 100, 0);
  fg.addColorStop(0, 'transparent');
  fg.addColorStop(0.2, '#ffd70088');
  fg.addColorStop(0.5, '#ffd700');
  fg.addColorStop(0.8, '#ffd70088');
  fg.addColorStop(1, 'transparent');
  ctx.strokeStyle = fg;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, fY);
  ctx.lineTo(W - 100, fY);
  ctx.stroke();

  ctx.fillStyle = '#d4d4d4';
  ctx.font = '28px Arial, sans-serif';
  ctx.fillText(isEn ? 'VISIT OUR WEBSITE' : 'PLATAFORMA OFICIAL', W / 2, fY + 52);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 28;
  ctx.fillText('WWW.GIRLANBARRETO.COM.BR', W / 2, fY + 105);
  ctx.shadowBlur = 0;

  ctx.fillStyle = rank.color + '22';
  ctx.font = '22px Arial, sans-serif';
  ctx.fillText(`${rank.emoji}  ${(isEn ? rank.nameEn : rank.name).toUpperCase()}  ${rank.emoji}`, W / 2, fY + 150);

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
    toast.success('📥 Imagem baixada! Poste no seu Story 🚀');
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `patente-${rank.name}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `Patente ${rank.name} - TECHNICAL`, text: `Conquistei a patente ${rank.name}! 🎯 www.girlanbarreto.com.br` });
        } else {
          handleDownload();
        }
      });
    } catch { handleDownload(); }
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
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleDownload} className="w-full gradient-gold text-primary-foreground font-display gap-2">
            <Download className="w-4 h-4" />
            {isEn ? 'Download' : 'Baixar'}
          </Button>
          <Button onClick={handleShare} variant="outline" className="w-full font-display gap-2 border-primary/30 text-primary hover:bg-primary/10">
            <Share2 className="w-4 h-4" />
            {isEn ? 'Share' : 'Compartilhar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
