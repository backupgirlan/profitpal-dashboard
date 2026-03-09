import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, X, Trophy } from 'lucide-react';
import { TraderRank } from '@/lib/traderRanks';
import { toast } from 'sonner';

interface RankAchievementModalProps {
  open: boolean;
  onClose: () => void;
  rank: TraderRank;
  totalProfit: number;
  displayName: string;
  daysTrading: number;
  totalTrades: number;
}

// ══════════════════════════════════════════════════
// CANVAS GENERATOR — 1080×1920 Instagram Story
// ══════════════════════════════════════════════════
function generateAchievementCanvas(
  rank: TraderRank,
  totalProfit: number,
  displayName: string,
  daysTrading: number,
  totalTrades: number,
): HTMLCanvasElement {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background gradient ──────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#050c18');
  bg.addColorStop(0.3, '#080f1f');
  bg.addColorStop(0.6, '#0b1428');
  bg.addColorStop(1, '#030810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Radial glow center ───────────────────────────
  const glow = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, 520);
  glow.addColorStop(0, rank.color + '22');
  glow.addColorStop(0.5, rank.color + '08');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Simulated candlestick chart background ───────
  ctx.globalAlpha = 0.06;
  const candleColors = ['#22c55e', '#ef4444'];
  for (let i = 0; i < 22; i++) {
    const x = 30 + i * 50;
    const open = 1700 + Math.random() * 400;
    const close = 1700 + Math.random() * 400;
    const high = Math.min(open, close) - Math.random() * 80;
    const low = Math.max(open, close) + Math.random() * 80;
    const color = close < open ? candleColors[0] : candleColors[1];
    ctx.fillStyle = color;
    ctx.fillRect(x - 1, high, 2, low - high);
    ctx.fillRect(x - 10, Math.min(open, close), 20, Math.abs(close - open) || 4);
  }
  // Rising line chart overlay
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = rank.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  const pts = [0.92, 0.89, 0.91, 0.87, 0.84, 0.80, 0.78, 0.75, 0.72, 0.68, 0.63];
  pts.forEach((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H * p;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Particle stars ────────────────────────────────
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 1.8 + 0.2;
    const alpha = Math.random() * 0.6 + 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  // ── Outer ornate borders ──────────────────────────
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

  // Outer border
  drawRoundRect(20, 20, W - 40, H - 40, 30, undefined, rank.color + '66', 3);
  drawRoundRect(32, 32, W - 64, H - 64, 22, undefined, rank.color + '22', 1);

  // ── Corner accents ─────────────────────────────────
  const corners = [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]];
  corners.forEach(([cx, cy], i) => {
    const dx = i % 2 === 0 ? 1 : -1;
    const dy = i < 2 ? 1 : -1;
    ctx.strokeStyle = rank.color + '88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * 50);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * 50, cy);
    ctx.stroke();
    // Diamond at corner
    ctx.fillStyle = rank.color;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── TOPO: TECHNICAL + nome ────────────────────────
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TECHNICAL', W / 2, 135);
  ctx.shadowBlur = 0;

  // Separator line
  const linGrad = ctx.createLinearGradient(100, 0, W - 100, 0);
  linGrad.addColorStop(0, 'transparent');
  linGrad.addColorStop(0.15, rank.color + '66');
  linGrad.addColorStop(0.5, rank.color);
  linGrad.addColorStop(0.85, rank.color + '66');
  linGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = linGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 168);
  ctx.lineTo(W - 100, 168);
  ctx.stroke();

  // Display name
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 20;
  ctx.fillText(displayName.toUpperCase(), W / 2, 228);
  ctx.shadowBlur = 0;

  // ── "NOVA CONQUISTA" pill ─────────────────────────
  drawRoundRect(W / 2 - 200, 255, 400, 56, 28, rank.color + '20', rank.color + '55', 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillText('★ NOVA PATENTE CONQUISTADA ★', W / 2, 290);

  // ── Big glowing circle with emoji ─────────────────
  const cY = 590;
  // Outer glow rings
  for (let i = 5; i >= 0; i--) {
    ctx.beginPath();
    ctx.arc(W / 2, cY, 200 + i * 18, 0, Math.PI * 2);
    const alpha = (6 - i) * 4;
    ctx.strokeStyle = rank.color + alpha.toString(16).padStart(2, '0');
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // Main circle gradient
  const circGrad = ctx.createRadialGradient(W / 2, cY, 0, W / 2, cY, 195);
  circGrad.addColorStop(0, rank.color + '40');
  circGrad.addColorStop(0.6, rank.color + '15');
  circGrad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(W / 2, cY, 195, 0, Math.PI * 2);
  ctx.fillStyle = circGrad;
  ctx.fill();
  // Ring border
  ctx.beginPath();
  ctx.arc(W / 2, cY, 195, 0, Math.PI * 2);
  ctx.strokeStyle = rank.color;
  ctx.lineWidth = 5;
  ctx.stroke();
  // Inner ring
  ctx.beginPath();
  ctx.arc(W / 2, cY, 162, 0, Math.PI * 2);
  ctx.strokeStyle = rank.color + '44';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Decorative tick marks
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const r1 = 175, r2 = i % 6 === 0 ? 155 : 168;
    ctx.strokeStyle = rank.color + (i % 6 === 0 ? 'cc' : '44');
    ctx.lineWidth = i % 6 === 0 ? 2.5 : 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 + r1 * Math.cos(angle), cY + r1 * Math.sin(angle));
    ctx.lineTo(W / 2 + r2 * Math.cos(angle), cY + r2 * Math.sin(angle));
    ctx.stroke();
  }

  // Emoji with large shadow
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 60;
  ctx.font = '180px Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(rank.emoji, W / 2, cY);
  ctx.textBaseline = 'alphabetic';
  ctx.shadowBlur = 0;

  // ── Rank name large ────────────────────────────────
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 78px Arial, sans-serif';
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 40;
  ctx.fillText(rank.name.toUpperCase(), W / 2, 855);
  ctx.shadowBlur = 0;

  // ── Divider with stars ─────────────────────────────
  ctx.fillStyle = rank.color + '77';
  ctx.font = '32px Arial, sans-serif';
  ctx.fillText('◆  ★  ◆  ★  ◆  ★  ◆', W / 2, 910);

  // ── STATS CARDS ────────────────────────────────────
  const statY = 960;
  const statH = 140;
  const margin = 80;
  const gap = 22;
  const bw = (W - margin * 2 - gap) / 2;

  // Profit card (full width)
  const profGrad = ctx.createLinearGradient(margin, statY, W - margin, statY + statH);
  profGrad.addColorStop(0, '#051a0a');
  profGrad.addColorStop(1, '#061a14');
  drawRoundRect(margin, statY, W - margin * 2, statH, 20, undefined, undefined);
  ctx.fillStyle = profGrad;
  ctx.fill();
  ctx.strokeStyle = '#22c55e33';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Left accent bar
  ctx.fillStyle = '#22c55e';
  drawRoundRect(margin, statY, 6, statH, 3, '#22c55e');
  ctx.fillStyle = '#6b7280';
  ctx.font = '28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💰  LUCRO TOTAL ACUMULADO', W / 2, statY + 50);
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 58px Arial, sans-serif';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 25;
  ctx.fillText(`R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, W / 2, statY + 112);
  ctx.shadowBlur = 0;

  const row2Y = statY + statH + gap;
  // Days card
  const dGrad = ctx.createLinearGradient(margin, row2Y, margin + bw, row2Y + statH);
  dGrad.addColorStop(0, '#100a00');
  dGrad.addColorStop(1, '#1a1000');
  drawRoundRect(margin, row2Y, bw, statH, 20, undefined, undefined);
  ctx.fillStyle = dGrad;
  ctx.fill();
  ctx.strokeStyle = '#f59e0b33';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawRoundRect(margin, row2Y, 6, statH, 3, '#f59e0b');
  ctx.fillStyle = '#6b7280';
  ctx.font = '24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📅 DIAS OPERANDO', margin + bw / 2, row2Y + 48);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 20;
  ctx.fillText(`${daysTrading}`, margin + bw / 2, row2Y + 110);
  ctx.shadowBlur = 0;

  // Trades card
  const tX = margin + bw + gap;
  const tGrad = ctx.createLinearGradient(tX, row2Y, tX + bw, row2Y + statH);
  tGrad.addColorStop(0, '#000b1a');
  tGrad.addColorStop(1, '#001428');
  drawRoundRect(tX, row2Y, bw, statH, 20, undefined, undefined);
  ctx.fillStyle = tGrad;
  ctx.fill();
  ctx.strokeStyle = rank.color + '33';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawRoundRect(tX, row2Y, 6, statH, 3, rank.color);
  ctx.fillStyle = '#6b7280';
  ctx.font = '24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📊 OPERAÇÕES', tX + bw / 2, row2Y + 48);
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 20;
  ctx.fillText(`${totalTrades}`, tX + bw / 2, row2Y + 110);
  ctx.shadowBlur = 0;

  // Requirement card
  const req3Y = row2Y + statH + gap;
  const rGrad = ctx.createLinearGradient(margin, req3Y, W - margin, req3Y + 100);
  rGrad.addColorStop(0, '#0a0620');
  rGrad.addColorStop(1, '#060418');
  drawRoundRect(margin, req3Y, W - margin * 2, 100, 20, undefined, undefined);
  ctx.fillStyle = rGrad;
  ctx.fill();
  ctx.strokeStyle = rank.color + '44';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#6b7280';
  ctx.font = '24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REQUISITO DA PATENTE', W / 2, req3Y + 38);
  ctx.fillStyle = rank.color;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText(`R$ ${rank.minProfit.toLocaleString('pt-BR')}+ em lucros`, W / 2, req3Y + 82);

  // ── Motivational phrase ───────────────────────────
  const quotes = [
    '"Disciplina constrói consistência."',
    '"Cada conquista é resultado de controle."',
    '"O trader disciplinado sempre evolui."',
    '"Consistência supera intensidade."',
    '"Paciência é a arma do trader de elite."',
  ];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  const quoteY = req3Y + 160;
  // Quote background
  drawRoundRect(margin, quoteY, W - margin * 2, 100, 16, rank.color + '0d', rank.color + '33', 1);
  ctx.fillStyle = '#d1d5db';
  ctx.font = 'italic 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  // Word wrap if needed
  if (ctx.measureText(q).width > W - margin * 2 - 40) {
    const mid = Math.floor(q.length / 2);
    const sp = q.lastIndexOf(' ', mid);
    ctx.fillText(q.slice(0, sp), W / 2, quoteY + 40);
    ctx.fillText(q.slice(sp + 1), W / 2, quoteY + 74);
  } else {
    ctx.fillText(q, W / 2, quoteY + 55);
  }

  // ── Footer ────────────────────────────────────────
  const footerY = H - 200;
  // Separator
  const fGrad = ctx.createLinearGradient(100, 0, W - 100, 0);
  fGrad.addColorStop(0, 'transparent');
  fGrad.addColorStop(0.2, '#ffd70088');
  fGrad.addColorStop(0.5, '#ffd700');
  fGrad.addColorStop(0.8, '#ffd70088');
  fGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = fGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, footerY);
  ctx.lineTo(W - 100, footerY);
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = '30px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PLATAFORMA OFICIAL', W / 2, footerY + 55);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 30;
  ctx.fillText('WWW.GIRLANBARRETO.COM.BR', W / 2, footerY + 108);
  ctx.shadowBlur = 0;

  // Bottom rank badge
  ctx.fillStyle = rank.color + '22';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText(`${rank.emoji}  ${rank.name.toUpperCase()}  ${rank.emoji}`, W / 2, footerY + 155);

  return canvas;
}

// ══════════════════════════════════════════════════
// MODAL COMPONENT
// ══════════════════════════════════════════════════
export default function RankAchievementModal({
  open, onClose, rank, totalProfit, displayName, daysTrading, totalTrades,
}: RankAchievementModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setGenerating(true);
    // Let the animation start before generating canvas (heavy task)
    const t = setTimeout(() => {
      try {
        const canvas = generateAchievementCanvas(rank, totalProfit, displayName, daysTrading, totalTrades);
        canvasRef.current = canvas;
        setImageUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('Canvas generation failed', e);
      } finally {
        setGenerating(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [open, rank, totalProfit, displayName, daysTrading, totalTrades]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `patente-${rank.name.toLowerCase().replace(/\s+/g, '-')}-technical.png`;
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
          toast.info('Compartilhamento não disponível. Imagem baixada!');
        }
      });
    } catch { handleDownload(); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-[360px] sm:max-w-[420px] p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260 }}
              className="relative rounded-3xl overflow-hidden"
              style={{ border: `2px solid ${rank.color}55`, background: 'linear-gradient(135deg, #060c1a, #0b1428)' }}
            >
              {/* Glow behind card */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ boxShadow: `0 0 80px 20px ${rank.color}30, inset 0 0 40px ${rank.color}10` }} />

              {/* Close button */}
              <button onClick={onClose}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all">
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center relative z-10">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Trophy className="w-5 h-5" style={{ color: rank.color }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: rank.color }}>
                      Nova Conquista Desbloqueada!
                    </span>
                    <Trophy className="w-5 h-5" style={{ color: rank.color }} />
                  </div>
                  <p className="text-2xl font-bold text-white">{rank.emoji} {rank.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Poste no seu Instagram Story e inspire outros traders!</p>
                </motion.div>
              </div>

              {/* Image preview */}
              <div className="px-4 pb-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-2xl overflow-hidden border"
                  style={{ borderColor: rank.color + '44' }}
                >
                  {generating ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3 bg-black/30">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="w-10 h-10 rounded-full border-2 border-transparent"
                        style={{ borderTopColor: rank.color, borderRightColor: rank.color + '44' }}
                      />
                      <p className="text-xs text-gray-400">Gerando imagem premium...</p>
                    </div>
                  ) : imageUrl ? (
                    <img src={imageUrl} alt={`Patente ${rank.name}`} className="w-full h-auto" style={{ maxHeight: '340px', objectFit: 'cover', objectPosition: 'top' }} />
                  ) : null}
                </motion.div>
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-4 pb-6 grid grid-cols-2 gap-3"
              >
                <Button onClick={handleDownload} disabled={!imageUrl || generating}
                  className="h-11 font-bold gap-2 text-sm text-black"
                  style={{ background: `linear-gradient(135deg, ${rank.color}, ${rank.color}cc)` }}>
                  <Download className="w-4 h-4" />
                  Baixar
                </Button>
                <Button onClick={handleShare} disabled={!imageUrl || generating}
                  variant="outline"
                  className="h-11 font-bold gap-2 text-sm border-white/20 text-white hover:bg-white/10">
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
              </motion.div>

              {/* Animated particles */}
              {open && Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -80 - i * 20, x: (i % 2 === 0 ? 1 : -1) * (20 + i * 8), scale: [0, 1, 0] }}
                  transition={{ duration: 1.5, delay: 0.3 + i * 0.12, ease: 'easeOut' }}
                  className="absolute bottom-8 pointer-events-none text-lg"
                  style={{ left: `${15 + i * 10}%` }}
                >
                  {['⭐', '✨', '🎉', '💫', '🌟', '🎊', '⚡', '💎'][i]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
