import { useCallback } from 'react';
import { TraderRank } from '@/lib/traderRanks';

interface PatentStoryProps {
  rank: TraderRank;
  totalProfit: number;
  displayName: string;
  daysTrading: number;
  isEn: boolean;
}

export const usePatentStoryDownload = () => {
  const downloadStory = useCallback(({ rank, totalProfit, displayName, daysTrading, isEn }: PatentStoryProps) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#0a0a0a');
    bgGrad.addColorStop(0.3, '#111827');
    bgGrad.addColorStop(0.7, '#0f172a');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative border
    ctx.strokeStyle = rank.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1020, 1860);

    // Inner glow border
    ctx.strokeStyle = rank.color + '44';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 990, 1830);

    // Top: "TECHNICAL" brand
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TECHNICAL', 540, 140);

    // Separator line
    const lineGrad = ctx.createLinearGradient(200, 0, 880, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.3, rank.color);
    lineGrad.addColorStop(0.7, rank.color);
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 170);
    ctx.lineTo(880, 170);
    ctx.stroke();

    // User name
    ctx.fillStyle = rank.color;
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.fillText(displayName.toUpperCase(), 540, 230);

    // Large emoji circle
    const centerY = 580;
    // Glow effect
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 60;
    ctx.beginPath();
    ctx.arc(540, centerY, 160, 0, Math.PI * 2);
    ctx.fillStyle = rank.color + '15';
    ctx.fill();
    ctx.strokeStyle = rank.color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner circle
    ctx.beginPath();
    ctx.arc(540, centerY, 140, 0, Math.PI * 2);
    ctx.fillStyle = rank.color + '22';
    ctx.fill();

    // Emoji
    ctx.font = '140px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rank.emoji, 540, centerY);
    ctx.textBaseline = 'alphabetic';

    // Rank name
    ctx.fillStyle = rank.color;
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 20;
    ctx.fillText((isEn ? rank.nameEn : rank.name).toUpperCase(), 540, 810);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#9ca3af';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText(isEn ? 'PATENT ACHIEVED' : 'PATENTE CONQUISTADA', 540, 865);

    // Stats section
    const statsY = 980;

    // Profit box
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = rank.color + '66';
    ctx.lineWidth = 2;
    roundRect(ctx, 100, statsY, 880, 120, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(isEn ? 'TOTAL PROFIT' : 'LUCRO TOTAL', 540, statsY + 40);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillText(`R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 540, statsY + 90);

    // Days box
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = rank.color + '66';
    roundRect(ctx, 100, statsY + 150, 880, 120, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(isEn ? 'DAYS TRADING' : 'DIAS OPERANDO', 540, statsY + 190);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillText(`${daysTrading} ${isEn ? 'days' : 'dias'}`, 540, statsY + 240);

    // Min profit for this rank
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = rank.color + '66';
    roundRect(ctx, 100, statsY + 300, 880, 100, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(isEn ? 'RANK REQUIREMENT' : 'REQUISITO DA PATENTE', 540, statsY + 345);

    ctx.fillStyle = rank.color;
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText(`R$ ${rank.minProfit.toLocaleString('pt-BR')}+`, 540, statsY + 385);

    // Decorative stars
    ctx.fillStyle = rank.color + '44';
    ctx.font = '30px Arial, sans-serif';
    ctx.fillText('★ ★ ★ ★ ★', 540, statsY + 460);

    // Footer separator
    const footGrad = ctx.createLinearGradient(200, 0, 880, 0);
    footGrad.addColorStop(0, 'transparent');
    footGrad.addColorStop(0.3, '#ffd700');
    footGrad.addColorStop(0.7, '#ffd700');
    footGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = footGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 1700);
    ctx.lineTo(880, 1700);
    ctx.stroke();

    // "ACESSE NOSSO SITE"
    ctx.fillStyle = '#9ca3af';
    ctx.font = '26px Arial, sans-serif';
    ctx.fillText('ACESSE NOSSO SITE', 540, 1760);

    // Website URL
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.fillText('WWW.GIRLANBARRETO.COM.BR', 540, 1810);
    ctx.shadowBlur = 0;

    // Download
    const link = document.createElement('a');
    link.download = `patente-${rank.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return { downloadStory };
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
}
