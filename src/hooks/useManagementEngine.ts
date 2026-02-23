import { useState, useEffect, useCallback } from 'react';

export type ManagementMode = 'conservador' | 'intermediario' | 'agressivo';

export interface HistoryEntry {
  tentativa: number;
  entrada: number;
  resultado: 'win' | 'loss';
  bancaAtual: number;
  lucro: number;
  entryType: 'normal' | 'soros' | 'martingale' | 'anti_dia_ruim';
  sorosLevel?: number;
  timestamp: number;
}

export interface ManagementState {
  mode: ManagementMode;
  bancaInicial: number;
  bancaAtual: number;
  riscoPct: number; // % risk per trade
  stopLossPct: number; // daily stop loss %
  stopWinPct: number; // daily stop win %
  maxTrades: number; // max trades per day
  tradesDoDia: number;
  winsDoDia: number;
  lossesDoDia: number;
  lucroSessao: number;
  perdaSequencial: number;
  // Anti dia ruim (conservador)
  antiDiaRuimAtivo: boolean;
  antiDiaRuimUsado: boolean;
  // Soros (agressivo)
  sorosAtivo: boolean;
  sorosLevel: number;
  sorosMaxLevel: number;
  sorosSaldoCiclo: number;
  // Martingale (agressivo)
  martingaleAtivo: boolean;
  martingaleLevel: number;
  // State flags
  bloqueado: boolean;
  encerrado: boolean;
  pausado: boolean;
  mensagem: string;
  alertas: string[];
  historico: HistoryEntry[];
  ativo: boolean;
  payout: number;
}

const STORAGE_KEY = 'management_engine_state';

const defaultState: ManagementState = {
  mode: 'conservador',
  bancaInicial: 0,
  bancaAtual: 0,
  riscoPct: 1,
  stopLossPct: 2,
  stopWinPct: 2,
  maxTrades: 3,
  tradesDoDia: 0,
  winsDoDia: 0,
  lossesDoDia: 0,
  lucroSessao: 0,
  perdaSequencial: 0,
  antiDiaRuimAtivo: false,
  antiDiaRuimUsado: false,
  sorosAtivo: false,
  sorosLevel: 0,
  sorosMaxLevel: 4,
  sorosSaldoCiclo: 0,
  martingaleAtivo: false,
  martingaleLevel: 0,
  bloqueado: false,
  encerrado: false,
  pausado: false,
  mensagem: '',
  alertas: [],
  historico: [],
  ativo: false,
  payout: 0.80,
};

function calcEntrada(s: ManagementState): number {
  // Anti dia ruim: half stake
  if (s.antiDiaRuimAtivo) {
    return +(s.bancaAtual * (s.riscoPct / 100) / 2).toFixed(2);
  }
  // Martingale: double previous entry
  if (s.martingaleAtivo && s.martingaleLevel > 0 && s.historico.length > 0) {
    const lastEntry = s.historico[0].entrada;
    return +(lastEntry * 2).toFixed(2);
  }
  // Soros: use saldoCiclo
  if (s.sorosAtivo && s.sorosLevel > 0) {
    return +s.sorosSaldoCiclo.toFixed(2);
  }
  // Normal
  return +(s.bancaAtual * (s.riscoPct / 100)).toFixed(2);
}

export function useManagementEngine() {
  const [state, setState] = useState<ManagementState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const iniciar = useCallback((params: {
    mode: ManagementMode;
    banca: number;
    riscoPct: number;
    stopLossPct: number;
    stopWinPct: number;
    maxTrades: number;
    payout: number;
    sorosAtivo?: boolean;
    sorosMaxLevel?: number;
    martingaleAtivo?: boolean;
  }) => {
    const entrada = params.banca * (params.riscoPct / 100);
    if (params.banca < entrada) {
      setState(prev => ({ ...prev, mensagem: '🚫 Banca insuficiente.' }));
      return;
    }

    const newState: ManagementState = {
      ...defaultState,
      mode: params.mode,
      bancaInicial: params.banca,
      bancaAtual: params.banca,
      riscoPct: params.riscoPct,
      stopLossPct: params.stopLossPct,
      stopWinPct: params.stopWinPct,
      maxTrades: params.maxTrades,
      payout: params.payout / 100,
      sorosAtivo: params.sorosAtivo || false,
      sorosMaxLevel: params.sorosMaxLevel || 4,
      martingaleAtivo: params.martingaleAtivo || false,
      ativo: true,
      mensagem: `Gerenciamento ${params.mode} iniciado. Entrada: R$ ${entrada.toFixed(2)}`,
    };
    setState(newState);
  }, []);

  const registrarResultado = useCallback((resultado: 'win' | 'loss') => {
    setState(prev => {
      if (!prev.ativo || prev.encerrado || prev.bloqueado) return prev;

      let s = { ...prev, alertas: [] as string[] };
      const entrada = calcEntrada(s);
      let entryType: HistoryEntry['entryType'] = 'normal';
      let sorosLevel = 0;

      if (s.antiDiaRuimAtivo) entryType = 'anti_dia_ruim';
      else if (s.sorosAtivo && s.sorosLevel > 0) { entryType = 'soros'; sorosLevel = s.sorosLevel; }
      else if (s.martingaleAtivo && s.martingaleLevel > 0) entryType = 'martingale';

      if (resultado === 'win') {
        const lucro = +(entrada * s.payout).toFixed(2);
        s.bancaAtual = +(s.bancaAtual + lucro).toFixed(2);
        s.lucroSessao = +(s.lucroSessao + lucro).toFixed(2);
        s.winsDoDia++;
        s.perdaSequencial = 0;
        s.martingaleLevel = 0;

        // Soros handling
        if (s.sorosAtivo) {
          if (s.sorosLevel === 0) {
            // Start soros cycle
            s.sorosLevel = 1;
            s.sorosSaldoCiclo = entrada + lucro;
          } else if (s.sorosLevel < s.sorosMaxLevel) {
            s.sorosLevel++;
            s.sorosSaldoCiclo = +(s.sorosSaldoCiclo + lucro).toFixed(2);
          } else {
            // Soros cycle complete
            s.alertas.push(`🎯 Soros x${s.sorosMaxLevel} concluído!`);
            s.sorosLevel = 0;
            s.sorosSaldoCiclo = 0;
          }
        }

        // Anti dia ruim deactivates on win
        if (s.antiDiaRuimAtivo) {
          s.antiDiaRuimAtivo = false;
          s.alertas.push('✅ Modo Anti Dia Ruim desativado após win.');
        }

        s.mensagem = `✅ Win! Lucro: R$ ${lucro.toFixed(2)}`;
      } else {
        // LOSS
        s.bancaAtual = +(s.bancaAtual - entrada).toFixed(2);
        s.lucroSessao = +(s.lucroSessao - entrada).toFixed(2);
        s.lossesDoDia++;
        s.perdaSequencial++;

        // Reset soros on loss
        if (s.sorosAtivo && s.sorosLevel > 0) {
          s.alertas.push(`❌ Soros N${s.sorosLevel} perdido. Ciclo resetado.`);
          s.sorosLevel = 0;
          s.sorosSaldoCiclo = 0;
        }

        // Martingale: increase level
        if (s.martingaleAtivo) {
          s.martingaleLevel++;
        }

        s.mensagem = `❌ Loss. Perda: R$ ${entrada.toFixed(2)}`;

        // CONSERVADOR: Anti dia ruim after 2 consecutive losses
        if (s.mode === 'conservador' && s.perdaSequencial >= 2 && !s.antiDiaRuimUsado) {
          s.antiDiaRuimAtivo = true;
          s.antiDiaRuimUsado = true;
          s.alertas.push('⚠️ Dia desfavorável detectado — preservação ativada. Stake reduzido pela metade, 1 operação adicional.');
          s.mensagem += ' Modo Anti Dia Ruim ativado.';
        }

        // CONSERVADOR: If anti dia ruim is active and loses again, end day
        if (s.mode === 'conservador' && s.antiDiaRuimAtivo && entryType === 'anti_dia_ruim') {
          s.bloqueado = true;
          s.encerrado = true;
          s.mensagem = '🚫 Dia encerrado automaticamente. Anti Dia Ruim ativado e nova perda detectada.';
          s.alertas.push('Dia desfavorável detectado — preservação ativada.');
        }
      }

      s.tradesDoDia++;

      // Record history
      const entry: HistoryEntry = {
        tentativa: s.tradesDoDia,
        entrada,
        resultado,
        bancaAtual: s.bancaAtual,
        lucro: resultado === 'win' ? +(entrada * s.payout).toFixed(2) : -entrada,
        entryType,
        sorosLevel: sorosLevel || undefined,
        timestamp: Date.now(),
      };
      s.historico = [entry, ...s.historico].slice(0, 50);

      // Check stop loss
      const stopLossValue = s.bancaInicial * (s.stopLossPct / 100);
      if (s.lucroSessao < 0 && Math.abs(s.lucroSessao) >= stopLossValue) {
        s.bloqueado = true;
        s.encerrado = true;
        s.mensagem = `🚫 Stop Loss atingido (${s.stopLossPct}%). Operações bloqueadas.`;
        s.alertas.push('Stop loss diário atingido. Operações bloqueadas.');
      }

      // Check stop win
      const stopWinValue = s.bancaInicial * (s.stopWinPct / 100);
      if (s.lucroSessao > 0 && s.lucroSessao >= stopWinValue) {
        s.encerrado = true;
        s.mensagem = `🎯 Stop Win atingido (${s.stopWinPct}%)! Meta alcançada!`;
        s.alertas.push('Meta diária atingida! Parabéns!');
      }

      // Check max trades
      if (s.tradesDoDia >= s.maxTrades && !s.encerrado) {
        s.encerrado = true;
        s.mensagem = `⏹️ Limite de ${s.maxTrades} trades atingido.`;
        s.alertas.push('Limite de trades diário atingido.');
      }

      // Proximity alerts
      if (!s.encerrado) {
        const lossProx = stopLossValue > 0 ? (Math.abs(s.lucroSessao) / stopLossValue) * 100 : 0;
        if (s.lucroSessao < 0 && lossProx >= 70) {
          s.alertas.push(`⚠️ Stop loss próximo (${lossProx.toFixed(0)}%)`);
        }
        if (s.perdaSequencial >= 2) {
          s.alertas.push(`⚠️ Você atingiu ${s.perdaSequencial} perdas consecutivas. Considere encerrar o dia.`);
        }
        if (s.mode === 'agressivo') {
          s.alertas.push('🔥 Modo de alto risco ativado.');
        }
      }

      return s;
    });
  }, []);

  const resetar = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  const getEntradaAtual = useCallback(() => {
    return calcEntrada(state);
  }, [state]);

  return { state, iniciar, registrarResultado, resetar, getEntradaAtual };
}
