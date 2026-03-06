export interface TraderRank {
  name: string;
  nameEn: string;
  minProfit: number;
  emoji: string;
  color: string;
}

export const TRADER_RANKS: TraderRank[] = [
  { name: 'Aprendiz', nameEn: 'Apprentice', minProfit: 0, emoji: '📘', color: '#a0a0a0' },
  { name: 'Iniciante', nameEn: 'Beginner', minProfit: 100, emoji: '🥉', color: '#cd7f32' },
  { name: 'Operador', nameEn: 'Operator', minProfit: 250, emoji: '🥈', color: '#c0c0c0' },
  { name: 'Trader', nameEn: 'Trader', minProfit: 500, emoji: '🥇', color: '#d4a017' },
  { name: 'Trader Avançado', nameEn: 'Advanced Trader', minProfit: 750, emoji: '⭐', color: '#ffd700' },
  { name: 'Expert', nameEn: 'Expert', minProfit: 1000, emoji: '💎', color: '#00bfff' },
  { name: 'Especialista', nameEn: 'Specialist', minProfit: 1500, emoji: '🔥', color: '#ff6600' },
  { name: 'Mestre', nameEn: 'Master', minProfit: 2000, emoji: '👑', color: '#ff4500' },
  { name: 'Grão-Mestre', nameEn: 'Grandmaster', minProfit: 2500, emoji: '🦅', color: '#8b00ff' },
  { name: 'Elite', nameEn: 'Elite', minProfit: 3000, emoji: '🏅', color: '#e5cc00' },
  { name: 'Lenda', nameEn: 'Legend', minProfit: 4500, emoji: '🏆', color: '#ffd700' },
  { name: 'Imortal', nameEn: 'Immortal', minProfit: 6000, emoji: '💀', color: '#ff0000' },
  { name: 'Titã', nameEn: 'Titan', minProfit: 8000, emoji: '⚡', color: '#00ffcc' },
  { name: 'Mítico', nameEn: 'Mythic', minProfit: 10000, emoji: '🐉', color: '#ff00ff' },
  { name: 'Supremo', nameEn: 'Supreme', minProfit: 15000, emoji: '🌟', color: '#ffaa00' },
  { name: 'Divino', nameEn: 'Divine', minProfit: 20000, emoji: '👼', color: '#ffffff' },
  { name: 'Transcendente', nameEn: 'Transcendent', minProfit: 25000, emoji: '🌌', color: '#9400d3' },
];

export interface ProfitTrophy {
  name: string;
  nameEn: string;
  minProfit: number;
  emoji: string;
  color: string;
}

export const PROFIT_TROPHIES: ProfitTrophy[] = [
  { name: 'Primeiro Centavo', nameEn: 'First Hundred', minProfit: 100, emoji: '🏅', color: '#cd7f32' },
  { name: 'Meio Milhar', nameEn: 'Half Grand', minProfit: 500, emoji: '🥈', color: '#c0c0c0' },
  { name: 'Club dos Mil', nameEn: 'Grand Club', minProfit: 1000, emoji: '🥇', color: '#ffd700' },
  { name: 'Elite Trader', nameEn: 'Elite Trader', minProfit: 5000, emoji: '💎', color: '#00bfff' },
];

export function getRankForProfit(totalProfit: number): TraderRank {
  let rank = TRADER_RANKS[0];
  for (const r of TRADER_RANKS) {
    if (totalProfit >= r.minProfit) rank = r;
  }
  return rank;
}

export function getNextRankForProfit(totalProfit: number): TraderRank | null {
  for (const r of TRADER_RANKS) {
    if (totalProfit < r.minProfit) return r;
  }
  return null;
}
