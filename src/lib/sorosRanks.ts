export interface SorosRank {
  name: string;
  minCycles: number;
  emoji: string;
  color: string;
  bgGradient: [string, string];
}

export const SOROS_RANKS: SorosRank[] = [
  { name: 'Recruta', minCycles: 1, emoji: '🎖️', color: '#a0a0a0', bgGradient: ['#1a1a2e', '#16213e'] },
  { name: 'Soldado', minCycles: 3, emoji: '⚔️', color: '#cd7f32', bgGradient: ['#1a1205', '#2d1f0a'] },
  { name: 'Sargento', minCycles: 5, emoji: '🛡️', color: '#c0c0c0', bgGradient: ['#0f1923', '#1a2a3a'] },
  { name: 'Tenente', minCycles: 10, emoji: '🔥', color: '#d4a017', bgGradient: ['#1a1205', '#2d1f0a'] },
  { name: 'Capitão', minCycles: 20, emoji: '⭐', color: '#ffd700', bgGradient: ['#1a1800', '#332e00'] },
  { name: 'Major', minCycles: 35, emoji: '💎', color: '#00bfff', bgGradient: ['#001a2e', '#002a4a'] },
  { name: 'Coronel', minCycles: 50, emoji: '👑', color: '#ff4500', bgGradient: ['#2e0a00', '#4a1500'] },
  { name: 'General', minCycles: 75, emoji: '🦅', color: '#8b00ff', bgGradient: ['#1a002e', '#2e004a'] },
  { name: 'Marechal', minCycles: 100, emoji: '🏆', color: '#ffd700', bgGradient: ['#2e1a00', '#4a2e00'] },
  { name: 'Lenda', minCycles: 150, emoji: '💀', color: '#ff0000', bgGradient: ['#2e0000', '#4a0000'] },
];

export function getRankForCycles(cycles: number): SorosRank {
  let rank = SOROS_RANKS[0];
  for (const r of SOROS_RANKS) {
    if (cycles >= r.minCycles) rank = r;
  }
  return rank;
}

export function getNextRank(cycles: number): SorosRank | null {
  for (const r of SOROS_RANKS) {
    if (cycles < r.minCycles) return r;
  }
  return null;
}
