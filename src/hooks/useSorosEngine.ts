import { useState, useEffect, useCallback } from 'react';

export type ManagementMode = 'soros4x' | 'conservador' | 'baixo_risco' | 'agressivo' | 'livre';

export interface HistoryEntry {
  tentativa: number;
  nivel: number;
  entrada: number;
  resultado: 'win' | 'loss';
  bancaAtual: number;
  timestamp: number;
}

export interface SorosState {
  mode: ManagementMode;
  bancaInicial: number;
  bancaAtual: number;
  tentativasTotal: number;
  tentativaAtual: number;
  tentativasGanhas: number;
  tentativasPerdidas: number;
  nivelAtual: number; // 1..4
  riscoBase: number;
  riscoOperacional: number;
  saldoCiclo: number;
  payout: number; // decimal, e.g. 0.80
  turbo: boolean;
  metaDiaria: number;
  stopDiario: number;
  lucroSessao: number;
  perdaSequencial: number;
  pausado: boolean;
  encerrado: boolean;
  mensagem: string;
  historico: HistoryEntry[];
  ativo: boolean;
}

const STORAGE_KEY = 'soros_management_state';

const defaultState: SorosState = {
  mode: 'soros4x',
  bancaInicial: 0,
  bancaAtual: 0,
  tentativasTotal: 10,
  tentativaAtual: 0,
  tentativasGanhas: 0,
  tentativasPerdidas: 0,
  nivelAtual: 1,
  riscoBase: 0,
  riscoOperacional: 0,
  saldoCiclo: 0,
  payout: 0.80,
  turbo: false,
  metaDiaria: 0,
  stopDiario: 0,
  lucroSessao: 0,
  perdaSequencial: 0,
  pausado: false,
  encerrado: false,
  mensagem: '',
  historico: [],
  ativo: false,
};

function calcRiscoOperacional(mode: ManagementMode, riscoBase: number): number {
  switch (mode) {
    case 'conservador': return +(riscoBase * 0.70).toFixed(2);
    case 'agressivo': return +(riscoBase * 1.30).toFixed(2);
    default: return riscoBase;
  }
}

function calcEntradaNivel(mode: ManagementMode, nivel: number, saldoCiclo: number): number {
  if (mode === 'conservador') {
    const mult = [0.60, 0.70, 0.80, 0.90];
    return +(saldoCiclo * mult[nivel - 1]).toFixed(2);
  }
  return +saldoCiclo.toFixed(2);
}

export function useSorosEngine() {
  const [state, setState] = useState<SorosState>(() => {
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
    tentativas: number;
    payout: number;
    turbo?: boolean;
    metaDiaria?: number;
    stopDiario?: number;
  }) => {
    const riscoBase = +(params.banca / params.tentativas).toFixed(2);
    const riscoOp = calcRiscoOperacional(params.mode, riscoBase);

    if (params.banca < riscoOp) {
      setState(prev => ({ ...prev, mensagem: '🚫 Banca insuficiente para iniciar.' }));
      return;
    }

    const newState: SorosState = {
      mode: params.mode,
      bancaInicial: params.banca,
      bancaAtual: +(params.banca - riscoOp).toFixed(2),
      tentativasTotal: params.tentativas,
      tentativaAtual: 1,
      tentativasGanhas: 0,
      tentativasPerdidas: 0,
      nivelAtual: 1,
      riscoBase,
      riscoOperacional: riscoOp,
      saldoCiclo: riscoOp,
      payout: params.payout,
      turbo: params.turbo || false,
      metaDiaria: params.metaDiaria || 0,
      stopDiario: params.stopDiario || 0,
      lucroSessao: 0,
      perdaSequencial: 0,
      pausado: false,
      encerrado: false,
      mensagem: `Tentativa 1 iniciada. Entrada N1: R$ ${calcEntradaNivel(params.mode, 1, riscoOp).toFixed(2)}`,
      historico: [],
      ativo: true,
    };
    setState(newState);
  }, []);

  const registrarResultado = useCallback((resultado: 'win' | 'loss', payoutOverride?: number) => {
    setState(prev => {
      if (!prev.ativo || prev.encerrado || prev.pausado) return prev;

      const entrada = calcEntradaNivel(prev.mode, prev.nivelAtual, prev.saldoCiclo);
      const payoutUsado = payoutOverride !== undefined ? payoutOverride : prev.payout;
      let s = { ...prev };
      const entry: HistoryEntry = {
        tentativa: s.tentativaAtual,
        nivel: s.nivelAtual,
        entrada,
        resultado,
        bancaAtual: s.bancaAtual,
        timestamp: Date.now(),
      };

      if (resultado === 'win') {
        const lucro = +(entrada * payoutUsado).toFixed(2);
        s.saldoCiclo = +(s.saldoCiclo + lucro).toFixed(2);

        // Turbo bonus (agressivo)
        if (s.turbo && s.mode === 'agressivo') {
          s.saldoCiclo = +(s.saldoCiclo * 1.05).toFixed(2);
        }

        if (s.nivelAtual >= 4) {
          // Tentativa ganha - creditar saldoCiclo na banca
          s.bancaAtual = +(s.bancaAtual + s.saldoCiclo).toFixed(2);
          s.lucroSessao = +(s.lucroSessao + s.saldoCiclo - s.riscoOperacional).toFixed(2);
          s.tentativasGanhas++;
          s.perdaSequencial = 0;
          s.mensagem = `✅ Tentativa ${s.tentativaAtual} ganha! Soros x4 concluído. Lucro creditado na banca.`;
          entry.bancaAtual = s.bancaAtual;
          s.historico = [entry, ...s.historico].slice(0, 20);
          return iniciarProximaTentativa(s);
        } else {
          s.nivelAtual++;
          const proxEntrada = calcEntradaNivel(s.mode, s.nivelAtual, s.saldoCiclo);
          s.mensagem = `Win N${s.nivelAtual - 1}! Avançando para N${s.nivelAtual}. Entrada: R$ ${proxEntrada.toFixed(2)}`;
          entry.bancaAtual = s.bancaAtual;
          s.historico = [entry, ...s.historico].slice(0, 20);
          return s;
        }
      } else {
        // LOSS
        s.saldoCiclo = 0;
        s.tentativasPerdidas++;
        s.perdaSequencial++;
        s.lucroSessao = +(s.lucroSessao - s.riscoOperacional).toFixed(2);
        s.mensagem = `❌ Tentativa ${s.tentativaAtual} perdida. Perda máxima desta tentativa: R$ ${s.riscoOperacional.toFixed(2)}.`;
        entry.bancaAtual = s.bancaAtual;
        s.historico = [entry, ...s.historico].slice(0, 20);

        // Check conservador pause
        if (s.mode === 'conservador' && s.perdaSequencial >= 2) {
          s.pausado = true;
          s.mensagem += ' Pausa automática: 2 tentativas perdidas seguidas (modo conservador). Volte depois.';
          return s;
        }

        return iniciarProximaTentativa(s);
      }
    });
  }, []);

  const retomar = useCallback(() => {
    setState(prev => {
      if (!prev.pausado) return prev;
      let s = { ...prev, pausado: false };
      return iniciarProximaTentativa(s);
    });
  }, []);

  const resetar = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  return { state, iniciar, registrarResultado, retomar, resetar };
}

function iniciarProximaTentativa(s: SorosState): SorosState {
  // Check meta/stop
  if (s.metaDiaria > 0 && s.lucroSessao >= s.metaDiaria) {
    return { ...s, encerrado: true, mensagem: 'Meta atingida ✅. Gerenciamento encerrado hoje.', ativo: false };
  }
  if (s.stopDiario > 0 && Math.abs(s.lucroSessao) >= s.stopDiario && s.lucroSessao < 0) {
    return { ...s, encerrado: true, mensagem: 'Stop atingido 🚫. Gerenciamento encerrado hoje.', ativo: false };
  }

  // Check se tentativas esgotaram
  if (s.tentativasPerdidas >= s.tentativasTotal) {
    return { ...s, encerrado: true, mensagem: `🚫 Você atingiu o limite de perdas (${s.tentativasTotal}). Gerenciamento encerrado.`, ativo: false };
  }

  // Check banca suficiente
  const riscoOp = calcRiscoOperacional(s.mode, s.riscoBase);
  if (s.bancaAtual < riscoOp) {
    return { ...s, encerrado: true, mensagem: '🚫 Banca insuficiente para iniciar nova tentativa com o risco base atual.', ativo: false };
  }

  // Iniciar nova tentativa
  s.tentativaAtual++;
  s.bancaAtual = +(s.bancaAtual - riscoOp).toFixed(2);
  s.saldoCiclo = riscoOp;
  s.nivelAtual = 1;
  const proxEntrada = calcEntradaNivel(s.mode, 1, riscoOp);
  s.mensagem = `Tentativa ${s.tentativaAtual} iniciada. Entrada N1: R$ ${proxEntrada.toFixed(2)}`;
  return s;
}
